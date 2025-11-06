/**
 * API Cache implementation for optimizing API requests
 * Features:
 * - Request deduplication
 * - In-memory caching with TTL
 * - Cache invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns The cached item or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.data;
  }

  /**
   * Set an item in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (optional, defaults to 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete an item from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Execute a function with caching
   * @param key Cache key
   * @param fn Function to execute if cache miss
   * @param ttl Time to live in milliseconds (optional)
   * @returns Result from cache or function execution
   */
  async withCache<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    // Check if we already have a cached result
    const cachedResult = this.get<T>(key);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    
    // Check if we have a pending request for this key
    if (this.pendingRequests.has(key)) {
      // Return the pending request's promise to avoid duplicate requests
      return this.pendingRequests.get(key)!.promise;
    }
    
    // Create a new promise that we can resolve/reject later
    let resolvePromise: (value: T | PromiseLike<T>) => void;
    let rejectPromise: (reason?: any) => void;
    
    const promise = new Promise<T>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    
    // Store the pending request
    this.pendingRequests.set(key, {
      promise,
      resolve: resolvePromise!,
      reject: rejectPromise!
    });
    
    try {
      // Execute the function
      const result = await fn();
      
      // Cache the result
      this.set(key, result, ttl);
      
      // Resolve the promise
      this.pendingRequests.get(key)!.resolve(result);
      
      // Remove the pending request
      this.pendingRequests.delete(key);
      
      return result;
    } catch (error) {
      // Reject the promise
      this.pendingRequests.get(key)!.reject(error);
      
      // Remove the pending request
      this.pendingRequests.delete(key);
      
      throw error;
    }
  }

  /**
   * Invalidate cache entries by prefix
   * @param prefix Cache key prefix to invalidate
   */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const apiCache = new ApiCache();

// Export the class for testing or custom instances
export default ApiCache;
