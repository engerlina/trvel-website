'use client';

import { useState, useEffect } from 'react';

interface Order {
  order_number: string;
  destination_name: string;
  plan_name: string;
  duration: number;
  amount_cents: number;
  currency: string;
  esim_qr_code: string | null;
  esim_status: string;
  status: string;
}

interface OrderStatusProps {
  sessionId: string;
  translations: {
    nextSteps: string;
    step1: string;
    step2: string;
    step3: string;
  };
}

// Fun loading messages that cycle every 2 seconds
const LOADING_MESSAGES = [
  'Preparing your eSIM...',
  'Connecting to satellite network...',
  'Warming up the data pipes...',
  'Downloading vacation mode...',
  'Activating travel superpowers...',
  'Summoning digital nomad energy...',
  'Configuring wanderlust protocol...',
  'Spinning up your connection...',
  'Crossing the digital border...',
  'Packing your bits and bytes...',
  'Charging the signal boosters...',
  'Aligning the cellular stars...',
  'Brewing fresh connectivity...',
  'Teaching your phone new tricks...',
  'Rolling out the digital welcome mat...',
  'Syncing with adventure mode...',
  'Turbo-charging your travels...',
  'Assembling your digital passport...',
  'Fueling up the data tanks...',
  'Almost there, hang tight...',
];

export default function OrderStatus({ sessionId, translations }: OrderStatusProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<'pending' | 'processing' | 'ready'>('pending');
  const [pollCount, setPollCount] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (status === 'ready') return;

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(messageInterval);
  }, [status]);

  useEffect(() => {
    if (!sessionId) return;

    const pollOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${sessionId}`);
        const data = await response.json();

        if (data.order) {
          setOrder(data.order);
          setStatus(data.status);

          // Stop polling if QR code is ready
          if (data.status === 'ready') {
            return true; // Signal to stop polling
          }
        }

        setPollCount((prev) => prev + 1);
        return false; // Continue polling
      } catch (error) {
        console.error('Error fetching order:', error);
        return false;
      }
    };

    // Initial poll
    pollOrder();

    // Poll every 2 seconds for up to 60 seconds (30 attempts)
    const intervalId = setInterval(async () => {
      const shouldStop = await pollOrder();
      if (shouldStop || pollCount >= 30) {
        clearInterval(intervalId);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [sessionId, pollCount]);

  // Loading skeleton
  if (status === 'pending') {
    return (
      <div className="space-y-6">
        {/* Order Details Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-soft animate-pulse">
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-cream-200 rounded w-16"></div>
              <div className="h-4 bg-cream-200 rounded w-32"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-cream-200 rounded w-20"></div>
              <div className="h-4 bg-cream-200 rounded w-24"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-cream-200 rounded w-12"></div>
              <div className="h-4 bg-cream-200 rounded w-28"></div>
            </div>
          </div>
        </div>

        {/* QR Code Skeleton */}
        <div className="bg-white rounded-2xl p-6 border-2 border-brand-200 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-5 h-5 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-semibold text-navy-500 transition-opacity duration-300">
                {LOADING_MESSAGES[messageIndex]}
              </span>
            </div>
            <div className="bg-cream-100 rounded-xl p-4 mb-4 animate-pulse">
              <div className="w-[200px] h-[200px] bg-cream-200 rounded"></div>
            </div>
            <p className="text-sm text-navy-300">This usually takes just a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  // Processing state (order exists but no QR code yet)
  if (status === 'processing' && order) {
    return (
      <div className="space-y-6">
        {/* Order Details */}
        <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-soft text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="text-navy-300 text-sm">Order</span>
            <span className="font-mono text-sm font-medium text-navy-500">{order.order_number}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-navy-300 text-sm">Destination</span>
            <span className="font-medium text-navy-500">{order.destination_name}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-navy-300 text-sm">Plan</span>
            <span className="font-medium text-navy-500">{order.plan_name} ({order.duration} days)</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-cream-200">
            <span className="font-semibold text-navy-500">Total</span>
            <span className="font-bold text-brand-500 text-lg">
              {order.currency} {(order.amount_cents / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Processing QR Code */}
        <div className="bg-white rounded-2xl p-6 border-2 border-brand-200 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-5 h-5 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-semibold text-navy-500 transition-opacity duration-300">
                {LOADING_MESSAGES[messageIndex]}
              </span>
            </div>
            <div className="bg-cream-100 rounded-xl p-4 mb-4 animate-pulse">
              <div className="w-[200px] h-[200px] bg-cream-200 rounded flex items-center justify-center">
                <svg className="w-16 h-16 text-cream-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-navy-300">Your QR code will appear here shortly</p>
          </div>
        </div>
      </div>
    );
  }

  // Ready state - show QR code
  if (status === 'ready' && order) {
    return (
      <div className="space-y-6">
        {/* Order Details */}
        <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-soft text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="text-navy-300 text-sm">Order</span>
            <span className="font-mono text-sm font-medium text-navy-500">{order.order_number}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-navy-300 text-sm">Destination</span>
            <span className="font-medium text-navy-500">{order.destination_name}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-navy-300 text-sm">Plan</span>
            <span className="font-medium text-navy-500">{order.plan_name} ({order.duration} days)</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-cream-200">
            <span className="font-semibold text-navy-500">Total</span>
            <span className="font-bold text-brand-500 text-lg">
              {order.currency} {(order.amount_cents / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 border-2 border-brand-300 shadow-soft">
          <h2 className="font-semibold mb-4 text-navy-500 flex items-center justify-center gap-2">
            <span>Your eSIM QR Code</span>
          </h2>

          <div className="bg-cream-50 rounded-xl p-4 inline-block mb-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.esim_qr_code!)}`}
              alt="eSIM QR Code"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>

          <p className="text-sm text-navy-300 mb-4">
            Scan this code from another device to install your eSIM
          </p>

          <div className="bg-brand-50 rounded-xl p-4 text-left">
            <p className="text-sm font-medium text-brand-600 mb-2">Quick Install Steps:</p>
            <ol className="text-xs text-navy-400 space-y-1">
              <li><strong>iPhone:</strong> Settings → Mobile Data → Add eSIM → Use QR Code</li>
              <li><strong>Android:</strong> Settings → Network → SIMs → Add eSIM</li>
              <li>Enable <strong>Data Roaming</strong> when you land!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - no order found after polling
  return (
    <div className="bg-white rounded-2xl p-6 mb-8 border border-cream-300 shadow-soft">
      <h2 className="font-semibold mb-4 text-navy-500">{translations.nextSteps}</h2>
      <ol className="text-left text-sm text-navy-300 space-y-3">
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-brand-400 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
          <span>{translations.step1}</span>
        </li>
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-brand-400 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
          <span>{translations.step2}</span>
        </li>
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-brand-400 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
          <span>{translations.step3}</span>
        </li>
      </ol>
    </div>
  );
}
