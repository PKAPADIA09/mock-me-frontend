import { ResourceError } from "../../errors";

export class InvalidCredentials extends ResourceError {
    public constructor() {
        const message = 'User has inputted invalid credentials';
        const statusCode = 401;
        const code = 'INVALID_CREDENTIALS'

        super( { message, statusCode, code } )
    }
}

export class UserAlreadyExists extends ResourceError {
    public constructor() {
        const message = 'User Already Exists';
        const statusCode = 409;
        const code = 'USER_ALREADY_EXISTS'

        super( { message, statusCode, code } )
    }
}