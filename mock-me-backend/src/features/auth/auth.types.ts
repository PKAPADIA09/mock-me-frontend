import { Request } from 'express';
import { User } from '../users/users.types';

export interface CreateLoginRequest extends Request {
    body: {
        email: string
    , password: string
    } 
}

export interface CreateSignUpRequest extends Request {
    body: {
        firstName: string
        , lastName: string
        , email: string
        , password: string
    }
}

export interface AuthTokens {
    accessToken: string;
}

// A new interface to represent the user in an auth response, without the password.
export interface AuthTokens {
    accessToken: string;
}

export interface AuthUser extends Omit<User, 'password'> {}

export interface CreateLoginResponse {
    user: AuthUser;
    tokens: AuthTokens;
}

export type CreateSignUpResponse = User;
