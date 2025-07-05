// Centralized error handling and logging
interface ErrorLog {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

class ErrorHandler {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason, {
        type: 'unhandledrejection'
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', event.error, {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  logError(message: string, error?: any, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'error',
      message: this.sanitizeMessage(message),
      stack: error?.stack,
      context: this.sanitizeContext(context),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(errorLog);
    this.trimLogs();

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorLog);
    }

    // In production, you would send this to your logging service
    this.sendToLoggingService(errorLog);
  }

  logWarning(message: string, context?: Record<string, any>) {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'warn',
      message: this.sanitizeMessage(message),
      context: this.sanitizeContext(context),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(warningLog);
    this.trimLogs();

    if (import.meta.env.DEV) {
      console.warn('Warning logged:', warningLog);
    }
  }

  logInfo(message: string, context?: Record<string, any>) {
    const infoLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'info',
      message: this.sanitizeMessage(message),
      context: this.sanitizeContext(context),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(infoLog);
    this.trimLogs();

    if (import.meta.env.DEV) {
      console.info('Info logged:', infoLog);
    }
  }

  private sanitizeMessage(message: string): string {
    if (typeof message !== 'string') {
      return String(message);
    }
    
    // Remove potential sensitive information
    return message
      .replace(/password[=:]\s*\S+/gi, 'password=***')
      .replace(/token[=:]\s*\S+/gi, 'token=***')
      .replace(/key[=:]\s*\S+/gi, 'key=***')
      .slice(0, 1000); // Limit message length
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized: Record<string, any> = {};
    
    Object.entries(context).forEach(([key, value]) => {
      // Skip sensitive keys
      if (['password', 'token', 'key', 'secret'].some(sensitive => 
        key.toLowerCase().includes(sensitive)
      )) {
        sanitized[key] = '***';
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private trimLogs() {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private async sendToLoggingService(log: ErrorLog) {
    // In production, implement actual logging service integration
    // For now, we'll just store locally
    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(log);
      
      // Keep only last 50 logs in localStorage
      const trimmedLogs = existingLogs.slice(-50);
      localStorage.setItem('error_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  getLogs(level?: 'error' | 'warn' | 'info'): ErrorLog[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('error_logs');
  }

  // Helper method to create user-friendly error messages
  createUserFriendlyMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      // Map technical errors to user-friendly messages
      const errorMappings: Record<string, string> = {
        'Network Error': 'Unable to connect to the server. Please check your internet connection.',
        'Failed to fetch': 'Unable to load data. Please try again later.',
        'Unauthorized': 'You are not authorized to perform this action.',
        'Forbidden': 'Access denied. You do not have permission to access this resource.',
        'Not Found': 'The requested resource was not found.',
        'Internal Server Error': 'A server error occurred. Please try again later.',
        'Bad Request': 'Invalid request. Please check your input and try again.',
      };

      return errorMappings[error.message] || 'An unexpected error occurred. Please try again.';
    }

    return 'An unexpected error occurred. Please try again.';
  }
}

export const errorHandler = new ErrorHandler();

// React error boundary helper
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorHandler.logError('React Error Boundary', error, {
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-black">
    <div className="text-center max-w-md">
      <div className="text-red-600 dark:text-red-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {errorHandler.createUserFriendlyMessage(error)}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reload Page
      </button>
    </div>
  </div>
);