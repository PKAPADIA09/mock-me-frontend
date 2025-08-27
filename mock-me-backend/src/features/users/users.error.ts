import { ResourceError } from "../../errors";

export class UserNotFound extends ResourceError {
    public constructor() {
        const message = 'User not found';
        const statusCode = 404;
        const code = 'USER_NOT_FOUND'

        super( { message, statusCode, code } )
    }
}