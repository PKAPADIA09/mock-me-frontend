import { asyncHandler } from "../../shared/middleware/error.middleware";
import { Response } from 'express';
import { ResourceError } from "../../errors";
import { CreateLoginRequest, CreateLoginResponse, CreateSignUpRequest, CreateSignUpResponse } from "./auth.types";
import { createLogin, createSignUp } from "./auth.service";

export const createLoginHandler = asyncHandler( async(
    req: CreateLoginRequest
    , res: Response<ResourceError | CreateLoginResponse>
): Promise<Response<ResourceError | CreateLoginResponse>> => {

    const createLoginResult = await createLogin( req.body.email, req.body.password );

    if ( createLoginResult.isError() ) {
        return res
            .status( createLoginResult.value.statusCode ) 
            .json( createLoginResult.value )
    }

    return res
        .status( 200 )
        .json( createLoginResult.value )

} )


export const createSignUpHandler = asyncHandler( async(
    req: CreateSignUpRequest
    , res: Response<ResourceError | CreateSignUpResponse>
): Promise<Response<ResourceError | CreateSignUpResponse>> => {
    
    const createSignUpResult = await createSignUp( req.body )

    if ( createSignUpResult.isError() ) {
        return res
            .status( createSignUpResult.value.statusCode ) 
            .json( createSignUpResult.value );
    }

    return res
        .status( 201 )
        .json( createSignUpResult.value )
} )