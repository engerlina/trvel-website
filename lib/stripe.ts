import Stripe from 'stripe';
import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';

// Check if we're in test mode
export const isTestMode = process.env.TEST_MODE === 'true';

// Get the appropriate Stripe secret key based on mode
const getStripeSecretKey = () => {
  if (isTestMode) {
    return process.env.TEST_STRIPE_SECRET_KEY || '';
  }
  return process.env.STRIPE_SECRET_KEY || '';
};

// Get the appropriate publishable key based on mode
export const getStripePublishableKey = () => {
  if (isTestMode) {
    return process.env.TEST_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
};

// Get the appropriate webhook secret based on mode
export const getWebhookSecret = () => {
  if (isTestMode) {
    return process.env.TEST_STRIPE_WEBHOOK_SECRET || '';
  }
  return process.env.STRIPE_WEBHOOK_SECRET || '';
};

// Server-side Stripe client
export const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2023-10-16',
});

// Client-side Stripe instance
let stripePromise: Promise<StripeType | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(getStripePublishableKey());
  }
  return stripePromise;
};

// Helper function to create a payment intent
export async function createPaymentIntent(amount: number, currency: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}
