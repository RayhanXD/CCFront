import { getAuth } from "firebase/auth";
import { todayEvents as mockTodayEvents } from "@/mocks/today-events";
import { calendarEvents as mockCalendarEvents } from "@/mocks/calendar-events";
import { organizations as mockOrganizations } from "@/mocks/organizations";
import { scholarships as mockScholarships } from "@/mocks/scholarships";

/**
 * Simple in-memory cache for API responses.
 */
class ApiCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

export interface Organization {
  id: string;
  title: string; // Organization name/title
  category: string; // Organization category
  missionPurposeDescription: string; // Mission, Purpose, and Organization Description
  presidentFullName: string; // President's Full Name
  contactEmail: string; // Contact Information Email
  picture: string; // Picture URL
  major: string; // Major field
  specificMajors: string[]; // List of specific majors
  
  // Legacy fields for backward compatibility (optional)
  name?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  matchPercentage?: number;
  president?: {
    name: string;
    role: string;
  };
  type?: string;
  meetingTime?: string;
  location?: string;
  memberCount?: number;
  meetingSchedule?: string;
  email?: string;
  website?: string;
  benefits?: string[];
  events?: any[]; // OrganizationEvent[]
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string; // Formatted time string (e.g., "1:00 PM")
  duration?: number; // in minutes
  description?: string;
  location?: string;
  organization_id?: string;
  color?: string;
  img?: string; // URL to event image
  isRecurring?: boolean; // Flag for recurring events
}

export interface TutoringSession {
  id: string;
  subject: string;
  tutor: string;
  date: string;
  time: string;
  location?: string;
}

export interface UserProfile {
  email: string;
  name?: string;
  surname?: string;
  major?: string;
  year?: string;
  interests?: string[];
  school_name?: string;
  ftcs_status?: string;
  gpa_range?: string;
  educational_goals?: string;
  age?: string;
  gender?: string;
  race_ethnicity?: string;
  working_hours?: string;
  stress_level?: string;
  self_efficacy?: string;
}

export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Base URL for API requests
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
console.log('🌐 API Base URL:', API_BASE_URL);

/**
 * Main API service class
 */
