// API utility functions
import { ApiErrorResponse, LoginResponse, SignUpResponse, User } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('mockme_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        message: 'An error occurred',
        statusCode: response.status,
        code: 'UNKNOWN_ERROR',
      }));

      throw new ApiError(
        errorData.statusCode,
        errorData.code,
        errorData.message
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network error or other issues
    throw new ApiError(0, 'NETWORK_ERROR', 'Network error occurred');
  }
};

// Interview types for the API
export interface CreateInterviewRequest {
  role: string;
  level: string;
  techStack?: string[];
  numberOfQuestions: number;
  companyName: string;
  jobDescription: string;
  companyWebsite?: string;
  interviewFocus?: ('Behavioral' | 'Situational' | 'Experience-Based' | 'Technical' | 'Problem-Solving' | 'Leadership' | 'Cultural-Fit')[];
  userId: number;
}

export interface Interview {
  id: number;
  role: string;
  level: string;
  techStack?: string[];
  numberOfQuestions: number;
  companyName: string;
  jobDescription: string;
  companyWebsite?: string;
  interviewFocus?: ('Behavioral' | 'Situational' | 'Experience-Based' | 'Technical' | 'Problem-Solving' | 'Leadership' | 'Cultural-Fit')[];
  userId: number;
  createdAt: string;
  interviewQuestions: string[];
}

// User update types
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

// Auth-specific API functions
export const authApi = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    apiRequest<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signUp: (firstName: string, lastName: string, email: string, password: string): Promise<SignUpResponse> =>
    apiRequest<SignUpResponse>('/api/v1/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    }),
};

// Interview-specific API functions
export const interviewApi = {
  create: (interviewData: CreateInterviewRequest): Promise<Interview> =>
    apiRequest<Interview>('/api/v1/interview', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    }),

  getAll: (): Promise<Interview[]> =>
    apiRequest<Interview[]>('/api/v1/interview'),

  getById: (id: number): Promise<Interview> =>
    apiRequest<Interview>(`/api/v1/interview/${id}`),
};

// User-specific API functions
export const userApi = {
  getProfile: (): Promise<User> => 
    apiRequest<User>('/api/v1/users/profile'),
    
  updateProfile: (data: UpdateUserRequest): Promise<User> =>
    apiRequest<User>('/api/v1/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};