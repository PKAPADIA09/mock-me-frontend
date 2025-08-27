import express from 'express';
import { createUserHandler, getUserHandler, updateUserHandler } from './users.ctrl';
import { asyncHandler  } from '../../shared/middleware/error.middleware';
export const userRouter = express.Router();

userRouter
    .post( '/', asyncHandler( createUserHandler ) );

userRouter
    .patch( '/:userId', asyncHandler( updateUserHandler ) );

userRouter
    .get( '/', asyncHandler( getUserHandler ) ); 