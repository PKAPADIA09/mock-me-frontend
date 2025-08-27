import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../../shared/middleware/error.middleware';
import { 
    startVoiceInterviewHandler, 
    getNextQuestionHandler, 
    submitAnswerHandler, 
    endVoiceInterviewHandler 
} from './voiceInterview.ctrl';

export const voiceInterviewRouter = express.Router();

// Configure multer storage for uploaded answer audio
const storage = multer.diskStorage({
    destination: (req: express.Request, file: any, cb: (error: any, destination: string) => void) => {
        const dir = path.join('.', 'uploads', 'audio');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req: express.Request, file: any, cb: (error: any, filename: string) => void) => {
        const ext = path.extname(file.originalname) || '.mp3';
        cb(null, `answer_${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

voiceInterviewRouter
    .post('/start', asyncHandler(startVoiceInterviewHandler))
    .get('/:sessionId/next-question', asyncHandler(getNextQuestionHandler))
    .post('/submit-answer', upload.single('audioFile'), asyncHandler(submitAnswerHandler))
    .post('/end', asyncHandler(endVoiceInterviewHandler));