import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Dummy user type untuk testing
interface DummyUser {
  id: string;
  email: string;
  sessionExpiry: number;
}

interface AuthContextType {
  user: DummyUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isSessionValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kredensial dummy untuk testing
const DUMMY_CREDENTIALS = {
  email: 'admin@cybersec.local',
  password: 'CyberSec2024!'
};

// Session duration: 2 hours
const SESSION_DURATION = 2 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DummyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    checkExistingSession();
    
    // Set up session check interval (every 5 minutes)
    const sessionCheckInterval = setInterval(checkSessionValidity, 5 * 60 * 1000);
    
    return () => clearInterval(sessionCheckInterval);
  }, []);

  const checkExistingSession = () => {
    try {
      const savedUser = localStorage.getItem('cybersec-auth-user');
      const sessionData = localStorage.getItem('cybersec-session-data');
      
      if (savedUser && sessionData) {
        const user = JSON.parse(savedUser);
        const session = JSON.parse(sessionData);
        
        // Check if session is still valid
        if (Date.now() < session.expiry) {
          setUser(user);
        } else {
          // Session expired, clear storage
          clearSession();
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const checkSessionValidity = () => {
    const sessionData = localStorage.getItem('cybersec-session-data');
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        
        if (Date.now() >= session.expiry) {
          // Session expired
          signOut();
          alert('Your session has expired. Please log in again.');
        }
      } catch (error) {
        console.error('Error checking session validity:', error);
        signOut();
      }
    }
  };

  const isSessionValid = (): boolean => {
    const sessionData = localStorage.getItem('cybersec-session-data');
    
    if (!sessionData) return false;
    
    try {
      const session = JSON.parse(sessionData);
      return Date.now() < session.expiry;
    } catch {
      return false;
    }
  };

  const clearSession = () => {
    localStorage.removeItem('cybersec-auth-user');
    localStorage.removeItem('cybersec-session-data');
    setUser(null);
  };

  const signIn = async (email: string, password: string) => {
    // Simulasi delay network
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email === DUMMY_CREDENTIALS.email && password === DUMMY_CREDENTIALS.password) {
      const sessionExpiry = Date.now() + SESSION_DURATION;
      
      const userData: DummyUser = {
        id: 'cybersec-admin-' + Date.now(),
        email: email,
        sessionExpiry: sessionExpiry
      };

      const sessionData = {
        expiry: sessionExpiry,
        loginTime: Date.now(),
        userAgent: navigator.userAgent
      };

      // Save to localStorage
      localStorage.setItem('cybersec-auth-user', JSON.stringify(userData));
      localStorage.setItem('cybersec-session-data', JSON.stringify(sessionData));
      
      setUser(userData);
    } else {
      throw new Error('Invalid credentials. Access denied.');
    }
  };

  const signOut = async () => {
    // Simulasi delay network
    await new Promise(resolve => setTimeout(resolve, 300));
    
    clearSession();
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isSessionValid,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}