// src/lib/api/client.ts
export interface APIConfig extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, any>; // Add params support
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  // Helper to build query string from params
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async request<T = any>(
    endpoint: string,
    config: APIConfig = {}
  ): Promise<T> {
    const { params, ...restConfig } = config;
    const isFormData = restConfig.body instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...restConfig.headers,
    };

    // Build URL with query params
    const queryString = this.buildQueryString(params);
    const url = `${this.baseURL}${endpoint}${queryString}`;
    
    const finalConfig: RequestInit = {
      ...restConfig,
      headers,
      credentials: 'include', // Include cookies for NextAuth
    };

    try {
      const response = await fetch(url, finalConfig);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'An error occurred'
        }));

        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
          }
          throw new Error('Unauthorized');
        }

        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return await response.text() as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  get<T = any>(endpoint: string, config?: APIConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T = any>(endpoint: string, data?: any, config?: APIConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  patch<T = any>(endpoint: string, data?: any, config?: APIConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  put<T = any>(endpoint: string, data?: any, config?: APIConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  delete<T = any>(endpoint: string, config?: APIConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance as default
const apiClient = new APIClient();
export default apiClient;

// Also export the class if needed elsewhere
export { APIClient };