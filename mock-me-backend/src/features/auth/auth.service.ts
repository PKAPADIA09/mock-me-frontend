import { DatabaseQueryError } from "../../db/db.errors";
import { success, Either, error } from "../../types/either";
import { UserNotFound } from "../users/users.error";
import { createUser, getUserByEmail } from "../users/users.service";
import { NewUser, User } from "../users/users.types";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/environment';
import { InvalidCredentials, UserAlreadyExists } from "./auth.errors";
import { AuthTokens, CreateLoginResponse, CreateSignUpRequest } from "./auth.types";


export const createLogin = async(
    email: User['email']
    , password: User['password']
): Promise<Either<DatabaseQueryError | UserNotFound | InvalidCredentials, CreateLoginResponse>> => {

    const getUserResult = await getUserByEmail( email )

    //user needs to sign up
    if ( getUserResult.isError() ) {
        return error( new UserNotFound() )
    }

    const user = getUserResult.value;

    const isPasswordCorrect = await bcrypt.compare( password, user.password)

    if ( isPasswordCorrect ) {
        const authUser = {
            id: user.id
            , firstName: user.firstName
            , lastName: user.lastName
            , email: user.email
        }
        const accessToken = jwt.sign(
            {
                id: user.id
                , email: user.email
            }
            , env.JWT_SECRET
            , { 
                expiresIn: '7d'
            } );

        const tokens: AuthTokens = { accessToken };
    
        const { password: _, ...userWithoutPassword } = user;
            
        return success( {
            user: userWithoutPassword,
            tokens
        } );
    } else {
        //user input incorrect password
        return error( new InvalidCredentials )
    }
}


export const createSignUp = async(
    userData: CreateSignUpRequest['body']
): Promise<Either<DatabaseQueryError | UserAlreadyExists, User>> => {
    
    // Check if user already exists
    const existingUserResult = await getUserByEmail(userData.email);
    
    if ( existingUserResult.isSuccess() ) {
        return error( new UserAlreadyExists() );
    }
    
    // Create new user
    const newUserResult = await createUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password
    });
    
    if (newUserResult.isError()) {
        return error(newUserResult.value);
    }
    
    return success(newUserResult.value);
};