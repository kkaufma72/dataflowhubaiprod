import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // Adjust the import path if necessary
import Stripe from 'stripe';

// Initialize Supabase client (if you need to interact with your database)
const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role key for database operations
);

// Initialize Stripe client
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10', // Replace with your desired API version
});

// Get your webhook secret from Supabase Secrets
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Helper function for structured logging
const log = (level: 'info' | 'error' | 'warn', message: string, context?: any) => {
  console[level](JSON.stringify({ message, level, ...context }));
};

Deno.serve(async (req) => {
  // Generate a request ID for tracing
  const requestId = crypto.randomUUID();
  const context = { requestId };

  if (req.method !== 'POST') {
    log('warn', 'Method Not Allowed', { ...context, method: req.method });
    return new Response('Method Not Allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    log('error', 'Stripe-Signature header missing', context);
    return new Response('No Stripe-Signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Read the raw request body
    const rawBody = await req.text();

    // Verify the webhook signature and construct the event
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret ?? '' // Use the webhook secret from environment variables
    );
    log('info', 'Webhook signature verification successful', { ...context, eventType: event.type, eventId: event.id });

  } catch (err) {
    log('error', 'Webhook signature verification failed', { ...context, error: err.message, stack: err.stack });
    // On error, return a 400 status code to Stripe
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        log('info', 'Handling payment_intent.succeeded', { ...context, paymentIntentId: paymentIntent.id, amount: paymentIntent.amount, currency: paymentIntent.currency, status: paymentIntent.status });

        // *** Implement your database update logic here for successful payment ***
        // This is where you would typically update your application's database
        // to reflect that a payment was successful.
        // You might need to retrieve information from the PaymentIntent's metadata
        // to link it to a user, order, or subscription.

        console.log('Full PaymentIntent object:', paymentIntent);

        // Example: If this payment intent is associated with a subscription's first payment,
        // you would verify the subscription and update the user's access level.
        // const stripeCustomerId = paymentIntent.customer; // Get the Stripe Customer ID
        // const subscriptionId = paymentIntent.latest_charge?.subscription; // If linked to a subscription

        // if (subscriptionId) {
        //    // Retrieve subscription details from Stripe or your database
        //    // Update user permissions/role based on the subscription plan (15/m, 50/m, 125/m)
        //    log('info', 'Payment intent succeeded for subscription', { ...context, paymentIntentId: paymentIntent.id, subscriptionId });
        //    // Example: await updateSubscriptionStatusInDB(stripeCustomerId, subscriptionId, 'active');
        // } else {
        //    // Handle one-time payment success (if applicable)
        //    log('info', 'Payment intent succeeded for one-time purchase', { ...context, paymentIntentId: paymentIntent.id });
        //    // Example: await fulfillOrder(paymentIntent.metadata.orderId);
        // }

        // *******************************************************************

        break;

      case 'customer.subscription.created':
         const subscriptionCreated = event.data.object as Stripe.Subscription;
         log('info', 'Handling customer.subscription.created', { ...context, subscriptionId: subscriptionCreated.id, customerId: subscriptionCreated.customer });
         // *** Implement logic for new subscription creation ***
         // This is where you would record the new subscription in your database
         // and potentially update the user's role or access level based on the plan.
         console.log('Subscription Created object:', subscriptionCreated);
         // Example: await createSubscriptionRecordInDB(subscriptionCreated);
         // Example: await updateUserRole(subscriptionCreated.customer, subscriptionCreated.plan.id);
         break;

      case 'customer.subscription.updated':
         const subscriptionUpdated = event.data.object as Stripe.Subscription;
          const previousAttributes = event.data.previous_attributes as Stripe.Subscription;
         log('info', 'Handling customer.subscription.updated', { ...context, subscriptionId: subscriptionUpdated.id, customerId: subscriptionUpdated.customer, previousStatus: previousAttributes.status, currentStatus: subscriptionUpdated.status });
          // *** Implement logic for subscription updates (e.g., plan changes, renewals, cancellations) ***
          // Update the subscription record and user's role/access level in your database.
          console.log('Subscription Updated object:', subscriptionUpdated);
         // Example: await updateSubscriptionRecordInDB(subscriptionUpdated);
         // Example: await updateUserRole(subscriptionUpdated.customer, subscriptionUpdated.plan.id);
         break;

       case 'customer.subscription.deleted':
         const subscriptionDeleted = event.data.object as Stripe.Subscription;
         log('info', 'Handling customer.subscription.deleted', { ...context, subscriptionId: subscriptionDeleted.id, customerId: subscriptionDeleted.customer });
         // *** Implement logic for subscription cancellations/deletions ***
         // Update the subscription record and revoke the user's role/access level in your database.
         console.log('Subscription Deleted object:', subscriptionDeleted);
         // Example: await deleteSubscriptionRecordFromDB(subscriptionDeleted.id);
         // Example: await revokeUserRole(subscriptionDeleted.customer);
          break;

      case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          log('info', 'Handling invoice.payment_succeeded', { ...context, invoiceId: invoice.id, subscriptionId: invoice.subscription, customerId: invoice.customer });
           // This event is often sent after payment_intent.succeeded for subscriptions.
           // You can use this to confirm recurring payment success.
           console.log('Invoice Payment Succeeded object:', invoice);
           // Example: await handleRecurringPaymentSuccess(invoice);
          break;

      // Add other event types you need to handle (e.g., invoice.payment_failed, charge.refunded)
      case 'charge.refunded':
        const charge = event.data.object as Stripe.Charge;
        log('info', 'Handling charge.refunded', { ...context, chargeId: charge.id });
        // Handle refunds - update your database to reflect the refund
        console.log('Charge Refunded object:', charge);
        // Example: await handleRefund(charge.id);
        break;

      default:
        // Unexpected event type
        log('warn', 'Unhandled event type', { ...context, eventType: event.type });
    }

    // Return a 200 response to acknowledge receipt of the event
    // Stripe expects a 200 status code within a reasonable time (usually 30 seconds)
    // even if your internal processing takes longer. You might want to
    // use a queue or background job for complex processing.
    return new Response('Received', { status: 200 });

  } catch (error) {
    log('error', 'Error handling event', { ...context, eventType: event.type, error: error.message, stack: error.stack });
     // On error, return a 500 status code to Stripe so it knows to retry
    return new Response('Error handling event', { status: 500 });
  }
});
