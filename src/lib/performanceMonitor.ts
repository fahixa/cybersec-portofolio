// Performance Monitoring and Analytics
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart);
            this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
            this.recordMetric('first_paint', navEntry.responseEnd - navEntry.fetchStart);
          }
        }
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (e) {
        console.warn('Navigation timing observer not supported');
      }

      // Monitor resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Track API calls
            if (resourceEntry.name.includes('/rest/v1/')) {
              this.recordMetric('api_request_duration', resourceEntry.duration, {
                url: resourceEntry.name,
                method: 'GET', // Default, could be enhanced
                size: resourceEntry.transferSize
              });
            }
          }
        }
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing observer not supported');
      }
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log significant performance issues
    if (this.isSlowMetric(name, value)) {
      console.warn(`🐌 Slow ${name}: ${value}ms`, metadata);
    }
  }

  private isSlowMetric(name: string, value: number): boolean {
    const thresholds = {
      'api_request_duration': 2000, // 2 seconds
      'page_load_time': 3000,       // 3 seconds
      'dom_content_loaded': 1500,   // 1.5 seconds
    };

    return value > (thresholds[name] || 1000);
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string, timeWindow?: number): number {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const relevantMetrics = this.metrics.filter(m => 
      m.name === name && m.timestamp >= windowStart
    );

    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    // Group metrics by name
    const groupedMetrics = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate statistics for each metric
    Object.entries(groupedMetrics).forEach(([name, values]) => {
      const sorted = values.sort((a, b) => a - b);
      report[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...values),
        max: Math.max(...values),
        p95: sorted[Math.floor(sorted.length * 0.95)]
      };
    });

    return report;
  }

  // Track custom user interactions
  trackUserAction(action: string, duration?: number, metadata?: Record<string, any>) {
    this.recordMetric(`user_action_${action}`, duration || 0, metadata);
  }

  // Clean up observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Helper function to measure function execution time
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  metadata?: Record<string, any>
): T | Promise<T> {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      performanceMonitor.recordMetric(name, duration, metadata);
    });
  } else {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(name, duration, metadata);
    return result;
  }
}