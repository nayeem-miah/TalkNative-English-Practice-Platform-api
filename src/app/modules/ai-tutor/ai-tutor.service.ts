/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../config';
import { prisma } from '../../prisma/prisma';

const BASE_SYSTEM_INSTRUCTION = `You are TalkNative AI, an intelligent, friendly, and adaptive English Language Tutor on the TalkNative platform. Your goal is to help users learn and practice English naturally, efficiently, and recommend TalkNative courses when appropriate.

CRITICAL DYNAMIC RESPONSE RULES:
1. SIMPLE MESSAGES & GREETINGS (e.g. "hi", "hello", "how are you", "thanks", "ok", simple chat):
   - Keep your response brief, warm, and natural (1 to 2 short sentences max).
   - Do NOT output long templates, headers, or bullet lists for simple greetings.
   - Example: "Hello! 👋 How are you doing today? What would you like to practice in English?"

2. COURSE INQUIRIES & RECOMMENDATIONS:
   - When the user asks about courses, what course to enroll in, course recommendations, prices, or how to learn English systematically:
   - Recommend matching courses from the OFFICIAL TALKNATIVE PLATFORM COURSES list below.
   - Explain briefly why that course matches their target goal.
   - Always mention the price and provide the course link in markdown format: [Course Title](/courses/course-id).

3. SENTENCE CORRECTIONS & SHORT QUESTIONS:
   - Be concise and clear.
   - Show the **Corrected Sentence** in a blockquote (>).
   - Explain the key error in 1-2 short bullet points.

4. DETAILED EXPLANATIONS (e.g. "explain IELTS speaking", "detailed rules of past tense", "difference between X and Y", "give me idioms"):
   - Provide structured, in-depth explanations with clean headers (##), practical examples, and a quick practice question.

5. FORMATTING RULES:
   - Use clean, modern markdown (bold headers ##, bullet points -, blockquotes >).
   - Never output raw ASCII table borders (like |---|---| or -------); use clean bullet lists instead for comparisons.
   - If the user speaks Bengali or requests translation, provide English with friendly Bengali guidance.`;

const generateAiTutorResponse = async (payload: { message: string; history?: any[] }) => {
  const { message, history = [] } = payload;

  if (!message || typeof message !== "string") {
    throw new Error("Message is required");
  }

  // Fetch published courses dynamically from database
  let courseContext = "";
  try {
    const publishedCourses = await prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        level: true,
        type: true,
      },
      take: 10,
    });

    if (publishedCourses && publishedCourses.length > 0) {
      courseContext = `\n\nOFFICIAL TALKNATIVE PLATFORM COURSES (Recommend these when user asks about courses, suggestions, or pricing):\n` +
        publishedCourses.map((c) => `- **${c.title}** (Level: ${c.level || "All Levels"}, Price: $${c.price || 0}, Type: ${c.type || "FREE"})\n  Description: ${c.description || "Interactive English Course"}\n  Link: [Enroll in ${c.title}](/courses/${c.id})`).join("\n");
    } else {
      courseContext = `\n\nOFFICIAL TALKNATIVE PLATFORM COURSES:\nWe offer Spoken English, IELTS Preparation, and Business English courses. Direct users to check our [/courses](/courses) page.`;
    }
  } catch (err) {
    console.warn("Could not fetch courses for AI context:", err);
  }

  const fullSystemInstruction = BASE_SYSTEM_INSTRUCTION + courseContext;

  const apiKey = config.gemini_api_key;
  let replyText = "";
  if (apiKey) {
    replyText = await fetchGeminiAI(message, history, apiKey, fullSystemInstruction);
  }
  if (!replyText) {
    replyText = await fetchFreeAI(message, history, fullSystemInstruction);
  }
  if (!replyText) {
    replyText = generateFallbackResponse(message);
  }

  return { reply: replyText };
};

async function fetchGeminiAI(
  message: string,
  history: any[],
  apiKey: string,
  systemInstruction: string
): Promise<string> {
  const contents = [
    {
      role: "user",
      parts: [{ text: systemInstruction }],
    },
    ...history.map((msg: { role: string; content?: string; text?: string }) => ({
      role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.content || msg.text || "" }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const modelNames = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

  for (const model of modelNames) {
    const authHeadersList: Record<string, string>[] = [
      { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    ];

    for (const headers of authHeadersList) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ contents }),
        });

        const data = (await res.json()) as any;

        if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch {}
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      const data = (await res.json()) as any;

      if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch {}
  }

  return "";
}

async function fetchFreeAI(
  message: string,
  history: any[],
  systemInstruction: string
): Promise<string> {
  try {
    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...history.map((m: { role: string; content?: string; text?: string }) => ({
        role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
        content: m.content || m.text || "",
      })),
      { role: "user", content: message },
    ];

    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formattedMessages,
        model: "openai",
      }),
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn("Free AI Engine error:", err);
  }

  return "";
}

function generateFallbackResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase().trim();

  if (["hi", "hello", "hey", "hola"].some((g) => lower.startsWith(g))) {
    return "Hello! 👋 How are you doing today? What would you like to practice in English?";
  }

  if (lower.includes("course") || lower.includes("kors") || lower.includes("recommend")) {
    return `### 📚 TalkNative Recommended Courses\n\nWe offer specialized courses for English fluency:\n\n- **Spoken English Mastery**: Perfect for building natural speaking confidence.\n- **IELTS Preparation**: Targeted strategies & mock practice for Band 7+.\n\nCheck out our full course list at [/courses](/courses)!`;
  }

  if (lower.includes("correct") || lower.includes("check")) {
    return `### 📝 Sentence Correction\n\n> **"I want to improve my English speaking and grammar skills."**\n\n- Keep your subject and verb aligned in tense.`;
  }

  if (lower.includes("since") || lower.includes("for")) {
    return `### 🔍 'Since' vs 'For'\n\n- **Since**: Specific point in time (*since 2020, since morning*).\n- **For**: Duration of time (*for 2 hours, for 5 years*).`;
  }

  return "Hello! 👋 How can I help you practice your English today?";
}

export const AiTutorService = {
  generateAiTutorResponse,
};
