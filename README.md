# 🚀 TalkNative - English Practice Platform (API)

A **scalable, robust, and real-time backend API** built with **Node.js, Express, TypeScript, and Prisma**. This API powers the TalkNative platform, an innovative application designed to help users practice English through interactive courses, live video calls, and a supportive community.

## 🔗 Live URL
- **Production Server:** [https://talknative-english-practice-platform-api.onrender.com](https://talknative-english-practice-platform-api.onrender.com)
- **API Documentation (Postman):** See the included `TalkNative_API_Collection.json` for detailed endpoints.

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** Mongodb
- **Authentication:** JWT (JSON Web Tokens), OTP via Email (Brevo)
- **Real-time Communication:** Socket.io (Support Chat, Signaling)
- **Payments:** Stripe Integration
- **File Uploads:** Cloudinary (Multer for parsing)
- **Validation:** Zod
- **Caching:** Redis (Optional/Supported)

---

## 🎯 Key Features

### 🔐 Authentication & Authorization
- User Registration and Login.
- Email verification via OTP.
- Password recovery (Forgot / Reset Password).
- Role-based Access Control (Admin, User).

### 📚 Course & Lesson Management (LMS)
- Admins can create, update, publish, and delete courses.
- Manage lessons within courses (Video URLs, PDFs, Descriptions).
- Users can browse published courses and enroll.

### 💳 Payments & Enrollments
- Seamless integration with **Stripe** for course payments.
- Secure enrollment tracking and access control.
- Webhook endpoints to handle payment confirmations.

### 💬 Real-Time Support Chat
- Live support chat between Users and Admins using **Socket.io**.
- Ticket-based support system (Open, Active, Resolved).
- Typing indicators and real-time message delivery.
- Admins can view and manage all active tickets from the dashboard.

### 📹 Live Calling System
- User matchmaking and queueing system.
- Signaling endpoints for initializing WebRTC (Agora/PeerJS) video/audio calls.
- Peer rating and reporting system after calls.

### 📢 Announcements
- Admins can broadcast system alerts, feature updates, or promotions.
- Users receive real-time push/feed notifications.
- Email notifications dispatched automatically to all users upon publishing urgent announcements.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally (or a cloud DB URL).
- Redis (Optional, if caching/queues are enabled).

### 2. Installation

Clone the repository and install dependencies:
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Create a \`.env\` file in the root directory based on the \`.env.example\` file. You will need:
\`\`\`env
# App
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="mongodb+srv://user:password@cluster0.mongodb.net/talknative_db?retryWrites=true&w=majority"

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

# Email / Nodemailer
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
\`\`\`

### 4. Database Setup (Prisma)
Run the following commands to generate the Prisma client and push the schema to your database:
\`\`\`bash
# Generate the Prisma Client
npx prisma generate

# Push the schema to the DB
npx prisma db push
\`\`\`

*(Optional) Seed the database with a default Admin account:*
\`\`\`bash
npm run seed
\`\`\`

### 5. Running the Application
\`\`\`bash
# Run in development mode (with nodemon & ts-node-dev)
npm run dev

# Build for production
npm run build

# Start production build
npm start
\`\`\`

---

## 📁 Folder Structure

\`\`\`
src/
├── app/
│   ├── config/            # Environment configurations
│   ├── errors/            # Global error handlers
│   ├── middlewares/       # Auth, Validation, Error middlewares
│   ├── modules/           # Feature modules (Controller, Service, Route, Validation)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── course/
│   │   ├── lesson/
│   │   ├── chat/
│   │   ├── call/
│   │   └── ...
│   ├── routes/            # Main API router index
│   └── utils/             # Helper functions (QueryBuilder, EmailSender, etc.)
├── prisma/                # Prisma schema and migrations
└── server.ts              # Entry point & Server setup
\`\`\`

---

## 🛡 Security & Best Practices
- **Data Validation:** All incoming request bodies, queries, and params are strictly validated using **Zod** before hitting controllers.
- **Error Handling:** Centralized Global Error Handler catches and formats all exceptions seamlessly.
- **Async Handling:** Wrappers (`catchAsync`) eliminate the need for repetitive try-catch blocks.
- **Database Integrity:** Designed robustly with Prisma ensuring referential integrity and smooth document management via MongoDB.

---

## 📝 License
This project is proprietary and intended for TalkNative operations.
