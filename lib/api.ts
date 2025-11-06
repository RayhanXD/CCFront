// API service for connecting to the FastAPI backend
import { config } from "./config";
import { CalendarEvent } from "@/types/calendar";
import { apiCache } from "./api-cache";
import { Platform } from "react-native";
import { organizations } from "@/mocks/organizations";
import { scholarships } from "@/mocks/scholarships";

const API_BASE_URL = config.API_BASE_URL;

export interface UserProfile {
  name: string;
  surname: string;
  school_name: string;
  year: string;
  ftcs_status: string;
  gpa_range: string;
  educational_goals: string;
  age: string;
  gender: string;
  race_ethnicity: string;
  working_hours: string;
  stress_level: string;
  self_efficacy: string;
  major: string;
  interests: string[];
  email: string;
  high_school_grades?: string;
  financial_factors?: string;
  family_responsibilities?: string;
  outside_encouragement?: string[];
  opportunity_to_transfer?: string;
  current_gpa?: string;
  academic_difficulty?: string;
  satisfaction?: string;
}

export interface RecommendationRequest {
  user_email: string;
  category: "orgs" | "events" | "tutoring";
}

export interface RecommendationResponse {
  recommendations: any[];
  category: string;
  major_colors: Record<string, string>;
}

export interface SignInRequest {
  email: string;
}

export interface TokenVerificationRequest {
  token: string;
}

export interface ChatGPTMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatGPTRequest {
  user_email: string;
  messages: ChatGPTMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatGPTResponse {
  user_email: string;
  message: string;
  timestamp: string;
  conversation_id: string;
}

export interface ChatGPTHistory {
  user_email: string;
  conversations: {
    user_message: string;
    assistant_response: string;
    timestamp: string;
    conversation_id: string;
    model: string;
  }[];
}

class ApiService {
  private baseUrl: string;
  private networkStatus: 'online' | 'offline' | 'unknown' = 'online'; // Start optimistic
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(API_BASE_URL: string = config.API_BASE_URL) {
    // Get the appropriate base URL for the current environment
    this.baseUrl = this.getAppropriateBaseUrl(API_BASE_URL);
    
    // Debug logging for environment variables (only in development)
    if (__DEV__) {
      console.log('🔧 Environment Variables:');
      console.log('config.USE_MOCK_DATA:', config.USE_MOCK_DATA);
      console.log('config.API_BASE_URL:', config.API_BASE_URL);
      console.log('🌐 Using baseUrl:', this.baseUrl);
    }
    
    // Test if we can connect to the backend
    this.testBackendConnection();
    
    // Set up network status monitoring
    this.setupNetworkMonitoring();
  }
  
  /**
   * Set up network status monitoring
   */
  private setupNetworkMonitoring() {
    // Check network status initially
    this.checkNetworkStatus();
    
    // Set up interval to check network status periodically
    setInterval(() => this.checkNetworkStatus(), 30000); // Check every 30 seconds
  }
  
  /**
   * Attempt to make a real API request
   */
  private async attemptRealRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Create manual timeout since AbortSignal.timeout is not supported in React Native
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Check network status
   */
  private async checkNetworkStatus() {
    if (__DEV__) console.log('Checking network status for:', `${this.baseUrl}/health`);
    try {
      // Create manual timeout since AbortSignal.timeout is not supported in React Native
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      if (__DEV__) console.log('Health check response:', response.status, response.statusText);
      
      if (response.ok) {
        this.networkStatus = 'online';
        if (__DEV__) console.log('✅ Network status: ONLINE');
      } else {
        this.networkStatus = 'offline';
        if (__DEV__) console.log('❌ Network status: OFFLINE (bad response):', response.status);
      }
    } catch (error) {
      this.networkStatus = 'offline';
      if (__DEV__) console.log('❌ Network status: OFFLINE (error):', error);
    }
  }
  
