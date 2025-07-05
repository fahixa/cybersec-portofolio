import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function AnimatedCard({ 
  children, 
  className = '', 
  glowColor = 'green' 
}: AnimatedCardProps) {
  const glowClasses = {
    green: 'hover:shadow-lg dark:hover:shadow-green-400/20 border-gray-200 dark:border-green-500/30 hover:border-blue-300 dark:hover:border-green-400/50 shadow-sm dark:shadow-none',
    cyan: 'hover:shadow-lg dark:hover:shadow-cyan-400/20 border-gray-200 dark:border-cyan-500/30 hover:border-blue-300 dark:hover:border-cyan-400/50 shadow-sm dark:shadow-none',
    purple: 'hover:shadow-lg dark:hover:shadow-purple-400/20 border-gray-200 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-400/50 shadow-sm dark:shadow-none',
  }[glowColor];

  return (
    <div className={`
      bg-white dark:bg-black/60 backdrop-blur-sm border rounded-lg p-4 sm:p-6 
      transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl
      ${glowClasses} ${className}
    `}>
      {children}
    </div>
  );
}