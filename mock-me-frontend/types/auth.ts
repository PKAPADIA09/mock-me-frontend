// User types matching your backend
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password?: string; // Add password field since User might include it
    created_at?: string;
    updated_at?: string;
  }
  
  // AuthUser is User without password - now this makes sense
  export interface AuthUser extends Omit<User, 'password'> {
    // Explicitly define the structure to avoid empty interface
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface AuthTokens {
    accessToken: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface SignUpRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    user: AuthUser;
    tokens: AuthTokens;
  }
  
  // Use type alias instead of empty interface extending
  export type SignUpResponse = User;
  
  export interface ApiErrorResponse {
    message: string;
    statusCode: number;
    code: string;
  }