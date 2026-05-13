import Stripe from 'stripe';
import emailSender from '../../utils/emailSender';

const handleStripeWebhooksEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) break;

      // ! update payment status
      await emailSender(
        'Payment Successful 🎉',
        session.customer_email as string,
        `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: green;">✅ Payment Confirmed</h2>

      <p>Hi there,</p>

      <p>Your payment has been successfully completed. 🎉</p>

      <p><strong>Amount:</strong> $${(session.amount_total as number) / 100} USD</p>

      <p>Thank you for your purchase!</p>

      <br/>
      <p style="font-size: 12px; color: gray;">
        If you have any questions, feel free to contact us.
      </p>
    </div>
  `,
      );

      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (!orderId) break;

      //    ! update payment stats and order status

      break;
    }

    case 'charge.succeeded': {
      const charge = event.data.object as Stripe.Charge;
      const orderId = charge.metadata?.orderId;

      if (!orderId) break;

      // await prisma.order.update({
      //     where: { id: orderId },
      //     data: {
      //         paymentStatus: PaymentStatus.PAID,
      //     },
      // });
      // console.log(`Order ${orderId} updated from charge.succeeded`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
};

// const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     mode: "payment",

//     customer_email: req.body.email,

//     line_items: [
//         {
//             price_data: {
//                 currency: "usd",
//                 product_data: {
//                     name: `Order #${123}`,
//                 },
//                 unit_amount: 100 * 100,
//             },
//             quantity: 1,
//         },
//     ],

//     metadata: {
//         orderId: 123,
//         userId: result.id,
//     },

//     success_url:
//         `${config.stripe.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

//     cancel_url:
//         `${config.stripe.frontendUrl}/payment/cancel`,
// });

export const PaymentService = {
  handleStripeWebhooksEvent,
};
