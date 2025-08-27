import { DatabaseQueryError } from "../../db/db.errors";
import {
    Either
    , error
    , success
} from '../../types/either';
import { getInterviewQuestions, updateInterviewQuestionAnswer, generateAndSaveFeedbackForQuestion } from "../interview/interviews.service";
import { UserNotFound } from "../users/users.error";
import { getUserById } from "../users/users.service";
import { InterviewNotFound, VoiceInterviewSessionNotFound } from "./voiceInterview.errors";
import { DeepgramTranscriptionResult, EndInterviewResponse, GetNextQuestionResponse, InterviewQuestionData, StartVoiceInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse, VoiceInterview, VoiceInterviewSession } from "./voiceInterview.types";
import fs from 'fs';
import path from 'path';
import { env } from '../../shared/config/environment';
import { spawn } from 'child_process';
import { query } from '../../db/db.query';


const activeSessions = new Map<string, VoiceInterviewSession>();

export const startVoiceInterview = async(
    voiceInterview: VoiceInterview
): Promise<Either<DatabaseQueryError | UserNotFound, StartVoiceInterviewResponse>> => {

    const userResult = await getUserById( voiceInterview.userId );

    if ( userResult.isError() ) {
        return error( userResult.value )
    };

    const userName = userResult.value.firstName;

    const questionsResult = await getInterviewQuestions( voiceInterview.interviewId );

    if (questionsResult.isError()) {
        return error(new InterviewNotFound());
    }

    const questions = questionsResult.value;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: VoiceInterviewSession = {
        sessionId,
        interviewId: voiceInterview.interviewId,
        userId: voiceInterview.userId,
        currentQuestionIndex: 0,
        questions: questions.map( q => ( {
            id: q.id,                      
            question: q.question,
            answer: q.answer,
            questionOrder: q.questionOrder
        } ) ),
        isCompleted: false,
        startedAt: new Date().toISOString()
    };

    activeSessions.set(sessionId, session);

    const greetingMessage = `Hello ${userName}! Welcome to your interview. Im excited to get to know you better today. Lets begin with our questions.`;

    const greetingAudio = await generateTtsAudio(greetingMessage);

    return success( {
            sessionId
            , greetingMessage
            , greetingAudio
        } );
}


export const getNextQuestion = async(
    sessionId: string
): Promise<Either<DatabaseQueryError | VoiceInterviewSessionNotFound , GetNextQuestionResponse>> => {

    const session = activeSessions.get( sessionId );

    if ( !session || ( session.currentQuestionIndex >= session.questions.length ) ) {
        return error( new VoiceInterviewSessionNotFound )
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const questionAudio = await generateTtsAudio(currentQuestion.question);

    return success( {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        questionAudio,
        questionNumber: session.currentQuestionIndex + 1,
        totalQuestions: session.questions.length,
        isLastQuestion: session.currentQuestionIndex === session.questions.length - 1
    } );
}


export const submitAnswer = async(
    answerData: { sessionId: string; questionId: number; audioFile: string }
): Promise<Either<DatabaseQueryError | VoiceInterviewSessionNotFound | Error, SubmitAnswerResponse>> => {

    const session = activeSessions.get( answerData.sessionId );

    if ( !session ) {
        return error( new VoiceInterviewSessionNotFound )
    }

    console.log('SubmitAnswer: starting transcription', { audioFile: answerData.audioFile, questionId: answerData.questionId, sessionId: answerData.sessionId });
    const transcriptionResult = await transcribeAudioWithDeepgram( answerData.audioFile );
    
    if (transcriptionResult.isError()) {
        return error(transcriptionResult.value);
    }

    const transcription = transcriptionResult.value.transcript;

    console.log('SubmitAnswer: transcription received', { transcript: transcription.slice(0, 120) });
    const updateResult = await updateInterviewQuestionAnswer(answerData.questionId, transcription);
    
    if (updateResult.isError()) {
        return error(updateResult.value);
    }

    const questionIndex = session.questions.findIndex(q => q.id === answerData.questionId);
    if (questionIndex !== -1) {
        session.questions[questionIndex].answer = transcription;
        if ( answerData.audioFile ) {
            session.questions[questionIndex].audioFile = answerData.audioFile;
        }
    }

    // Optionally generate feedback per question
    try {
        await generateAndSaveFeedbackForQuestion(answerData.questionId, transcription);
    } catch (e) {
        console.warn('Feedback generation failed, continuing without feedback:', e);
    }

    // Move to next question
    session.currentQuestionIndex++;
    const hasNextQuestion = session.currentQuestionIndex < session.questions.length;

    if (!hasNextQuestion) {
        session.isCompleted = true;
    }

    activeSessions.set(answerData.sessionId, session);

    return success({
        success: true,
        message: hasNextQuestion ? "Answer recorded. Ready for next question." : "All questions completed!",
        nextQuestionAvailable: hasNextQuestion,
        transcript: transcription,
        confidence: transcriptionResult.value.confidence,
    });
}


export const endVoiceInterview = async (
    sessionId: string
): Promise<Either<VoiceInterviewSessionNotFound, EndInterviewResponse>> => {
    
    const session = activeSessions.get(sessionId);
    if (!session) {
        return error(new VoiceInterviewSessionNotFound());
    }

    // Get user for personalized farewell
    const userResult = await getUserById(session.userId);
    const userName = userResult.isError() ? "there" : userResult.value.firstName;

    const farewellMessage = `Thank you ${userName}! It was lovely speaking with you today. Your interview has been completed successfully. Best of luck!`;
    const farewellAudio = await generateTtsAudio(farewellMessage);

    // Calculate duration
    const startTime = new Date(session.startedAt);
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const duration = `${Math.floor(durationMs / 60000)} minutes`;

    // Clean up session
    activeSessions.delete(sessionId);

    return success({
        message: farewellMessage,
        farewellAudio,
        interviewSummary: {
            totalQuestions: session.questions.length,
            answeredQuestions: session.questions.filter(q => q.answer.trim() !== '').length,
            duration
        }
    });
};


async function generateAudioWithElevenLabs( text: string): Promise<string> {

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVEN_LABS_API_KEY || ''
        },
        body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.8,
                similarity_boost: 0.8,
                style: 0.2,
                use_speaker_boost: true
            }
        })
    });

    console.log('ElevenLabs response status:', response.status);

    if (!response.ok) {
        throw new Error('ElevenLabs API failed');
    }

    const audioBuffer = await response.arrayBuffer();
    
    const fileName = `audio_${Date.now()}.mp3`;
    const path = `./uploads/audio/${fileName}`;
    
    const dir = './uploads/audio';
    if ( !fs.existsSync( dir ) ) {
        fs.mkdirSync( dir, { recursive: true } );
    }
    
    fs.writeFileSync( path, Buffer.from( audioBuffer ) );
    
    return `/uploads/audio/${fileName}`;
}

