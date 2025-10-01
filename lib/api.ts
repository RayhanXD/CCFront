// API service for connecting to the FastAPI backend
import { config } from "./config";

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

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
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
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export default ApiService;
