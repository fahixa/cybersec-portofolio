import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xs: 'w-8 h-8'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]} 
        relative rounded-2xl transition-all duration-500 ease-out
        flex items-center justify-center group
        ${isDark 
          ? 'bg-slate-800/80 hover:bg-slate-700/90 border border-emerald-400/20 hover:border-emerald-400/40 text-emerald-400 hover:text-emerald-300' 
          : 'bg-white/90 hover:bg-blue-50/90 border border-blue-200/60 hover:border-blue-300/80 text-blue-600 hover:text-blue-700 shadow-sm hover:shadow-md'
        }
        backdrop-blur-sm
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark ? 'focus:ring-emerald-400/50' : 'focus:ring-blue-400/50'}
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background glow effect - subtle */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
        ${isDark 
          ? 'bg-gradient-to-br from-emerald-400/5 to-cyan-400/5' 
          : 'bg-gradient-to-br from-blue-400/5 to-indigo-400/5'
        }
      `} />

      {/* Icon container with smooth transitions */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
          className={`
            ${iconSizes[size]} 
            absolute transition-all duration-700 ease-in-out transform
            ${isDark 
              ? 'opacity-0 scale-50 rotate-180' 
              : 'opacity-100 scale-100 rotate-0'
            }
          `}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`
            ${iconSizes[size]} 
            absolute transition-all duration-700 ease-in-out transform
            ${isDark 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-50 -rotate-180'
            }
          `}
        />
      </div>

      {/* Subtle pulse effect on hover */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-all duration-300
        ${isDark 
          ? 'bg-emerald-400 animate-pulse' 
          : 'bg-blue-400 animate-pulse'
        }
      `} />
    </button>
  );
};