async function generateAudioWithPiper(text: string): Promise<string> {
    const fileName = `audio_${Date.now()}.wav`;
    const audioDir = path.join('.', 'uploads', 'audio');
    const filePath = path.join(audioDir, fileName);

    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }

    if (env.PIPER_MODE === 'server') {
        const piperUrl = env.PIPER_URL || 'http://localhost:59125';
        // Try /speak first; if it fails, try /synthesize with a default voice
        let response = await fetch(`${piperUrl}/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!response.ok) {
            response = await fetch(`${piperUrl}/synthesize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice: 'en_US-amy-medium' })
            });
        }
        if (!response.ok) {
            throw new Error(`Piper TTS failed: ${response.statusText}`);
        }
        const wavBuffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(wavBuffer));
        return `/uploads/audio/${fileName}`;
    }

    // Binary mode: call local piper CLI
    const piperBin = env.PIPER_BINARY_PATH || 'piper';
    const modelPath = env.PIPER_MODEL_PATH;
    if (!modelPath) {
        throw new Error('PIPER_MODEL_PATH is required in binary mode');
    }

    await new Promise<void>((resolve, reject) => {
        const proc = spawn(piperBin, ['-m', modelPath, '-f', filePath], { stdio: ['pipe', 'inherit', 'inherit'] });
        proc.on('error', reject);
        proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`piper exited with code ${code}`));
        });
        proc.stdin.write(text);
        proc.stdin.end();
    });

    return `/uploads/audio/${fileName}`;
}

async function generateTtsAudio(text: string): Promise<string> {
    if (env.TTS_PROVIDER === 'elevenlabs') {
        return generateAudioWithElevenLabs(text);
    }
    // default to piper
    return generateAudioWithPiper(text);
}

export async function transcribeAudioWithDeepgram(
    audioFilePath: string
): Promise<Either<Error, DeepgramTranscriptionResult>> {
    
    try {
        const response = await fetch('https://api.deepgram.com/v1/listen', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
                'Content-Type': 'audio/mpeg'
            },
            body: fs.readFileSync(audioFilePath)
        });

        if (!response.ok) {
            throw new Error(`Deepgram API failed: ${response.statusText}`);
        }

        const result = await response.json() as {
            results?: {
                channels?: Array<{
                    alternatives?: Array<{
                        transcript?: string;
                        confidence?: number;
                        words?: Array<{
                            word: string;
                            start: number;
                            end: number;
                            confidence: number;
                        }>;
                    }>;
                }>;
            };
        };
        
        const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
        const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
        const words = result.results?.channels?.[0]?.alternatives?.[0]?.words || [];

        return success({
            transcript,
            confidence,
            words
        });
        
    } catch ( err ) {
        return error( err as Error);
    }
}