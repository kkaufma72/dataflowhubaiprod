import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Button from './common/Button';
import Card from './common/Card';
import toast from 'react-hot-toast';

// Load your Stripe publishable key from environment variables
// Make sure you have VITE_STRIPE_PUBLISHABLE_KEY set in your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');

interface PaymentFormProps {
  amount: number; // Amount in your currency unit (e.g., dollars)
  currency: string; // Currency code (e.g., 'usd')
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

const CheckoutForm: React.FC<Omit<PaymentFormProps, 'onPaymentSuccess' | 'onPaymentError'>> = ({ amount, currency }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Call your backend function to create a PaymentIntent
      const response = await fetch('/.netlify/functions/create-payment-intent', { // Assuming Netlify Functions endpoint or your Supabase Function URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      const clientSecret = data.clientSecret;

      // 2. Confirm the payment on the client side
      const cardElement = elements.get(CardElement);

      if (!cardElement) {
          throw new Error('Card Element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          // billing_details: { ... }
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'An unknown error occurred');
        toast.error(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        // Call the success handler passed from the parent component
        // props.onPaymentSuccess?.(); // You might want to trigger a success handler here
        console.log('PaymentIntent succeeded:', paymentIntent);
      } else {
         // Handle other payment statuses if necessary
         console.log('PaymentIntent status:', paymentIntent.status);
         toast(\`Payment status: ${paymentIntent.status}\`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Payment process error:', err);
       // Call the error handler passed from the parent component
      // props.onPaymentError?.(errorMessage); // You might want to trigger an error handler here
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-1">
          Credit or debit card
        </label>
        <div className="border border-gray-300 rounded-md p-3">
           <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#32325d',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                  iconColor: '#fa755a',
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <Button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : \`Pay ${amount} ${currency.toUpperCase()}\`}
      </Button>
    </form>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, currency, onPaymentSuccess, onPaymentError }) => {
  const options: StripeElementsOptions = {
    // passing the client secret obtained from the server
    clientSecret: undefined, // Will be fetched in CheckoutForm
    appearance: { /*...*/ }, // Customize the appearance of Elements
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Complete your payment</h2>
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm amount={amount} currency={currency} />
      </Elements>
    </Card>
  );
};

export default PaymentForm;