  /**
   * Determines the appropriate base URL for the current environment
   * @param configuredUrl The URL from the config
   * @returns The appropriate URL for the current environment
   */
  private getAppropriateBaseUrl(configuredUrl: string): string {
    // Check if we're running in a web browser
    const isWeb = typeof window !== 'undefined' && window.document;
    
    // If we're in a web browser, we can use localhost
    if (isWeb) {
      console.log('Running in web browser, using localhost is OK');
      return configuredUrl;
    }
    
    // If we're on a mobile device, we need to use the LAN IP address
    // The environment variables should already have the correct IP address
    console.log('Running on mobile device, using LAN IP address');
    return configuredUrl;
  }
  
  // Test if we can connect to the backend
  private async testBackendConnection() {
    try {
      const url = `${this.baseUrl}/health`;
      console.log('Testing backend connection to:', url);
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      console.log('Backend connection successful:', data);
    } catch (error) {
      console.error('Backend connection failed:', error);
    }
  }

  /**
   * Makes a request to the API with caching and deduplication
   * @param endpoint The API endpoint
   * @param options Request options
   * @param cacheOptions Cache options
   * @returns Promise with the response data
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    cacheOptions: { 
      useCache?: boolean; 
      cacheTTL?: number; 
      cacheKey?: string;
      forceRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const { 
      useCache = true, 
      cacheTTL = 5 * 60 * 1000, // 5 minutes default
      cacheKey = `${endpoint}:${JSON.stringify(options.body || '')}`,
      forceRefresh = false
    } = cacheOptions;
    
    // If mock data is enabled, don't even attempt to make a real request
    if (config.USE_MOCK_DATA) {
      if (__DEV__) console.log(`Using mock data for endpoint: ${endpoint}`);
      // Return mock data based on the endpoint
      return this.getMockData<T>(endpoint, options);
    }
    
    // If we're offline, try the real API first, then fall back to mock data
    if (this.networkStatus === 'offline') {
      if (__DEV__) console.log(`🔄 Network detected as offline, trying real API first for: ${endpoint}`);
      try {
        // Try the real API anyway in case network status is wrong
        const result = await this.attemptRealRequest<T>(endpoint, options);
        // If successful, update network status
        this.networkStatus = 'online';
        if (__DEV__) console.log('✅ Real API worked, updating network status to online');
        return result;
      } catch (error) {
        if (__DEV__) console.log(`❌ Real API failed for ${endpoint}:`, error);
        // if (__DEV__) console.log(`📱 Using mock data for: ${endpoint}`);
        return this.getMockData<T>(endpoint, options);
      }
    }
    
    // For non-GET requests, don't use cache
    const method = options.method || 'GET';
    const shouldUseCache = useCache && method === 'GET';
    
    // If we should use cache and not forcing refresh, try to get from cache
    if (shouldUseCache && !forceRefresh) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        if (__DEV__) console.log(`Cache hit for ${endpoint}`);
        return cachedData;
      }
    }
    
    // If we're here, we need to make a real request
    if (__DEV__) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
    }
    
    // Use the cache's deduplication mechanism for the actual request
    return apiCache.withCache<T>(
      `pending:${cacheKey}`,
      async () => {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };
        
        // Create an abort controller for this request
        const abortController = new AbortController();
        const requestId = `${method}:${url}:${Date.now()}`;
        this.abortControllers.set(requestId, abortController);
        
        try {
          const response = await fetch(url, {
            ...options,
            headers,
            signal: abortController.signal,
          });
          
          // Remove the abort controller
          this.abortControllers.delete(requestId);
          
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            
            // For 404 errors (endpoint not found), fall back to mock data silently
            if (response.status === 404) {
              if (__DEV__) {
                console.log(`⚠️  Endpoint ${endpoint} not found (404), using mock data`);
              }
              return this.getMockData<T>(endpoint, options);
            }
            
            // Log other errors
            if (__DEV__) console.error(`API error (${response.status}): ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`);
          }
          
          const data = await response.json();
          
          // Log successful API response
          if (__DEV__) {
            console.log(`✅ API Success: ${endpoint}`, {
              status: response.status,
              dataType: Array.isArray(data) ? 'array' : typeof data,
              itemCount: data?.events?.length || data?.organizations?.length || data?.scholarships?.length || 'N/A'
            });
          }
          
          // Cache the successful response if needed
          if (shouldUseCache) {
            apiCache.set(cacheKey, data, cacheTTL);
          }
          
          return data;
        } catch (error) {
          // Remove the abort controller
          this.abortControllers.delete(requestId);
          
          if (error instanceof TypeError && error.message.includes('Network request failed')) {
            if (__DEV__) console.error(`Network error for ${url}:`, error.message);
            if (__DEV__) console.log('Falling back to mock data due to network error');
            return this.getMockData<T>(endpoint, options);
          }
          
          // Check if it's an HTTP error with 404 status
          if (error instanceof Error && error.message.includes('status: 404')) {
            if (__DEV__) console.log(`404 error detected, falling back to mock data for: ${endpoint}`);
            return this.getMockData<T>(endpoint, options);
          }
          
          if (__DEV__) console.error(`API request failed for ${url}:`, error);
          throw error;
        }
      },
      0 // Don't cache the pending request result
    );
  }
  
  /**
   * Provides mock data for endpoints when API is unavailable
   * @param endpoint The API endpoint
   * @param options Request options
   * @returns Mock data for the endpoint
   */
  private getMockData<T>(endpoint: string, options: RequestInit = {}): T {
    
    // Generate appropriate mock data based on the endpoint
    if (endpoint === '/health') {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      } as unknown as T;
    } else if (endpoint === '/calendar' || endpoint.includes('calendar')) {
      return this.getMockCalendarEvents(options) as unknown as T;
    } else if (endpoint === '/today-events' || endpoint.includes('today-events')) {
      return this.getMockTodayEvents() as unknown as T;
    } else if (endpoint === '/organizations' || endpoint.includes('/organizations')) {
      return {
        organizations: organizations,
      } as unknown as T;
    } else if (endpoint === '/scholarships' || endpoint.includes('/scholarships')) {
      return {
        scholarships: scholarships,
      } as unknown as T;
    } else if (endpoint.includes('/chatgpt/')) {
      return this.getMockChatGPTResponse(endpoint, options) as unknown as T;
    } else {
      // Default mock response
      return {
        success: true,
        message: 'Mock data response',
        data: [],
      } as unknown as T;
    }
  }
  
