import { ResourceError } from '../errors';
import { DatabaseErrorParams } from './db.types';

interface DatabaseQueryErrorConstructorParams {
    error: DatabaseErrorParams;
    code?: string;
    message?: string;
    statusCode?: number;
}

export class DatabaseQueryError extends ResourceError {
    error: DatabaseErrorParams;

    public constructor ( {
        error
        , code
        , message = 'The database query could not be fulfilled.'
        , statusCode = 500
    }: DatabaseQueryErrorConstructorParams ) {
        super( {
            message, error, code, statusCode
        } );
        this.error = error;
    }
}

export class DatabaseNotNullError extends DatabaseQueryError {
    public constructor ( error: DatabaseErrorParams ) {
        const message = 'A not-null constraint was violated';
        const statusCode = 400;
        super( { error, message, statusCode } );
    }
}

export class DatabaseForeignKeyError extends DatabaseQueryError {
    public constructor ( error: DatabaseErrorParams ) {
        const message = 'A foreign key constraint was violated';
        const statusCode = 400;
        super( { error, message, statusCode } );
    }
}

export class DatabaseDuplicateKeyError extends DatabaseQueryError {
    public constructor ( error: DatabaseErrorParams ) {
        const message = 'A unique key constraint was violated';
        const statusCode = 400;
        super( { error, message, statusCode } );
    }
}
