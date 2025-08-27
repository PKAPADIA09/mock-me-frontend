import { Request } from 'express';

export interface CreateInterviewRequest extends Request {
    body: {
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
}

export interface GetInterviewByIdRequest extends Request {
    params: {
        id: string;
    }
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
    interviewQuestions?: string[]; // Array of generated question strings
}

export interface InterviewQuestion {
    interviewId: number;
    question: string;
    answer: string;
    feedback?: string;
    questionOrder: number;
}

export interface CreateInterviewQuestionResponse extends InterviewQuestion {
    id: number;
    interviewId: number;
    question: string;
    answer: string;
    feedback?: string;
    questionOrder: number;
}

export type CreateInterviewResponse = Interview;

// Define the structure of the Gemini API response
export interface GeminiResponse {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
        };
    }[];
}