  /**
   * Generates mock calendar events
   */
  private getMockCalendarEvents(options: RequestInit = {}): { events: CalendarEvent[]; count: number } {
    // Parse request body if available
    let filters: any = {};
    if (options.body && typeof options.body === 'string') {
      try {
        filters = JSON.parse(options.body);
      } catch (e) {
        console.error('Failed to parse request body:', e);
      }
    }
    
    // Generate dates based on filters or current month
    const today = new Date();
    const startDate = filters?.start_date ? new Date(filters.start_date) : new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = filters?.end_date ? new Date(filters.end_date) : new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Generate some sample events within the date range
    const events: CalendarEvent[] = [];
    const daysBetween = Math.min(14, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    for (let i = 0; i < daysBetween; i += 2) { // Add an event every other day
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + i);
      const dateStr = eventDate.toISOString().split('T')[0];
      
      events.push({
        id: `mock-cal-${i}`,
        title: `Sample Calendar Event ${i+1}`,
        date: dateStr,
        time: i % 2 === 0 ? '10:00 AM' : '2:00 PM',
        duration: 60 + (i * 15),
        location: i % 3 === 0 ? 'Main Campus' : i % 3 === 1 ? 'Library' : 'Student Center',
        description: `This is a mock calendar event for ${dateStr}`,
        color: ['#3357FF', '#FF5733', '#33FF57', '#FF33A8', '#33A8FF'][i % 5],
        img: i % 4 === 0 ? 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80' : undefined
      });
    }
    
    return {
      events,
      count: events.length
    };
  }
  
