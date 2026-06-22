import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { prisma } from '../../prisma/prisma';
import emailSender from '../../utils/emailSender';
import { getCourseEnrollmentSuccessTemplate } from '../../utils/emailTemplates';

const handleStripeWebhooksEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentType = session.metadata?.paymentType;

      if (paymentType === 'COURSE_ENROLLMENT') {
        const userId = session.metadata?.userId;
        const courseId = session.metadata?.courseId;

        if (userId && courseId) {
          const [user, course] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.course.findUnique({ where: { id: courseId } }),
          ]);

          await prisma.enrollment.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId,
              },
            },
            update: {
              paymentStatus: PaymentStatus.PAID,
              transactionId: (session.payment_intent as string) || session.id,
              amountPaid: (session.amount_total as number) / 100,
            },
            create: {
              userId,
              courseId,
              paymentStatus: PaymentStatus.PAID,
              transactionId: (session.payment_intent as string) || session.id,
              amountPaid: (session.amount_total as number) / 100,
            },
          });

          const recipientEmail = user?.email || session.customer_details?.email || session.customer_email;

          if (recipientEmail) {
            await emailSender(
              'Course Enrollment Successful 🎉',
              recipientEmail,
              getCourseEnrollmentSuccessTemplate(
                user?.name || 'Student',
                course?.title || 'Course',
                (session.amount_total as number) / 100,
              ),
            );
          } else {
            console.error('Recipient email could not be determined for payment success webhook session:', session.id);
          }
        }
        break;
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
};

export const PaymentService = {
  handleStripeWebhooksEvent,
};
