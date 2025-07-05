import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { errorHandler } from '../lib/errorHandler';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorId?: string; onRetry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorHandler.logError('React Error Boundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error!} 
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ 
  error: Error; 
  errorId?: string; 
  onRetry: () => void 
}> = ({ error, errorId, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-black transition-colors duration-300">
    <div className="text-center max-w-md">
      <div className="text-red-600 dark:text-red-400 mb-6">
        <AlertTriangle className="w-16 h-16 mx-auto" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
        Oops! Something went wrong
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors duration-300">
        {errorHandler.createUserFriendlyMessage(error)}
      </p>

      {import.meta.env.DEV && (
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Technical Details
          </summary>
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-32">
            <p><strong>Error:</strong> {error.message}</p>
            {errorId && <p><strong>Error ID:</strong> {errorId}</p>}
            {error.stack && (
              <div className="mt-2">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
            )}
          </div>
        </details>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
        >
          Reload Page
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
        If this problem persists, please contact support.
      </p>
    </div>
  </div>
);

export default ErrorBoundary;