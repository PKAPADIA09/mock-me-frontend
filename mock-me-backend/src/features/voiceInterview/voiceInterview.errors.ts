import { ResourceError } from "../../errors";

export class InterviewNotFound extends ResourceError {
    public constructor() {
        const message = 'Interview not found';
        const statusCode = 404;
        const code = 'INTERVIEW_NOT_FOUND'

        super( { message, statusCode, code } )
    }
};

export class VoiceInterviewSessionNotFound extends ResourceError {
    public constructor() {
        const message = 'Voice interview session not found';
        const statusCode = 404;
        const code = 'INTERVIEW_SESSION_NOT_FOUND'

        super( { message, statusCode, code } )
    }
};

export class TranscriptionError extends ResourceError {
    public constructor(message: string = 'Audio transcription failed') {
        const statusCode = 500;
        const code = 'TRANSCRIPTION_ERROR';
        super({ message, statusCode, code });
    }
}
