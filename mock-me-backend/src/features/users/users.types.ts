import { Request } from 'express';

export interface NewUser {
    firstName: string;
    lastName: string;
    email: string;
    password:string;
}

export interface User extends NewUser {
    id: number; 
    created_at?: string;
    updated_at?: string
}

export interface CreateUserRequest extends Request {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
}

export type CreateUserResponse = User;

export interface UpdateUserRequest extends Request {
    params: {
        userId: string 
    }
    body: {
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
    }
}

export interface GetUserRequest extends Request {
    email: string;
    
}

export type UpdateUserResponse = User;