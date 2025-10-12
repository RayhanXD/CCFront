// API service for connecting to the FastAPI backend
import { config } from "./config";
import { CalendarEvent } from "@/types/calendar";

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

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Makes a request to the API
   * @param endpoint The API endpoint
   * @param options Request options
   * @returns Promise with the response data
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error - API server may be down or unreachable');
        throw new Error('Network error - Please check your internet connection or try again later');
      }
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest("/health");
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
    return this.makeRequest(config.ENDPOINTS.CHATGPT.CHAT, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getChatGPTHistory(
    userEmail: string,
    limit: number = 20
  ): Promise<ChatGPTHistory> {
    try {
      return await this.makeRequest(
        `${config.ENDPOINTS.CHATGPT.HISTORY}/${encodeURIComponent(
          userEmail
        )}?limit=${limit}`
      );
    } catch (error) {
      // Check if it's a 404 error (no history found)
      if (
        error instanceof Error &&
        (error.message.includes("404") ||
          error.message.includes("not found") ||
          error.message.toLowerCase().includes("no chat history"))
      ) {
        // Return empty conversations array instead of throwing
        console.log(`No chat history found for user: ${userEmail}`);
        return {
          user_email: userEmail,
          conversations: [],
        };
      }
      // For other errors, rethrow
      throw error;
    }
  }

  // Get WebSocket URL for ChatGPT streaming
  getChatGPTWebSocketUrl(userEmail: string): string {
    const wsBaseUrl = this.baseUrl.replace(/^http/, "ws");
    return `${wsBaseUrl}${
      config.ENDPOINTS.CHATGPT.WEBSOCKET
    }/${encodeURIComponent(userEmail)}`;
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
    try {
      const response = await this.makeRequest<{ events: CalendarEvent[]; count: number }>('/calendar', {
        method: "POST",
        body: filters ? JSON.stringify(filters) : JSON.stringify({}),
      });
      return response;
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
      
      // Provide fallback data when API is unavailable
      console.warn("Using fallback data for calendar events");
      
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
          id: `fallback-cal-${i}`,
          title: `Sample Calendar Event ${i+1}`,
          date: dateStr,
          time: i % 2 === 0 ? '10:00 AM' : '2:00 PM',
          duration: 60 + (i * 15),
          location: i % 3 === 0 ? 'Main Campus' : i % 3 === 1 ? 'Library' : 'Student Center',
          description: `This is a fallback calendar event for ${dateStr}`,
          color: ['#3357FF', '#FF5733', '#33FF57', '#FF33A8', '#33A8FF'][i % 5],
          img: i % 4 === 0 ? 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80' : undefined
        });
      }
      
      return {
        events,
        count: events.length
      };
    }
  }

  /**
   * Fetches today's calendar events from the API
   * @returns Promise with array of today's calendar events and count
   */
  async getTodayEvents(): Promise<{ events: CalendarEvent[]; count: number }> {
    try {
      const response = await this.makeRequest<{ events: CalendarEvent[]; count: number }>('/today-events');
      return response;
    } catch (error) {
      console.error("Failed to fetch today's events:", error);
      
      // Provide fallback data when API is unavailable
      console.warn("Using fallback data for today's events");
      
      // Generate current date in YYYY-MM-DD format
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      // Return mock data as fallback
      return {
        events: [
          {
            id: 'fallback-1',
            title: 'Sample Event 1',
            date: dateStr,
            time: '10:00 AM',
            duration: 60,
            location: 'Main Campus',
            description: 'This is a fallback event due to API unavailability',
            color: '#3357FF',
            img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
          },
          {
            id: 'fallback-2',
            title: 'Sample Event 2',
            date: dateStr,
            time: '2:00 PM',
            duration: 90,
            location: 'Library',
            description: 'Another fallback event with sample data',
            color: '#FF5733'
          }
        ],
        count: 2
      };
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
