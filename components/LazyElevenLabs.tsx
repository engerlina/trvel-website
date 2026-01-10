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
    // Load after 5 seconds or on first user interaction
    const timeout = setTimeout(() => setShouldLoad(true), 5000);

    const handleInteraction = () => {
      setShouldLoad(true);
      cleanup();
    };

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });

    return cleanup;
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
