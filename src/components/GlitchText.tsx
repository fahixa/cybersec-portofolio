import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [glitchText, setGlitchText] = useState(text);

  useEffect(() => {
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let isGlitching = false;

    const glitch = () => {
      if (isGlitching) return;
      isGlitching = true;

      const steps = 3;
      const stepDelay = 50;

      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          setGlitchText(
            text
              .split('')
              .map((char) => {
                if (Math.random() > 0.8) {
                  return chars[Math.floor(Math.random() * chars.length)];
                }
                return char;
              })
              .join('')
          );

          if (i === steps - 1) {
            setTimeout(() => {
              setGlitchText(text);
              isGlitching = false;
            }, stepDelay);
          }
        }, i * stepDelay);
      }
    };

    const interval = setInterval(glitch, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={`relative ${className}`}>
      <span className="relative z-10">{glitchText}</span>
      <span className="absolute top-0 left-0 text-blue-500 dark:text-cyan-400 opacity-50 animate-pulse">
        {text}
      </span>
      <span className="absolute top-0 left-0 text-purple-600 dark:text-purple-500 opacity-30 transform translate-x-0.5 translate-y-0.5">
        {text}
      </span>
    </span>
  );
}