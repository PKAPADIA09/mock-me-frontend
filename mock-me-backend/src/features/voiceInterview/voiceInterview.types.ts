import { Request } from 'express';

export interface StartVoiceInterviewRequest extends Request {
    body: {
        interviewId: number;
        userId: number
    }
}

export interface StartVoiceInterviewResponse {
    sessionId: string;
    greetingMessage: string;
    greetingAudio: string;

}   

export interface VoiceInterview {
    interviewId: number;
    userId: number
};

export interface VoiceInterviewSession {
    sessionId: string;
    interviewId: number;
    userId: number;
    currentQuestionIndex: number;
    questions: InterviewQuestionData[];
    isCompleted: boolean;
    startedAt: string;
}

export interface InterviewQuestionData {
    id: number;
    question: string;
    answer: string;
    questionOrder: number;
    audioFile?: string;
}

export interface GetNextQuestionRequest extends Request {
    params: {
        sessionId: string;
    }
}

export interface GetNextQuestionResponse {
    questionId: number;
    question: string;
    questionAudio: string;
    questionNumber: number;
    totalQuestions: number;
    isLastQuestion: boolean;
}

export interface SubmitAnswerRequest extends Request {
    body: {
        sessionId: string;
        questionId: string;
    };
    file?: Express.Multer.File;
}

export interface SubmitAnswerResponse {
    success: boolean;
    message: string;
    nextQuestionAvailable: boolean;
    transcript?: string;
    confidence?: number;
}

export interface EndInterviewRequest extends Request {
    body: {
        sessionId: string;
    }
}

export interface EndInterviewResponse {
    message: string;
    farewellAudio: string;
    interviewSummary: {
        totalQuestions: number;
        answeredQuestions: number;
        duration: string;
    }
}


export interface DeepgramTranscriptionResult {
    transcript: string;
    confidence: number;
    words?: Array<{
        word: string;
        start: number;
        end: number;
        confidence: number;
    }>;
}