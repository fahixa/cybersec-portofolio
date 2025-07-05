import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GlitchText from '../../components/GlitchText';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/authorize/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Secure input sanitization
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = password.slice(0, 100); // Don't sanitize password content, just limit length

      if (!sanitizedEmail || !sanitizedPassword) {
        throw new Error('Email and password are required');
      }

      if (sanitizedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await signIn(sanitizedEmail, sanitizedPassword);
      const from = (location.state as any)?.from?.pathname || '/authorize/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center relative overflow-hidden px-4 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-gray-50 to-purple-100/20 dark:from-blue-900/20 dark:via-black dark:to-green-900/20 transition-colors duration-300"></div>
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-green-500/30 rounded-lg p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors duration-300">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-blue-100 dark:bg-green-500/20 rounded-full flex items-center justify-center border border-blue-300 dark:border-green-500/50 transition-colors duration-300">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-green-400 transition-colors duration-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-green-400 font-mono mb-2 transition-colors duration-300">
              <GlitchText text="ADMIN ACCESS" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
              Secure authentication required
            </p>
          </div>

          {/* Security Warning */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm transition-colors duration-300">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Security Notice:</p>
                <p className="text-xs">
                  All access attempts are logged and monitored. Authorized personnel only.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 sm:mb-6 text-sm transition-colors duration-300">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 text-sm transition-colors duration-300"
                placeholder="Enter your email"
                maxLength={254}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 100))}
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 pr-10 text-sm transition-colors duration-300"
                  placeholder="Enter your password"
                  minLength={6}
                  maxLength={100}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white dark:text-black font-bold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Admin Info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600/30 transition-colors duration-300">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Admin Access Only</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This system is restricted to authorized administrators only. 
              If you need access, please contact the system administrator.
            </p>
          </div>

          <div className="mt-4 sm:mt-6 text-center text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
            Powered by Supabase Authentication
          </div>
        </div>
      </div>
    </div>
  );
}