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
  organization_image?: string; // Organization's image URL (used when event has no image)
  category?: string; // Event category (e.g., "Personal", "Academic", "Social")
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
  uid?: string; // Firebase UID - required for signup
  name?: string;
  surname?: string;
  major?: string;
  year?: string;
  interests?: string[];
  school_name?: string; // Will store university doc ID (short_hand)
  ftcs_status?: string;
  gpa_range?: string;
  educational_goals?: string;
  age?: string;
  gender?: string;
  race_ethnicity?: string;
  working_hours?: string;
  stress_level?: string;
  self_efficacy?: string;
  // Additional fields from backend
  academic_difficulty?: string | null;
  current_gpa?: string | null;
  family_responsibilities?: string | null;
  financial_factors?: string | null;
  high_school_grades?: string | null;
  opportunity_to_transfer?: string | null;
  outside_encouragement?: string | null;
  satisfaction?: string | null;
}

export interface University {
  id: string;
  name: string;
  short_hand: string;
  location?: string;
  [key: string]: any;
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
        // Force refresh token to ensure it's valid
        token = await currentUser.getIdToken(true); // true = force refresh
        console.log(`🔑 Token for ${endpoint}:`, token);
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

  async getOrganizationRecommendations() {
    // Backend now uses UID from JWT token, no need to pass user_email
    return this.makeRequest("/recommendations/organizations", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async getCalendar(options?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ events: Event[]; total?: number; hasMore?: boolean }> {
    // Generate cache key based on parameters (UID will be from JWT token)
    const cacheKey = `calendar_${options?.start_date || 'all'}_${options?.end_date || 'all'}_${options?.page || 1}`;
    
    // Check cache first (24 hour TTL for calendar data)
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached as { events: Event[]; total?: number; hasMore?: boolean };
    }
    
    const requestBody: any = {};
    
    // Add pagination and date filtering
    if (options?.start_date) requestBody.start_date = options.start_date;
    if (options?.end_date) requestBody.end_date = options.end_date;
    if (options?.page) requestBody.page = options.page;
    if (options?.limit) requestBody.limit = options.limit;
    
    const rawResult = await this.makeRequest<any>("/calendar", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
    
    // Transform the API response to match frontend Event interface
    const eventsArray = rawResult.calendar || rawResult.events || rawResult || [];
    
    const transformedEvents: Event[] = eventsArray.map((event: any, index: number) => {
      // Check all possible image field variations from backend
      const imgUrl = event.imageUrl || event.image || event.image_url || event.img;
      
      // Preserve the original backend event ID
      const backendEventId = event.event_id || event.id || event._id;
      
      // Create unique display ID using title and index to prevent React duplicate key errors
      const baseId = backendEventId || event.title || event.name;
      const uniqueId = baseId ? `${baseId}-${index}` : `event-${Date.now()}-${Math.random()}`;
      
      // Log image transformation for debugging
      if (index === 0) {
        console.log('📸 Calendar event image fields:', {
          imageUrl: event.imageUrl,
          image: event.image,
          image_url: event.image_url,
          img: event.img,
          organization_image: event.organization_image,
          organizationImage: event.organizationImage,
          resolved: imgUrl
        });
      }
      
      return {
        id: uniqueId,
        backendEventId: backendEventId, // Store original ID for API calls
        title: String(event.name || event.title || 'Untitled Event'),
        date: String(event.start_date || event.date || new Date().toISOString()),
        time: String(event.time || this.extractTimeFromDate(event.start_date) || ''),
        duration: Number(event.duration || this.calculateDuration(event.start_date, event.end_date) || 0),
        description: String(event.description || ''),
        location: String(event.location_name || event.location || event.location_address || ''),
        organization_id: event.organization_id ? String(event.organization_id) : undefined,
        organization_image: event.organization_image || event.organizationImage ? String(event.organization_image || event.organizationImage) : undefined,
        color: event.color ? String(event.color) : undefined,
        img: imgUrl ? String(imgUrl) : undefined,
        isRecurring: Boolean(event.isRecurring || false)
      } as any;
    });
    
    const result = {
      events: transformedEvents,
      total: rawResult.total,
      hasMore: rawResult.hasMore
    };
    
    // Cache the result for 24 hours (86400000 ms)
    apiCache.set(cacheKey, result, 86400000);
    
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
    try {
      const rawResult = await this.makeRequest<any>("/today-events", {}, { cacheKey: "today-events", cacheTTL: 30000 });
      
      // Transform the API response to match frontend Event interface
      const eventsArray = Array.isArray(rawResult) ? rawResult : (rawResult.events || rawResult || []);
      
      const transformedEvents: Event[] = eventsArray.map((event: any, index: number) => {
        // Check all possible image field variations from backend
        const imgUrl = event.imageUrl || event.image || event.image_url || event.img;
        
        // Preserve the original backend event ID
        const backendEventId = event.event_id || event.id || event._id;
        
        // Create unique display ID using title and index to prevent React duplicate key errors
        const baseId = backendEventId || event.title || event.name;
        const uniqueId = baseId ? `${baseId}-${index}` : `event-${Date.now()}-${Math.random()}`;
        
        // Log image transformation for debugging
        if (index === 0) {
          console.log('📸 Today event image fields:', {
            imageUrl: event.imageUrl,
            image: event.image,
            image_url: event.image_url,
            img: event.img,
            organization_image: event.organization_image,
            organizationImage: event.organizationImage,
            resolved: imgUrl
          });
        }
        
        return {
          id: uniqueId,
          backendEventId: backendEventId, // Store original ID for API calls
          title: String(event.name || event.title || 'Untitled Event'),
          date: String(event.start_date || event.date || new Date().toISOString()),
          time: String(event.time || this.extractTimeFromDate(event.start_date) || ''),
          duration: Number(event.duration || this.calculateDuration(event.start_date, event.end_date) || 0),
          description: String(event.description || ''),
          location: String(event.location_name || event.location || event.location_address || ''),
          organization_id: event.organization_id ? String(event.organization_id) : undefined,
          organization_image: event.organization_image || event.organizationImage ? String(event.organization_image || event.organizationImage) : undefined,
          color: event.color ? String(event.color) : undefined,
          img: imgUrl ? String(imgUrl) : undefined,
          isRecurring: Boolean(event.isRecurring || false)
        } as any;
      });
      
      return { events: transformedEvents };
    } catch (error) {
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
      time: event.time || null,
      duration: event.duration || null,
      location: event.location || null,
      description: event.description || null,
      color: event.color || null,
      image_url: event.img || null,
      category: 'Personal', // Mark as personal event
      isRecurring: event.isRecurring || false
    };
    
    console.log('📤 createUserEvent: Sending to backend:', JSON.stringify(backendEvent, null, 2));
    
    const response = await this.makeRequest<any>(`/users/${userId}/events`, {
      method: "POST",
      body: JSON.stringify(backendEvent),
    });
    
    console.log('📥 createUserEvent: Backend response:', JSON.stringify(response, null, 2));
    
    // Transform backend response back to frontend Event format
    return {
      id: response.event_id || response.id || response._id || `event-${Date.now()}`,
      title: response.title || response.name || 'Untitled Event',
      date: response.start_date || response.date,
      time: response.time || 'TBD',
      duration: response.duration || 0,
      location: response.location || 'TBD',
      description: response.description || '',
      color: response.color || '#7B5CFF',
      category: response.category || 'Personal',
      img: response.image_url || response.img || '',
      isRecurring: response.isRecurring || false
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
    
    console.log('📥 Fetching user events for userId:', userId);
    const response: any = await this.makeRequest(`/users/${userId}/events${queryString ? `?${queryString}` : ''}`);
    
    // Transform backend response to frontend Event interface
    const eventsArray = Array.isArray(response) ? response : (response.events || []);
    
    const transformedEvents = eventsArray.map((event: any, index: number) => {
      const backendEventId = event.event_id || event.id || event._id;
      const uniqueId = backendEventId ? `${backendEventId}-${index}` : `user-event-${Date.now()}-${index}`;
      
      return {
        id: uniqueId,
        backendEventId: backendEventId,
        title: event.title || event.name || 'Untitled Event',
        date: event.start_date || event.date || new Date().toISOString().split('T')[0],
        time: event.time || 'TBD',
        duration: event.duration || 0,
        description: event.description || '',
        location: event.location || event.location_name || 'TBD',
        img: event.image_url || event.image || event.img || '',
        color: event.color || '#7B5CFF',
        category: event.category || 'Personal',
        isRecurring: event.isRecurring || false,
      } as any;
    });
    
    console.log('✅ Transformed user events:', transformedEvents.length);
    return { events: transformedEvents };
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

  // Save/Unsave Events - Backend now uses users/{uid}/savedEvents/{eventId}
  async saveUserEvent(eventId: string, eventData: any): Promise<Event> {
    // Backend uses UID from JWT token and stores in savedEvents subcollection
    // POST /users/me/saved with event data
    const payload = { 
      eventId: eventId,      // Backend expects 'eventId' (camelCase)
      event_id: eventId,     // Also send snake_case for compatibility
      ...eventData 
    };
    
    console.log('💾 saveUserEvent payload:', JSON.stringify(payload, null, 2));
    
    return this.makeRequest(`/users/me/saved`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async unsaveUserEvent(eventId: string): Promise<void> {
    // DELETE /users/me/saved/{event_id} - event_id in path
    return this.makeRequest(`/users/me/saved/${eventId}`, {
      method: "DELETE",
    });
  }

  async getSavedEvents(): Promise<{ events: Event[] }> {
    // GET /users/me/saved - Backend uses UID from JWT token
    console.log('📥 Fetching saved events from /users/me/saved');
    const response: any = await this.makeRequest(`/users/me/saved`);
    
    console.log('📥 Saved events RAW response:', response);
    console.log('📥 Response type:', typeof response);
    console.log('📥 Response keys:', response ? Object.keys(response) : 'null');
    console.log('📥 Is array?', Array.isArray(response));
    console.log('📥 Has events property?', response && 'events' in response);
    console.log('📥 Has saved_events property?', response && 'saved_events' in response);
    
    // Check if response is directly an array (backend might return array directly)
    let eventsArray = [];
    if (Array.isArray(response)) {
      console.log('📥 Response is direct array, length:', response.length);
      eventsArray = response;
    } else if (response && Array.isArray(response.events)) {
      console.log('📥 Response has events property, length:', response.events.length);
      eventsArray = response.events;
    } else if (response && Array.isArray(response.saved_events)) {
      console.log('📥 Response has saved_events property, length:', response.saved_events.length);
      eventsArray = response.saved_events;
    } else if (response && typeof response === 'object') {
      // Try to find any array property in the response
      console.log('📥 Searching for array in response object...');
      for (const key of Object.keys(response)) {
        if (Array.isArray(response[key])) {
          console.log(`📥 Found array at key "${key}", length:`, response[key].length);
          eventsArray = response[key];
          break;
        }
      }
      if (eventsArray.length === 0) {
        console.log('⚠️ No array found in response object');
        console.log('📥 Full response structure:', JSON.stringify(response, null, 2));
        return { events: [] };
      }
    } else {
      console.log('⚠️ Unexpected response format for saved events');
      console.log('📥 Full response:', JSON.stringify(response, null, 2));
      return { events: [] };
    }
    
    // Transform backend saved events to match Event interface
    const transformedEvents = eventsArray.map((event: any, index: number) => {
      console.log(`📥 Transforming event ${index}:`, JSON.stringify(event, null, 2));
      return {
        id: event.event_id || event.id || `saved-${index}`,
        title: event.title || event.name || 'Untitled Event',
        date: event.start_date || event.date || new Date().toISOString().split('T')[0],
        time: event.time || 'TBD',
        duration: event.duration || 0,
        description: event.description || '',
        location: event.location || 'TBD',
        img: event.image_url || event.img || '',
        color: event.color || '#7B5CFF',
        category: event.category || 'Personal',
        isRecurring: event.isRecurring || false,
      };
    });
    
    console.log('✅ Transformed saved events:', transformedEvents.length);
    return { events: transformedEvents };
  }

  async getTutoringRecommendations(): Promise<{ sessions: TutoringSession[] }> {
    // Backend now uses UID from JWT token, no need to pass user_email
    return this.makeRequest("/recommendations/tutoring", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async getUserProfile(): Promise<UserProfile> {
    // Get current user UID from Firebase Auth
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    // Use /profile/{uid} endpoint with Firebase UID
    const response = await this.makeRequest<any>(`/profile/${currentUser.uid}`, {
      method: 'GET'
    });
    // Handle both direct UserProfile and wrapped { user: UserProfile } responses
    return response.user || response;
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    // Get current user UID from Firebase Auth
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    // Use PUT /profile/{uid} endpoint with Firebase UID
    return this.makeRequest(`/profile/${currentUser.uid}`, {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  }

  async getHealth(): Promise<{ status: string }> {
    const response = await this.makeRequest<{ message: string; version: string }>("/", {}, { cacheKey: "health", cacheTTL: 5000, useCache: true });
    return { status: response.message ? 'ok' : 'error' };
  }

  // Universities
  async getUniversities(): Promise<University[]> {
    return this.makeRequest("/universities", {
      method: "GET",
    });
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
  async getProfile(): Promise<{ user: UserProfile }> {
    const profile = await this.getUserProfile();
    return { user: profile };
  }

  async updateProfile(updates: UserProfile): Promise<UserProfile> {
    return this.updateUserProfile(updates);
  }

  // Recommendation methods
  async getEventRecommendations(): Promise<{ recommendations: Event[] }> {
    // Backend now uses UID from JWT token, no need to pass user_email
    return this.makeRequest("/recommendations", {
      method: "POST",
      body: JSON.stringify({}),
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

  // Save/Unsave Scholarship methods
  async saveScholarship(scholarship: any): Promise<void> {
    const uid = `scholarship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('💾 Saving scholarship:', scholarship.id, 'with uid:', uid);
    return this.makeRequest('/users/me/scholarships', {
      method: 'POST',
      body: JSON.stringify({
        ...scholarship, // Include entire scholarship data first
        scholarshipId: scholarship.id, // Then override with specific fields
        id: scholarship.id,
        uid // uid comes last to ensure it's not overwritten
      }),
    });
  }

  async unsaveScholarship(scholarshipId: string): Promise<void> {
    console.log('🗑️ Unsaving scholarship:', scholarshipId);
    return this.makeRequest(`/users/me/scholarships/${scholarshipId}`, {
      method: 'DELETE',
    });
  }

  // Save/Unsave Event methods
  async saveEvent(event: any): Promise<void> {
    const uid = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('💾 Saving event:', event.id, 'with uid:', uid);
    return this.makeRequest('/users/me/events', {
      method: 'POST',
      body: JSON.stringify({
        ...event, // Include entire event data first
        eventId: event.id, // Then override with specific fields
        id: event.id,
        uid // uid comes last to ensure it's not overwritten
      }),
    });
  }

  async unsaveEvent(eventId: string): Promise<void> {
    console.log('🗑️ Unsaving event:', eventId);
    return this.makeRequest(`/users/me/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Save/Unsave Organization methods
  async saveOrganization(organization: any): Promise<void> {
    const uid = `organization-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('💾 Saving organization:', organization.id, 'with uid:', uid);
    return this.makeRequest('/users/me/organizations', {
      method: 'POST',
      body: JSON.stringify({
        ...organization, // Include entire organization data first
        organizationId: organization.id, // Then override with specific fields
        id: organization.id,
        uid // uid comes last to ensure it's not overwritten
      }),
    });
  }

  async unsaveOrganization(organizationId: string): Promise<void> {
    console.log('🗑️ Unsaving organization:', organizationId);
    return this.makeRequest(`/users/me/organizations/${organizationId}`, {
      method: 'DELETE',
    });
  }

  // Get all saved items (scholarships, organizations, personal events)
  async getSavedItems(): Promise<{
    scholarships: any[];
    organizations: any[];
    personal_events: any[];
  }> {
    console.log('📥 Fetching all saved items');
    const response = await this.makeRequest('/users/me/saved-items', {
      method: 'GET',
    });
    
    // Log the FULL response structure for debugging
    // console.log('📥 RAW RESPONSE:', JSON.stringify(response, null, 2));
    // console.log('📥 Response type:', typeof response);
    // console.log('📥 Response is array?', Array.isArray(response));
    // console.log('📥 Response keys:', response ? Object.keys(response) : 'null/undefined');
    
    // Try different possible structures
    let scholarships: any[] = [];
    let organizations: any[] = [];
    let events: any[] = [];
    
    const resp = response as any;
    
    // Try to find scholarships in various locations
    const scholarshipsRaw = resp?.savedEvents?.scholarships || resp?.scholarships || [];
    const organizationsRaw = resp?.savedEvents?.saved_events || resp?.organizations || [];
    const eventsRaw = resp?.savedEvents?.events || resp?.events || resp?.personal_events || [];
    
    console.log('📥 Raw arrays found:');
    console.log('  - Scholarships array length:', scholarshipsRaw.length);
    console.log('  - Organizations array length:', organizationsRaw.length);
    console.log('  - Events array length:', eventsRaw.length);
    
    if (scholarshipsRaw.length > 0) {
      console.log('  - First scholarship:', JSON.stringify(scholarshipsRaw[0], null, 2));
    }
    if (organizationsRaw.length > 0) {
      console.log('  - First organization:', JSON.stringify(organizationsRaw[0], null, 2));
    }
    if (eventsRaw.length > 0) {
      console.log('  - First event:', JSON.stringify(eventsRaw[0], null, 2));
    }
    
    // Map with proper IDs - prioritize uid field
    scholarships = scholarshipsRaw.map((item: any) => ({
      ...item,
      id: item.uid || item.doc?.id || item.scholarshipId || item.scholarship_id || item.id || `scholarship-${Math.random()}`
    }));
    
    organizations = organizationsRaw.map((item: any) => ({
      ...item,
      id: item.uid || item.doc?.id || item.organizationId || item.organization_id || item.id || `org-${Math.random()}`
    }));
    
    events = eventsRaw.map((item: any) => ({
      ...item,
      id: item.uid || item.doc?.id || item.eventId || item.event_id || item.id || `event-${Math.random()}`
    }));
    
    console.log('📥 ✅ Final counts - Scholarships:', scholarships.length, 'Organizations:', organizations.length, 'Events:', events.length);
    
    return {
      scholarships,
      organizations,
      personal_events: events
    };
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
