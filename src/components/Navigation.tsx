import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, FileText, User, BookOpen, Menu, X } from 'lucide-react';
import GlitchText from './GlitchText';
import { ThemeToggle } from './ThemeToggle';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/writeups', label: 'Write-ups', icon: FileText },
    { path: '/articles', label: 'Articles', icon: BookOpen },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="bg-white/95 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-green-500/30 sticky top-0 z-50 transition-colors duration-300 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMobileMenu}>
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-green-400 transition-colors duration-300" />
            <div className="hidden sm:block">
              <GlitchText 
                text="CyberSec Portfolio" 
                className="text-lg sm:text-xl font-bold text-blue-600 dark:text-green-400 transition-colors duration-300"
              />
            </div>
            <div className="block sm:hidden">
              <GlitchText 
                text="CyberSec" 
                className="text-lg font-bold text-blue-600 dark:text-green-400 transition-colors duration-300"
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(path) 
                    ? 'text-blue-700 dark:text-green-400 bg-blue-50 dark:bg-green-400/10 border border-blue-200 dark:border-green-400/30 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-green-400/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{label}</span>
                <span className="lg:hidden">{label.split('-')[0]}</span>
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <ThemeToggle size="sm" />
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle size="sm" />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-green-400/10 transition-colors duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-green-500/30 bg-white/98 dark:bg-black/95 backdrop-blur-sm transition-colors duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive(path) 
                      ? 'text-blue-700 dark:text-green-400 bg-blue-50 dark:bg-green-400/10 border border-blue-200 dark:border-green-400/30' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-green-400/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};