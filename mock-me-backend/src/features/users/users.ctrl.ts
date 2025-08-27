import { Response } from 'express';
import { ResourceError } from "../../errors";
import { asyncHandler } from "../../shared/middleware/error.middleware";
import { CreateUserRequest, CreateUserResponse, GetUserRequest, UpdateUserRequest, UpdateUserResponse, User } from "./users.types";
import { createUser, updateUser, getUserByEmail } from './users.service';

export const createUserHandler = asyncHandler( async (
    req: CreateUserRequest
    , res: Response<ResourceError | CreateUserResponse>
): Promise<Response<ResourceError | CreateUserResponse>> => {
    const createUserResult = await createUser( req.body );

    if ( createUserResult.isError() ) {
        return res
            .status( createUserResult.value.statusCode )
            .json( createUserResult.value );
    }

    return res
        .status( 201 )
        .json( createUserResult.value );
} );

export const updateUserHandler = asyncHandler( async(
    req: UpdateUserRequest
    , res: Response<ResourceError | UpdateUserResponse>
): Promise<Response<ResourceError | UpdateUserResponse>> => {

    const updateUserResult = await updateUser( Number( req.params.userId ), req.body )

    if ( updateUserResult.isError() ) {
        return res
            .status( updateUserResult.value.statusCode )
            .json( updateUserResult.value )
    }
    
    return res
        .status( 200 )
        .json( updateUserResult.value )
} )


export const getUserHandler = asyncHandler( async(
    req: GetUserRequest
    , res: Response<ResourceError | User>
): Promise<Response<ResourceError | User>> => {
    const getUserResult = await getUserByEmail( req.body.email )

    if ( getUserResult.isError() ) {
        return res
            .status( getUserResult.value.statusCode )
            .json( getUserResult.value ) 
    }

    return res
        .status( 201 )
        .json( getUserResult.value )
} )