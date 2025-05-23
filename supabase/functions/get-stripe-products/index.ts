import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // Adjust the import path if necessary
import Stripe from 'stripe';

// Initialize Supabase client (if needed for future database interactions)
const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize Stripe client
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

  if (req.method !== 'GET') {
    log('warn', 'Method Not Allowed', { ...context, method: req.method });
    return new Response('Method Not Allowed', { status: 405 });
  }

   log('info', 'Received request to get Stripe products', context);

  try {
    // Fetch active products and their prices from Stripe
    // You might want to filter products based on metadata or other criteria
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'], // Automatically get price details
    });

    // Filter out products without a default price or if you have other criteria
    const relevantProducts = products.data.filter(product => product.default_price);

    log('info', 'Successfully fetched Stripe products', { ...context, productCount: relevantProducts.length });

    // Return the products and prices
    return new Response(JSON.stringify({ products: relevantProducts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('error', 'Error fetching Stripe products', { ...context, error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
