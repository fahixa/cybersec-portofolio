// Request Optimization and Batching System
interface RequestConfig {
  url: string;
  options?: RequestInit;
  cacheKey?: string;
  cacheTTL?: number;
}

interface BatchRequest {
  id: string;
  config: RequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestOptimizer {
  private pendingRequests = new Map<string, Promise<any>>();
  private batchQueue: BatchRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // 50ms batching window

  // Deduplicate identical requests
  async request<T>(config: RequestConfig): Promise<T> {
    const requestKey = this.generateRequestKey(config);
    
    // Check if identical request is already pending
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    // Create new request promise
    const requestPromise = this.executeRequest<T>(config);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  private async executeRequest<T>(config: RequestConfig): Promise<T> {
    const { url, options = {}, cacheKey, cacheTTL } = config;

    // Check cache first
    if (cacheKey) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful response
      if (cacheKey && cacheTTL) {
        this.setCache(cacheKey, data, cacheTTL);
      }

      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  // Batch multiple requests together
  batchRequest<T>(config: RequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: Math.random().toString(36).substr(2, 9),
        config,
        resolve,
        reject
      };

      this.batchQueue.push(batchRequest);

      // Set batch timeout if not already set
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, this.BATCH_DELAY);
      }
    });
  }

  private async processBatch(): Promise<void> {
    const batch = [...this.batchQueue];
    this.batchQueue.length = 0;
    this.batchTimeout = null;

    // Group requests by similar endpoints for potential optimization
    const groupedRequests = this.groupRequests(batch);

    // Execute all requests in parallel
    await Promise.allSettled(
      groupedRequests.map(async (group) => {
        try {
          const results = await Promise.all(
            group.map(req => this.executeRequest(req.config))
          );
          
          group.forEach((req, index) => {
            req.resolve(results[index]);
          });
        } catch (error) {
          group.forEach(req => req.reject(error));
        }
      })
    );
  }

  private groupRequests(requests: BatchRequest[]): BatchRequest[][] {
    // Simple grouping by base URL - can be enhanced for more sophisticated batching
    const groups = new Map<string, BatchRequest[]>();
    
    requests.forEach(req => {
      const baseUrl = new URL(req.config.url).origin;
      if (!groups.has(baseUrl)) {
        groups.set(baseUrl, []);
      }
      groups.get(baseUrl)!.push(req);
    });

    return Array.from(groups.values());
  }

  private generateRequestKey(config: RequestConfig): string {
    const { url, options = {} } = config;
    const method = options.method || 'GET';
    const body = options.body || '';
    return `${method}:${url}:${body}`;
  }

  private getFromCache<T>(_key: string): T | null {
    // This would integrate with your cache system
    return null; // Placeholder
  }

  private setCache<T>(_key: string, _data: T, _ttl: number): void {
    // This would integrate with your cache system
    // Placeholder
  }

  // Clear all pending requests (useful for cleanup)
  clearPending(): void {
    this.pendingRequests.clear();
    this.batchQueue.length = 0;
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

export const requestOptimizer = new RequestOptimizer();