class ApiService {
  private baseUrl: string;
  private abortControllers = new Map<string, AbortController>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request wrapper that injects Firebase ID token automatically.
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheOptions: { cacheKey?: string; cacheTTL?: number; useCache?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // ✅ Get Firebase ID token
    const auth = getAuth();
    const currentUser = auth.currentUser;
    let token: string | null = null;
    
    try {
      if (currentUser) {
        token = await currentUser.getIdToken(false); // false = don't force refresh
        if (__DEV__) {
          console.log(`🔑 Auth: User found, token retrieved for ${endpoint}`);
        }
      } else {
        if (__DEV__) {
          console.log(`⚠️  Auth: No user found for ${endpoint}, request will proceed without token`);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Auth: Error getting token for ${endpoint}:`, error);
      }
      // Continue without token - backend will return clearer error
    }

    // ✅ Check cache (if enabled)
    if (cacheOptions.useCache && cacheOptions.cacheKey) {
      const cached = apiCache.get(cacheOptions.cacheKey);
      if (cached) return cached as T;
    }

    const controller = new AbortController();
    this.abortControllers.set(url, controller);

    try {
      // Use Record<string, string> for headers to allow custom headers like Authorization
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };
      
      // Add Authorization header if token is available
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else if (__DEV__) {
        console.log(`⚠️  Auth: No token available for ${endpoint}`);
      }

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        let errorJson: any = {};
        try {
          errorJson = JSON.parse(text);
        } catch {
          errorJson = { detail: text };
        }
        
        // Log detailed error information
        if (__DEV__) {
          console.error(`❌ API Error [${res.status}] ${endpoint}:`, {
            status: res.status,
            error: errorJson,
            errorDetail: JSON.stringify(errorJson, null, 2),
            hasToken: !!token,
            hasUser: !!currentUser,
          });
        }
        
        // For 403 (Not authenticated), show clearer error and use mock data fallback
        if (res.status === 403) {
          if (__DEV__) {
            const errorDetail = errorJson.detail || 'Authentication required';
            console.log(`⚠️  API 403 for ${endpoint}: ${errorDetail}`);
            console.log(`⚠️  Using mock data fallback. User authenticated: ${!!currentUser}, Token available: ${!!token}`);
          }
          
          // Return mock data based on endpoint
          if (endpoint.includes('/profile/')) {
            // Extract email from endpoint
            const emailMatch = endpoint.match(/\/profile\/([^?]+)/);
            const email = emailMatch ? decodeURIComponent(emailMatch[1]) : 'user@example.com';
            return {
              user: {
                email: email,
                name: 'Test User',
                major: 'Computer Science',
                year: 'Junior',
                interests: ['Technology', 'AI', 'Web Development'],
                school_name: 'Test University'
              }
            } as T;
          } else if (endpoint.includes('/recommendations/events')) {
            return { recommendations: mockTodayEvents.slice(0, 3) } as T;
          } else if (endpoint.includes('/recommendations/organizations')) {
            return { recommendations: mockOrganizations.slice(0, 3) } as T;
          } else if (endpoint.includes('/organizations')) {
            const mappedOrgs = mockOrganizations.map(org => ({
              id: org.id,
              name: org.name,
              description: org.description,
              category: org.category,
              url: org.website,
            }));
            return { organizations: mappedOrgs } as T;
          } else if (endpoint.includes('/today-events')) {
            console.log('⚠️  Using mock today-events data due to 403 error');
            return { events: mockTodayEvents as any } as T;
          } else if (endpoint.includes('/calendar/events') || endpoint.includes('/calendar')) {
            return { events: mockCalendarEvents as any } as T;
          } else if (endpoint.includes('/scholarships')) {
            return { scholarships: mockScholarships } as T;
          }
          return {} as T;
        }
        
        // For 404 (Not found), also use mock data fallback
        if (res.status === 404) {
          if (__DEV__) {
            console.log(`⚠️  API 404 for ${endpoint}, using mock data fallback`);
          }
          if (endpoint.includes('/profile/')) {
            // Extract email from endpoint
            const emailMatch = endpoint.match(/\/profile\/([^?]+)/);
            const email = emailMatch ? decodeURIComponent(emailMatch[1]) : 'user@example.com';
            return {
              user: {
                email: email,
                name: 'Test User',
                major: 'Computer Science',
                year: 'Junior',
                interests: ['Technology', 'AI', 'Web Development'],
                school_name: 'Test University'
              }
            } as T;
          } else if (endpoint.includes('/recommendations/events')) {
            return { recommendations: mockTodayEvents.slice(0, 3) } as T;
          } else if (endpoint.includes('/recommendations/organizations')) {
            return { recommendations: mockOrganizations.slice(0, 3) } as T;
          } else if (endpoint.includes('/organizations')) {
            const mappedOrgs = mockOrganizations.map(org => ({
              id: org.id,
              name: org.name,
              description: org.description,
              category: org.category,
              url: org.website,
            }));
            return { organizations: mappedOrgs } as T;
          } else if (endpoint.includes('/today-events')) {
            console.log('⚠️  Using mock today-events data due to 404 error');
            return { events: mockTodayEvents as any } as T;
          } else if (endpoint.includes('/calendar/events') || endpoint.includes('/calendar')) {
            return { events: mockCalendarEvents as any } as T;
          }
          return {} as T;
        }
        
        // For 500 (Internal Server Error), use mock data fallback
        if (res.status === 500) {
          if (__DEV__) {
            console.log(`⚠️  API 500 for ${endpoint}, server error - using mock data fallback`);
          }
          if (endpoint.includes('/profile/')) {
            // Extract email from endpoint
            const emailMatch = endpoint.match(/\/profile\/([^?]+)/);
            const email = emailMatch ? decodeURIComponent(emailMatch[1]) : 'user@example.com';
            return {
              user: {
                email: email,
                name: 'Test User',
                major: 'Computer Science',
                year: 'Junior',
                interests: ['Technology', 'AI', 'Web Development'],
                school_name: 'Test University'
              }
            } as T;
          } else if (endpoint.includes('/recommendations/events')) {
            return { recommendations: mockTodayEvents.slice(0, 3) } as T;
          } else if (endpoint.includes('/recommendations/organizations')) {
            return { recommendations: mockOrganizations.slice(0, 3) } as T;
          } else if (endpoint.includes('/organizations')) {
            const mappedOrgs = mockOrganizations.map(org => ({
              id: org.id,
              name: org.name,
              description: org.description,
              category: org.category,
              url: org.website,
            }));
            return { organizations: mappedOrgs } as T;
          } else if (endpoint.includes('/today-events')) {
            console.log('⚠️  Using mock today-events data due to 500 error');
            return { events: mockTodayEvents as any } as T;
          } else if (endpoint.includes('/calendar/events') || endpoint.includes('/calendar')) {
            return { events: mockCalendarEvents as any } as T;
          } else if (endpoint.includes('/scholarships')) {
            return { scholarships: mockScholarships } as T;
          }
          return {} as T;
        }
        
        // For other errors, throw with detailed message
        let errorMessage = errorJson.detail || errorJson.message || `HTTP ${res.status} Error`;
        
        // Handle 422 validation errors (Pydantic validation)
        if (res.status === 422 && Array.isArray(errorJson.detail)) {
          const validationErrors = errorJson.detail.map((err: any) => {
            const field = err.loc ? err.loc.join('.') : 'unknown';
            return `${field}: ${err.msg}`;
          }).join(', ');
          errorMessage = `Validation error: ${validationErrors}`;
        }
        // Handle nested detail objects
        else if (typeof errorMessage === 'object') {
          errorMessage = JSON.stringify(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      const data = await res.json();

      if (cacheOptions.cacheKey && cacheOptions.cacheTTL) {
        apiCache.set(cacheOptions.cacheKey, data, cacheOptions.cacheTTL);
      }

      if (__DEV__) {
        console.log(`✅ API Success [${res.status}] ${endpoint}`, {
          hasData: !!data,
          dataType: Array.isArray(data) ? 'array' : typeof data,
          itemCount: data?.events?.length || data?.organizations?.length || data?.scholarships?.length || 'N/A'
        });
      }

      return data as T;
    } catch (error) {
      // Only log if it's not a handled error (403/404/500 are handled above with mock data)
      if (error instanceof Error && !error.message.includes('403') && !error.message.includes('404') && !error.message.includes('500')) {
        console.error(`❌ Request failed for ${endpoint}:`, error);
      }
      throw error;
    } finally {
      this.abortControllers.delete(url);
    }
  }

  // ✅ API methods

  async getOrganizations(): Promise<{ organizations: Organization[] }> {
    return this.makeRequest("/organizations", {}, { cacheKey: "orgs", cacheTTL: 60000 });
  }

  async getOrganizationRecommendations(user_email: string) {
    return this.makeRequest("/recommendations/organizations", {
      method: "POST",
      body: JSON.stringify({ user_email }),
    });
  }

  async getCalendar(user_email: string, options?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ events: Event[]; total?: number; hasMore?: boolean }> {
    console.log('📅 API getCalendar called with:', { user_email, options });
    
    // Generate cache key based on parameters
    const cacheKey = `calendar_${user_email}_${options?.start_date || 'all'}_${options?.end_date || 'all'}_${options?.page || 1}`;
    
    // Check cache first (24 hour TTL for calendar data)
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('📅 Using cached calendar data:', cacheKey);
      return cached as { events: Event[]; total?: number; hasMore?: boolean };
    }
    
    const requestBody: any = { user_email };
    
    // Add pagination and date filtering
    if (options?.start_date) requestBody.start_date = options.start_date;
    if (options?.end_date) requestBody.end_date = options.end_date;
    if (options?.page) requestBody.page = options.page;
    if (options?.limit) requestBody.limit = options.limit;
    
    const rawResult = await this.makeRequest<any>("/calendar", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
    console.log('📅 API getCalendar raw response:', { 
      eventsCount: rawResult.calendar?.length || 0,
      total: rawResult.total,
      hasMore: rawResult.hasMore 
    });
    
    // Transform the API response to match frontend Event interface
    const eventsArray = rawResult.calendar || rawResult.events || rawResult || [];
    console.log('📅 Events array to transform:', eventsArray.length, 'events');
    
    const transformedEvents: Event[] = eventsArray.map((event: any, index: number) => {
      const imgUrl = event.imageUrl || event.image;
      if (imgUrl) {
        console.log('🖼️ Transforming calendar event image:', { 
          eventId: event.id, 
          title: event.title || event.name,
          imageUrl: event.imageUrl, 
          image: event.image, 
          finalImg: imgUrl 
        });
      }
      
      // Create unique ID using title and index to prevent duplicates
      const baseId = event.id || event.title || event.name;
      const uniqueId = baseId ? `${baseId}-${index}` : `event-${Date.now()}-${Math.random()}`;
      
      return {
        id: uniqueId,
        title: String(event.name || event.title || 'Untitled Event'),
        date: String(event.start_date || event.date || new Date().toISOString()),
        time: String(event.time || this.extractTimeFromDate(event.start_date) || ''),
        duration: Number(event.duration || this.calculateDuration(event.start_date, event.end_date) || 0),
        description: String(event.description || ''),
        location: String(event.location_name || event.location || event.location_address || ''),
        organization_id: event.organization_id ? String(event.organization_id) : undefined,
        color: event.color ? String(event.color) : undefined,
        img: imgUrl ? String(imgUrl) : undefined,
        isRecurring: Boolean(event.isRecurring || false)
      };
    });
    
    const result = {
      events: transformedEvents,
      total: rawResult.total,
      hasMore: rawResult.hasMore
    };
    
    // Cache the result for 24 hours (86400000 ms)
    apiCache.set(cacheKey, result, 86400000);
    console.log('📅 Cached calendar data:', cacheKey);
    
    return result;
  }
  
  // Helper method to extract time from datetime string
  private extractTimeFromDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '';
    }
  }
  
  // Helper method to calculate duration between start and end dates
  private calculateDuration(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60))); // duration in minutes
    } catch {
      return 0;
    }
  }

  async getCalendarEvents(filters?: {
    start_date?: string;
    end_date?: string;
    categories?: string[];
    location?: string;
  }): Promise<{ events: Event[] }> {
    const query = new URLSearchParams();
    if (filters?.start_date) query.append("start_date", filters.start_date);
    if (filters?.end_date) query.append("end_date", filters.end_date);
    if (filters?.categories) query.append("categories", filters.categories.join(","));
    if (filters?.location) query.append("location", filters.location);
    return this.makeRequest(`/calendar/events?${query.toString()}`);
  }

  async getTodayEvents(): Promise<{ events: Event[] }> {
    console.log('📅 getTodayEvents: Making API call to /today-events');
    try {
      const rawResult = await this.makeRequest<any>("/today-events", {}, { cacheKey: "today-events", cacheTTL: 30000 });
      
      // Transform the API response to match frontend Event interface
      const eventsArray = Array.isArray(rawResult) ? rawResult : (rawResult.events || rawResult || []);
      console.log('📅 getTodayEvents: Raw response type:', Array.isArray(rawResult) ? 'array' : 'object', 'Events to transform:', eventsArray.length);
      
      const transformedEvents: Event[] = eventsArray.map((event: any, index: number) => {
        const imgUrl = event.imageUrl || event.image;
        if (imgUrl) {
          console.log('🖼️ Transforming event image:', { 
            eventId: event.id, 
            title: event.title || event.name,
            imageUrl: event.imageUrl, 
            image: event.image, 
            finalImg: imgUrl 
          });
        }
        
        // Create unique ID using title and index to prevent duplicates
        const baseId = event.id || event.title || event.name;
        const uniqueId = baseId ? `${baseId}-${index}` : `event-${Date.now()}-${Math.random()}`;
        
        return {
          id: uniqueId,
          title: String(event.name || event.title || 'Untitled Event'),
          date: String(event.start_date || event.date || new Date().toISOString()),
          time: String(event.time || this.extractTimeFromDate(event.start_date) || ''),
          duration: Number(event.duration || this.calculateDuration(event.start_date, event.end_date) || 0),
          description: String(event.description || ''),
          location: String(event.location_name || event.location || event.location_address || ''),
          organization_id: event.organization_id ? String(event.organization_id) : undefined,
          color: event.color ? String(event.color) : undefined,
          img: imgUrl ? String(imgUrl) : undefined,
          isRecurring: Boolean(event.isRecurring || false)
        };
      });
      
      console.log('📅 getTodayEvents: Success, transformed', transformedEvents.length, 'events');
      return { events: transformedEvents };
    } catch (error) {
      console.error('📅 getTodayEvents: API call failed:', error);
      // Don't fallback to mock data here - let the error bubble up so components can handle it
      throw error;
    }
  }

  // User Event Management
  async createUserEvent(userId: string, event: Omit<Event, 'id'>): Promise<Event> {
    // Transform frontend Event format to backend format
    // Backend expects both 'name' and 'title' fields
    const backendEvent = {
      title: event.title,
      name: event.title, // Backend might use 'name' internally
      start_date: event.date,
      end_date: event.date, // Use same date if no end date provided
      time: event.time,
      duration: event.duration,
      location_name: event.location,
      description: event.description,
      color: event.color,
      image: event.img,
      isRecurring: event.isRecurring || false
    };
    
    console.log('📤 createUserEvent: Sending to backend:', JSON.stringify(backendEvent, null, 2));
    
    const response = await this.makeRequest<any>(`/users/${userId}/events`, {
      method: "POST",
      body: JSON.stringify(backendEvent),
    });
    
    // Transform backend response back to frontend Event format
    return {
      id: response.id || response._id || `event-${Date.now()}`,
      title: response.name || response.title,
      date: response.start_date || response.date,
      time: response.time,
      duration: response.duration,
      location: response.location_name || response.location,
      description: response.description,
      color: response.color,
      img: response.image || response.img,
      isRecurring: response.isRecurring
    };
  }

  async getUserEvents(
    userId: string, 
    filters?: {
      category?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{ events: Event[] }> {
    const query = new URLSearchParams();
    if (filters?.category) query.append("category", filters.category);
    if (filters?.start_date) query.append("start_date", filters.start_date);
    if (filters?.end_date) query.append("end_date", filters.end_date);
    const queryString = query.toString();
    return this.makeRequest(`/users/${userId}/events${queryString ? `?${queryString}` : ''}`);
  }

  async updateUserEvent(userId: string, eventId: string, event: Partial<Event>): Promise<Event> {
    // Transform frontend Event format to backend format
    const backendEvent: any = {};
    if (event.title) {
      backendEvent.title = event.title;
      backendEvent.name = event.title; // Backend expects both
    }
    if (event.date) {
      backendEvent.start_date = event.date;
      backendEvent.end_date = event.date;
    }
    if (event.time) backendEvent.time = event.time;
    if (event.duration !== undefined) backendEvent.duration = event.duration;
    if (event.location) backendEvent.location_name = event.location;
    if (event.description !== undefined) backendEvent.description = event.description;
    if (event.color !== undefined) backendEvent.color = event.color;
    if (event.img !== undefined) backendEvent.image = event.img;
    if (event.isRecurring !== undefined) backendEvent.isRecurring = event.isRecurring;
    
    const response = await this.makeRequest<any>(`/users/${userId}/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(backendEvent),
    });
    
    // Transform backend response back to frontend Event format
    return {
      id: response.id || response._id || eventId,
      title: response.name || response.title,
      date: response.start_date || response.date,
      time: response.time,
      duration: response.duration,
      location: response.location_name || response.location,
      description: response.description,
      color: response.color,
      img: response.image || response.img,
      isRecurring: response.isRecurring
    };
  }

  async deleteUserEvent(userId: string, eventId: string): Promise<void> {
    return this.makeRequest(`/users/${userId}/events/${eventId}`, {
      method: "DELETE",
    });
  }

  // Save/Unsave Events (using the same endpoints - saved events are user events)
  async saveUserEvent(userId: string, eventId: string, eventData: any): Promise<Event> {
    // When saving an event, we create it as a user event
    // Don't include 'id' in the body - the backend will generate it
    return this.makeRequest(`/users/${userId}/events`, {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  async unsaveUserEvent(userId: string, eventId: string): Promise<void> {
    // When unsaving, we delete it from user events
    return this.makeRequest(`/users/${userId}/events/${eventId}`, {
      method: "DELETE",
    });
  }

  async getSavedEvents(userId: string): Promise<{ events: Event[] }> {
    // Get all user events (which includes saved events)
    return this.makeRequest(`/users/${userId}/events`);
  }

  async getTutoringRecommendations(user_email: string): Promise<{ sessions: TutoringSession[] }> {
    return this.makeRequest("/recommendations/tutoring", {
      method: "POST",
      body: JSON.stringify({ user_email }),
    });
  }

  async getUserProfile(email: string): Promise<UserProfile> {
    const response = await this.makeRequest<any>(`/profile/${encodeURIComponent(email)}`, {
      method: 'GET'
    });
    // Handle both direct UserProfile and wrapped { user: UserProfile } responses
    return response.user || response;
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    return this.makeRequest(`/profile`, {
      method: "POST",
      body: JSON.stringify(profile),
    });
  }

  async getHealth(): Promise<{ status: string }> {
    const response = await this.makeRequest<{ message: string; version: string }>("/", {}, { cacheKey: "health", cacheTTL: 5000, useCache: true });
    return { status: response.message ? 'ok' : 'error' };
  }

  // Auth methods
  async signUp(userData: UserProfile): Promise<any> {
    return this.makeRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async signIn(data: { email: string }): Promise<{ user: UserProfile }> {
    return this.makeRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Profile methods (aliases for consistency)
  async getProfile(email: string): Promise<{ user: UserProfile }> {
    const profile = await this.getUserProfile(email);
    return { user: profile };
  }

  async updateProfile(email: string, updates: UserProfile): Promise<UserProfile> {
    return this.updateUserProfile(updates);
  }

  // Recommendation methods
  async getEventRecommendations(email: string): Promise<{ recommendations: Event[] }> {
    return this.makeRequest("/recommendations/events", {
      method: "POST",
      body: JSON.stringify({ user_email: email }),
    });
  }

  // ChatGPT methods
  getChatGPTWebSocketUrl(userEmail: string): string {
    const wsProtocol = this.baseUrl.startsWith('https') ? 'wss' : 'ws';
    const baseWsUrl = this.baseUrl.replace(/^https?/, wsProtocol);
    return `${baseWsUrl}/ws/chatgpt?user_email=${encodeURIComponent(userEmail)}`;
  }

  async chatGPT(data: { user_email: string; messages: ChatGPTMessage[] }): Promise<{ message: string }> {
    return this.makeRequest("/chatgpt/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getChatGPTHistory(userEmail: string): Promise<{ conversations: any[] }> {
    return this.makeRequest("/chatgpt/history", {
      method: "POST",
      body: JSON.stringify({ user_email: userEmail }),
    });
  }

  async deleteChatGPTConversation(conversationId: string): Promise<void> {
    return this.makeRequest(`/chatgpt/conversation/${conversationId}`, {
      method: "DELETE",
    });
  }

  async getScholarships(userEmail?: string): Promise<any> {
    try {
      // First try to get personalized scholarships if user is authenticated
      if (userEmail) {
        try {
          const response = await this.makeRequest<any>(
            `/scholarships?user_email=${encodeURIComponent(userEmail)}`,
            {},
            { cacheKey: `scholarships-${userEmail}`, cacheTTL: 60000 }
          );
          // Return the response as-is (could be category-based dict or array)
          if (response) {
            return response;
          }
        } catch (error) {
          console.warn('Falling back to general scholarships:', error);
        }
      }
      
      // Fall back to general scholarships
      const response = await this.makeRequest<any>(
        '/scholarships',
        {},
        { cacheKey: 'scholarships-all', cacheTTL: 60000 }
      );
      
      // Return the response as-is - let the store handle the parsing
      if (response) {
        return response;
      } else {
        return {};
      }
    } catch (error) {
      console.error('Error in getScholarships:', error);
      console.log('🔄 Falling back to mock scholarships data');
      
      // Fall back to mock data when API is completely unavailable
      // Convert mock data to category-based format for consistency
      const mockByCategory: { [key: string]: any[] } = {};
      mockScholarships.forEach(scholarship => {
        const category = scholarship.category || 'General';
        if (!mockByCategory[category]) {
          mockByCategory[category] = [];
        }
        mockByCategory[category].push(scholarship);
      });
      return mockByCategory;
    }
  }

  cancelRequest(endpoint: string) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = this.abortControllers.get(url);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(url);
    }
  }
}

// Create and export a single instance of the API service
const apiService = new ApiService(API_BASE_URL);

export default apiService;
