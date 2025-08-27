import express from 'express';
import { asyncHandler  } from '../../shared/middleware/error.middleware';
import { createInterviewHandler, getInterviewByIdHandler, listInterviewsHandler, getInterviewQuestionsHandler } from './interviews.ctrl';
export const interviewRouter = express.Router();

interviewRouter
    .post( '/', asyncHandler( createInterviewHandler ) )
    .get('/', asyncHandler(listInterviewsHandler))
    // Order matters: place specific route before dynamic :id
    .get('/:id/questions', asyncHandler(getInterviewQuestionsHandler))
    .get('/:id', asyncHandler( getInterviewByIdHandler ) );