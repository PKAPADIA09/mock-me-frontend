// Interview types matching your backend
export interface CreateInterviewRequest {
    role: string;
    level: string;
    techStack?: string[];
    numberOfQuestions: number;
    companyName: string;
    jobDescription: string;
    companyWebsite?: string;
    interviewFocus?: InterviewFocusType[];
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
    interviewFocus?: InterviewFocusType[];
    userId: number;
    createdAt: string;
    interviewQuestions: string[]; // Array of generated questions
  }

  // Individual interview question from database
  export interface InterviewQuestion {
    id: number;
    interviewId: number;
    question: string;
    answer: string;
    feedback?: string;
    questionOrder: number;
  }
  
  export type InterviewFocusType = 
    | 'Behavioral' 
    | 'Situational' 
    | 'Experience-Based' 
    | 'Technical' 
    | 'Problem-Solving' 
    | 'Leadership' 
    | 'Cultural-Fit';
  
  export type InterviewLevel = 
    | 'Entry Level' 
    | 'Mid Level' 
    | 'Senior Level' 
    | 'Lead/Principal' 
    | 'Executive';
  
  // Use type alias instead of empty interface extending
  export type CreateInterviewResponse = Interview;
  
  export interface ApiErrorResponse {
    message: string;
    statusCode: number;
    code: string;
  }