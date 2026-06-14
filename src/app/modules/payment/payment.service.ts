import Stripe from 'stripe';
import emailSender from '../../utils/emailSender';
import { prisma } from '../../prisma/prisma';
import { PaymentStatus } from '@prisma/client';
import { getCourseEnrollmentSuccessTemplate, getPaymentSuccessTemplate } from '../../utils/emailTemplates';

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
 
          await emailSender(
            'Course Enrollment Successful 🎉',
            session.customer_email as string,
            getCourseEnrollmentSuccessTemplate(
              user?.name || 'Student',
              course?.title || 'Course',
              (session.amount_total as number) / 100,
            ),
          );
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
