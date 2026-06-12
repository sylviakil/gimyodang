'use client';
import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;     // ms per character
  delay?: number;     // initial delay ms
  className?: string;
  onDone?: () => void;
}

export default function Typewriter({
  text,
  speed = 40,
  delay = 0,
  className = '',
  onDone,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setStarted(false);
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [text, delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed, onDone]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 bg-current opacity-70 animate-pulse ml-px align-middle" />
      )}
    </span>
  );
}