  /**
   * Generates mock today's events
   */
  private getMockTodayEvents(): { events: CalendarEvent[]; count: number } {
    // Generate current date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // Return mock data
    return {
      events: [
        {
          id: 'mock-today-1',
          title: 'Campus Career Fair',
          date: dateStr,
          time: '10:00 AM',
          duration: 180,
          location: 'Student Union',
          description: 'Annual career fair with top employers',
          color: '#3357FF',
          img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80'
        },
        {
          id: 'mock-today-2',
          title: 'Tech Workshop',
          date: dateStr,
          time: '2:00 PM',
          duration: 120,
          location: 'Engineering Building',
          description: 'Learn the latest technologies',
          color: '#FF5733'
        },
        {
          id: 'mock-today-3',
          title: 'Student Club Meeting',
          date: dateStr,
          time: '4:30 PM',
          duration: 90,
          location: 'Library Room 204',
          description: 'Weekly meeting of the Computer Science Club',
          color: '#33FF57'
        }
      ],
      count: 3
    };
  }
  
  /**
   * Generates mock ChatGPT responses
   */
  private getMockChatGPTResponse(endpoint: string, options: RequestInit = {}): any {
    if (endpoint.includes('/chat')) {
      // Parse request body
      let requestBody: any = {};
      if (options.body && typeof options.body === 'string') {
        try {
          requestBody = JSON.parse(options.body);
        } catch (e) {
          console.error('Failed to parse request body:', e);
        }
      }
      
      const userEmail = requestBody.user_email || 'user@example.com';
      const lastMessage = requestBody.messages?.length > 0 
        ? requestBody.messages[requestBody.messages.length - 1].content 
        : 'Hello';
      
      return {
        user_email: userEmail,
        message: `This is a mock response to: "${lastMessage}". The backend is not connected, so I'm providing mock responses.`,
        timestamp: new Date().toISOString(),
        conversation_id: `mock-conv-${Date.now()}`
      };
    } else if (endpoint.includes('/history')) {
      // Extract email from endpoint
      const parts = endpoint.split('/');
      const email = parts[parts.length - 1].split('?')[0] || 'user@example.com';
      
      return {
        user_email: email,
        conversations: [
          {
            user_message: 'What events are happening today?',
            assistant_response: 'There are three events today: Campus Career Fair, Tech Workshop, and Student Club Meeting.',
            timestamp: new Date().toISOString(),
            conversation_id: 'mock-conv-1',
            model: 'gpt-3.5-turbo'
          },
          {
            user_message: 'What organizations should I join?',
            assistant_response: 'Based on your interests, you might enjoy Computer Science Society or Business Leaders.',
            timestamp: new Date().toISOString(),
            conversation_id: 'mock-conv-2',
            model: 'gpt-3.5-turbo'
          }
        ]
      };
    }
    
    return {
      success: true,
      message: 'Mock ChatGPT response',
    };
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
  
  /**
   * Clear all cached data
   */
  clearCache(): void {
    apiCache.clear();
  }
  
  /**
   * Clear cached data for a specific endpoint
   * @param endpoint The endpoint to clear cache for
   */
  clearCacheForEndpoint(endpoint: string): void {
    apiCache.invalidateByPrefix(endpoint);
  }
  
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest("/health", {}, { cacheTTL: 30000 }); // Short cache time for health check
  }

  // Get available majors
  async getMajors(): Promise<{ majors: string[] }> {
    return this.makeRequest("/majors");
  }

  // Get organization categories
  async getCategories(): Promise<{ categories: string[] }> {
    return this.makeRequest("/categories");
  }

  // Get major colors
  async getMajorColors(): Promise<{ major_colors: Record<string, string> }> {
    return this.makeRequest("/major-colors");
  }

