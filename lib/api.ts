// API service for connecting to the FastAPI backend
import { config } from './config';

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
  category: 'orgs' | 'events' | 'tutoring';
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

export interface ScholarshipData {
  name: string;
  amount: string;
  deadline: string;
  requirements?: string;
  [key: string]: any;
}

export interface ScholarshipRecommendation {
  name: string;
  amount: string;
  deadline: string;
  match_score: number;
  explanation: string;
  original_data: ScholarshipData;
}

export interface ScholarshipRequest {
  user_email: string;
  scholarships_data: ScholarshipData[];
}

export interface ScholarshipResponse {
  recommendations: ScholarshipRecommendation[];
  user_email: string;
  total_recommendations: number;
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
      'Content-Type': 'application/json',
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
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health');
  }

  // Get available majors
  async getMajors(): Promise<{ majors: string[] }> {
    return this.makeRequest('/majors');
  }

  // Get organization categories
  async getCategories(): Promise<{ categories: string[] }> {
    return this.makeRequest('/categories');
  }

  // Get major colors
  async getMajorColors(): Promise<{ major_colors: Record<string, string> }> {
    return this.makeRequest('/major-colors');
  }

  // User authentication and management
  async signUp(userData: UserProfile): Promise<{ message: string; email: string }> {
    return this.makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(userData: SignInRequest): Promise<{ message: string; user: UserProfile }> {
    return this.makeRequest('/signin', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken(tokenData: TokenVerificationRequest): Promise<{ user: string }> {
    return this.makeRequest('/verify-token', {
      method: 'POST',
      body: JSON.stringify(tokenData),
    });
  }

  async getProfile(userEmail: string): Promise<{ user: UserProfile }> {
    return this.makeRequest(`/profile/${encodeURIComponent(userEmail)}`);
  }

  async updateProfile(userEmail: string, userData: UserProfile): Promise<{ message: string }> {
    return this.makeRequest(`/profile/${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Get personalized recommendations
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    return this.makeRequest('/recommendations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get organization recommendations
  async getOrganizationRecommendations(userEmail: string): Promise<RecommendationResponse> {
    return this.getRecommendations({
      user_email: userEmail,
      category: 'orgs',
    });
  }

  // Get event recommendations
  async getEventRecommendations(userEmail: string): Promise<RecommendationResponse> {
    return this.getRecommendations({
      user_email: userEmail,
      category: 'events',
    });
  }

  // Get tutoring recommendations
  async getTutoringRecommendations(userEmail: string): Promise<RecommendationResponse> {
    return this.getRecommendations({
      user_email: userEmail,
      category: 'tutoring',
    });
  }

  // Get personalized scholarship recommendations using GPT-4
  async getPersonalizedScholarships(request: ScholarshipRequest): Promise<ScholarshipResponse> {
    return this.makeRequest('/personalized-scholarships', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Convenience method for getting scholarship recommendations for a user
  async getScholarshipRecommendations(userEmail: string, scholarshipsData: ScholarshipData[]): Promise<ScholarshipResponse> {
    return this.getPersonalizedScholarships({
      user_email: userEmail,
      scholarships_data: scholarshipsData,
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export default ApiService;
