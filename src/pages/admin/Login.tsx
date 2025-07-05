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
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  
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

  // Handle account lockout
  useEffect(() => {
    const lockData = localStorage.getItem('cybersec-login-lock');
    if (lockData) {
      const { lockUntil, attempts: savedAttempts } = JSON.parse(lockData);
      const now = Date.now();
      
      if (now < lockUntil) {
        setIsLocked(true);
        setLockTimeRemaining(Math.ceil((lockUntil - now) / 1000));
        setAttempts(savedAttempts);
        
        const interval = setInterval(() => {
          const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
          if (remaining <= 0) {
            setIsLocked(false);
            setLockTimeRemaining(0);
            localStorage.removeItem('cybersec-login-lock');
            clearInterval(interval);
          } else {
            setLockTimeRemaining(remaining);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        localStorage.removeItem('cybersec-login-lock');
        setAttempts(savedAttempts);
      }
    }
  }, []);

  // Secure input sanitization
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim()
      .slice(0, 100); // Limit length
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Account locked. Try again in ${lockTimeRemaining} seconds.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = password.slice(0, 100); // Don't sanitize password content, just limit length

      await signIn(sanitizedEmail, sanitizedPassword);
      
      // Clear failed attempts on successful login
      localStorage.removeItem('cybersec-login-lock');
      setAttempts(0);
      
      const from = (location.state as any)?.from?.pathname || '/authorize/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        // Lock account for 15 minutes after 3 failed attempts
        const lockUntil = Date.now() + (15 * 60 * 1000);
        localStorage.setItem('cybersec-login-lock', JSON.stringify({
          lockUntil,
          attempts: newAttempts
        }));
        setIsLocked(true);
        setLockTimeRemaining(15 * 60);
        setError('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        setError(`${error.message} (${3 - newAttempts} attempts remaining)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@cybersec.local');
    setPassword('CyberSec2024!');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center relative overflow-hidden px-4 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100/20 via-gray-50 to-blue-100/20 dark:from-red-900/20 dark:via-black dark:to-green-900/20 transition-colors duration-300"></div>
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-green-500/30 rounded-lg p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors duration-300">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center border border-red-300 dark:border-red-500/50 transition-colors duration-300">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400 transition-colors duration-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 font-mono mb-2 transition-colors duration-300">
              <GlitchText text="RESTRICTED ACCESS" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Authorization Required</p>
          </div>

          {/* Security Warning */}
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm transition-colors duration-300">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Security Notice:</p>
                <p className="text-xs">Unauthorized access attempts are logged and monitored.</p>
              </div>
            </div>
          </div>

          {/* Demo Credentials (for development only) */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm transition-colors duration-300">
            <div className="flex items-start">
              <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-2">Demo Access:</p>
                <p className="font-mono text-xs mb-1">Email: admin@cybersec.local</p>
                <p className="font-mono text-xs mb-3">Password: CyberSec2024!</p>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  disabled={isLocked}
                  className="text-blue-600 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-200 underline text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  Auto-fill credentials
                </button>
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

          {/* Lockout Timer */}
          {isLocked && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-500/50 text-yellow-700 dark:text-yellow-400 p-3 rounded-lg mb-4 sm:mb-6 text-sm text-center transition-colors duration-300">
              <Lock className="w-5 h-5 mx-auto mb-2" />
              <p className="font-semibold">Account Locked</p>
              <p className="text-xs">Time remaining: {formatTime(lockTimeRemaining)}</p>
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
                disabled={isLocked}
                className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors duration-300"
                placeholder="Enter your email"
                maxLength={100}
                required
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
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors duration-300"
                  placeholder="Enter your password"
                  maxLength={100}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
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
                  {isLocked ? 'Account Locked' : 'Authorize Access'}
                </>
              )}
            </button>
          </form>

          {/* Attempt Counter */}
          {attempts > 0 && !isLocked && (
            <div className="mt-4 text-center text-xs text-yellow-600 dark:text-yellow-400 transition-colors duration-300">
              Failed attempts: {attempts}/3
            </div>
          )}

          <div className="mt-4 sm:mt-6 text-center text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
            Secure authentication system
          </div>
        </div>
      </div>
    </div>
  );
}