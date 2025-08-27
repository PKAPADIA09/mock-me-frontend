import { ErrorConstructorParams } from '../types/errorConstructorParams';
import { ResourceError } from './resourceError';

export class ResourceNotFound extends ResourceError {
    public constructor ( params: ErrorConstructorParams ) {
        const message = 'The requested resource was not found.';
        const code = 'RESOURCE_NOT_FOUND';
        const statusCode = 404;
        super( {
            message: params.message || message
            , code: params.code || code
            , statusCode: params.statusCode || statusCode
            , error: params.error
        } );
    }
}
