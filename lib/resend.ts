import { Resend } from 'resend';

// Initialize Resend client - will fail gracefully if API key is missing
export const resend = new Resend(process.env.RESEND_API_KEY || '');
