import express from 'express';
import { createLoginHandler, createSignUpHandler } from './auth.ctrl';
import { asyncHandler  } from '../../shared/middleware/error.middleware';
export const authRouter = express.Router();

authRouter
    .post( '/login', asyncHandler( createLoginHandler ) );

authRouter
    .post( '/sign-up', asyncHandler( createSignUpHandler ) );