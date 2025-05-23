import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // Adjust the import path if necessary
import Stripe from 'stripe';

// Initialize Supabase client (optional for this function, but good practice)
const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
);

// Initialize Stripe client
// Use Stripe API version from your Stripe dashboard settings
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10', // Replace with your desired API version
});

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

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    log('error', 'Failed to parse request body as JSON', { ...context, error: error.message });
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { amount, currency } = payload;
  const requestContext = { ...context, amount, currency };

  log('info', 'Received request to create payment intent', requestContext);

  // *** Input Validation ***
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    log('error', 'Validation Error: Missing or invalid amount', requestContext);
    return new Response(JSON.stringify({ error: 'Valid amount (number > 0) is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!currency || typeof currency !== 'string') {
     log('error', 'Validation Error: Missing or invalid currency', requestContext);
    return new Response(JSON.stringify({ error: 'Valid currency (string) is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  log('info', 'Input validation successful', requestContext);
  // *** End Input Validation ***

  try {
    // Create a PaymentIntent with the amount and currency
    log('info', 'Calling Stripe to create PaymentIntent', requestContext);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      // Add any additional parameters here, e.g., metadata, description
    });
    log('info', 'PaymentIntent created successfully', { ...requestContext, paymentIntentId: paymentIntent.id });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('error', 'Error creating PaymentIntent', { ...requestContext, error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
