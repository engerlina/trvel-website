'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Lazy-loads the ElevenLabs ConvAI widget after user interaction or scroll
 * This improves Lighthouse performance by not blocking initial page load
 */
export function LazyElevenLabs() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Load when main thread is idle (reduces TBT) or after 6s / first interaction
    const fallback = setTimeout(() => setShouldLoad(true), 6000);
    let idleId = 0;

    const handleInteraction = () => {
      setShouldLoad(true);
      clearTimeout(fallback);
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    if (typeof window.requestIdleCallback !== 'undefined') {
      idleId = window.requestIdleCallback(() => setShouldLoad(true), { timeout: 5500 });
    }

    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });

    return () => {
      clearTimeout(fallback);
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      {/* @ts-expect-error - Custom element not recognized by React */}
      <elevenlabs-convai agent-id="agent_7501kcncsd2rftrtv8ap6n6q4czt"></elevenlabs-convai>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
      />
    </>
  );
}