  // User authentication and management
  async signUp(
    userData: UserProfile
  ): Promise<{ message: string; email: string }> {
    return this.makeRequest("/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async signIn(
    userData: SignInRequest
  ): Promise<{ message: string; user: UserProfile }> {
    return this.makeRequest("/signin", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async verifyToken(
    tokenData: TokenVerificationRequest
  ): Promise<{ user: string }> {
    return this.makeRequest("/verify-token", {
      method: "POST",
      body: JSON.stringify(tokenData),
    });
  }

  async getProfile(userEmail: string): Promise<{ user: UserProfile }> {
    return this.makeRequest(`/profile/${encodeURIComponent(userEmail)}`);
  }

  async updateProfile(
    userEmail: string,
    userData: UserProfile
  ): Promise<{ message: string }> {
    return this.makeRequest(`/profile/${encodeURIComponent(userEmail)}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // Get personalized recommendations
  async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    return this.makeRequest("/recommendations", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Get organization recommendations
  async getOrganizationRecommendations(
    userEmail: string
  ): Promise<RecommendationResponse> {
    return this.getRecommendations({
      user_email: userEmail,
      category: "orgs",
    });
  }
  
  // Get scholarships
  async getScholarships(): Promise<{ scholarships: any[] }> {
    return this.makeRequest("/scholarships");
  }
  
  // Get organizations
  async getOrganizations(): Promise<{ organizations: any[] }> {
    return this.makeRequest("/organizations");
  }

  // Get event recommendations
  async getEventRecommendations(
    userEmail: string
  ): Promise<RecommendationResponse> {
    return this.getRecommendations({
      user_email: userEmail,
      category: "events",
    });
  }

  // Get tutoring recommendations
  async getTutoringRecommendations(
    userEmail: string
  ): Promise<RecommendationResponse> {
    return this.getRecommendations({
      user_email: userEmail,
      category: "tutoring",
    });
  }

  // ChatGPT API methods
  async chatGPT(request: ChatGPTRequest): Promise<ChatGPTResponse> {
    if (config.USE_MOCK_DATA) {
      // Use mock data directly when mock data flag is set
      return this.getMockChatGPTResponse(config.ENDPOINTS.CHATGPT.CHAT, {
        method: "POST",
        body: JSON.stringify(request),
      });
    }
    
    try {
      return this.makeRequest(config.ENDPOINTS.CHATGPT.CHAT, {
        method: "POST",
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Failed to send chat message:', error);
      console.warn('Using mock ChatGPT response');
      
      // Use mock data as fallback
      return this.getMockChatGPTResponse(config.ENDPOINTS.CHATGPT.CHAT, {
        method: "POST",
        body: JSON.stringify(request),
      });
    }
  }

  async getChatGPTHistory(
    userEmail: string,
    limit: number = 20
  ): Promise<ChatGPTHistory> {
    if (config.USE_MOCK_DATA) {
      // Use mock data directly when mock data flag is set
      return this.getMockChatGPTResponse(
        `${config.ENDPOINTS.CHATGPT.HISTORY}/${encodeURIComponent(userEmail)}`,
        {}
      );
    }
    
    try {
      console.log(`Fetching ChatGPT history for ${userEmail} with limit ${limit}`);
      const response = await this.makeRequest<ChatGPTHistory>(
        `${config.ENDPOINTS.CHATGPT.HISTORY}/${encodeURIComponent(
          userEmail
        )}?limit=${limit}`
      );
      console.log(`Successfully fetched ChatGPT history for ${userEmail}`);
      return response;
    } catch (error) {
      // Log detailed error information
      console.error(`Error fetching ChatGPT history for ${userEmail}:`, error);
      
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}`);
      }
      
      // Use mock data as fallback for errors
      console.log(`Using mock ChatGPT history data for ${userEmail}`);
      return this.getMockChatGPTResponse(
        `${config.ENDPOINTS.CHATGPT.HISTORY}/${encodeURIComponent(userEmail)}`,
        {}
      );
    }
  }

  // Get WebSocket URL for ChatGPT streaming
  getChatGPTWebSocketUrl(userEmail: string): string {
    try {
      const wsBaseUrl = this.baseUrl.replace(/^http/, "ws");
      const url = `${wsBaseUrl}${config.ENDPOINTS.CHATGPT.WEBSOCKET}/${encodeURIComponent(userEmail)}`;
      console.log(`Generated WebSocket URL: ${url}`);
      return url;
    } catch (error) {
      console.error('Error generating WebSocket URL:', error);
      // Fallback to a default URL if there's an error
      return `ws://localhost:8000${config.ENDPOINTS.CHATGPT.WEBSOCKET}/${encodeURIComponent(userEmail)}`;
    }
  }

  /**
   * Delete a specific conversation from chat history
   * @param userEmail User's email address
   * @param conversationId ID of the conversation to delete
   * @returns Promise with success status
   */
  async deleteChatGPTConversation(
    userEmail: string,
    conversationId: string
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`${config.ENDPOINTS.CHATGPT.HISTORY}/${encodeURIComponent(userEmail)}/${conversationId}`, {
      method: "DELETE",
    });
  }

