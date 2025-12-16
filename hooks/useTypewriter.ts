'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
  delayAfterType?: number;
}

export function useTypewriter({
  words,
  typeSpeed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 500,
  delayAfterType = 2000,
}: UseTypewriterOptions) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const currentWord = words[wordIndex] || '';

  const tick = useCallback(() => {
    if (isWaiting) return;

    if (isDeleting) {
      // Deleting characters
      setText(currentWord.substring(0, text.length - 1));

      if (text.length === 0) {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsWaiting(true);
        setTimeout(() => setIsWaiting(false), delayBetweenWords);
      }
    } else {
      // Typing characters
      setText(currentWord.substring(0, text.length + 1));

      if (text.length === currentWord.length) {
        setIsWaiting(true);
        setTimeout(() => {
          setIsWaiting(false);
          setIsDeleting(true);
        }, delayAfterType);
      }
    }
  }, [text, isDeleting, isWaiting, currentWord, words.length, delayBetweenWords, delayAfterType]);

  useEffect(() => {
    const speed = isDeleting ? deleteSpeed : typeSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, typeSpeed, deleteSpeed]);

  return { text, wordIndex, isDeleting };
}