  /**
   * Delete all conversations for a user
   * @param userEmail User's email address
   * @returns Promise with success status
   */
  async deleteAllChatGPTConversations(
    userEmail: string
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`${config.ENDPOINTS.CHATGPT.HISTORY}/${encodeURIComponent(userEmail)}`, {
      method: "DELETE",
    });
  }

  // Calendar API methods
  
  /**
   * Fetches calendar events from the API with optional filters
   * @param filters Optional filters for calendar events
   * @returns Promise with array of calendar events and count
   */
  async getCalendarEvents(filters?: {
    start_date?: string;
    end_date?: string;
    categories?: string[];
    location?: string;
  }): Promise<{ events: CalendarEvent[]; count: number }> {
    if (config.USE_MOCK_DATA) {
      // Use mock data directly when mock data flag is set
      return this.getMockCalendarEvents({
        body: filters ? JSON.stringify(filters) : JSON.stringify({})
      });
    }
    
    try {
      const response = await this.makeRequest<{ events: CalendarEvent[]; count: number }>('/calendar', {
        method: "POST",
        body: filters ? JSON.stringify(filters) : JSON.stringify({}),
      });
      return response;
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
      console.warn("Using fallback data for calendar events");
      
      // Use mock data as fallback
      return this.getMockCalendarEvents({
        body: filters ? JSON.stringify(filters) : JSON.stringify({})
      });
    }
  }

  /**
   * Fetches today's calendar events from the API
   * @returns Promise with array of today's calendar events and count
   */
  async getTodayEvents(): Promise<{ events: CalendarEvent[]; count: number }> {
    // Get today's date in YYYY-MM-DD format for caching
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    try {
      // Make request to API with caching
      const response = await this.makeRequest<{ events: CalendarEvent[]; count: number }>(
        '/today-events',
        {},
        { 
          cacheKey: `today-events:${dateStr}`,
          cacheTTL: 5 * 60 * 1000 // 5 minutes cache
        }
      );
      
      // Filter to ensure only today's events are returned
      const todayEvents = response.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toISOString().split('T')[0] === dateStr;
      });
      
      return {
        events: todayEvents,
        count: todayEvents.length
      };
    } catch (error) {
      if (__DEV__) console.error("Failed to fetch today's events:", error);
      
      // Use mock data as fallback
      return this.getMockTodayEvents();
    }
  }
  /**
   * Adds a new calendar event
   * @param event The calendar event to add
   * @returns Promise with the added event
   */
  async addCalendarEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
    try {
      const response = await this.makeRequest<{ event: CalendarEvent }>(config.ENDPOINTS.CALENDAR.ALL_EVENTS, {
        method: "POST",
        body: JSON.stringify(event),
      });
      return response.event;
    } catch (error) {
      console.error("Failed to add calendar event:", error);
      throw error;
    }
  }

  /**
   * Updates an existing calendar event
   * @param id The ID of the event to update
   * @param event The updated event data
   * @returns Promise with the updated event
   */
  async updateCalendarEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await this.makeRequest<{ event: CalendarEvent }>(`${config.ENDPOINTS.CALENDAR.ALL_EVENTS}/${id}`, {
        method: "PUT",
        body: JSON.stringify(event),
      });
      return response.event;
    } catch (error) {
      console.error(`Failed to update calendar event with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a calendar event
   * @param id The ID of the event to delete
   * @returns Promise with success message
   */
  async deleteCalendarEvent(id: string): Promise<{ message: string }> {
    try {
      return await this.makeRequest<{ message: string }>(`${config.ENDPOINTS.CALENDAR.ALL_EVENTS}/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete calendar event with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export default ApiService;
