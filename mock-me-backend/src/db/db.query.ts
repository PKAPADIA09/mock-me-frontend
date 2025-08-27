import {
    error, Either, success
} from '../types/either';
import {
    QueryParams
    , DatabaseErrorParams
} from './db.types';
import {
    DatabaseQueryError
    , DatabaseNotNullError
    , DatabaseForeignKeyError
    , DatabaseDuplicateKeyError
} from './db.errors';
import { pool } from './db.pool';
import { convertObjectPropsToCamelCase } from '../utils';

const buildDatabaseError = (
    error: { [key: string ]: unknown }
): DatabaseQueryError => {
    const dbError: DatabaseErrorParams = {
        errorMessage: String( error?.message )
        , detail: String( error?.detail )
        , name: String( error?.name )
        , code: String( error?.code )
        , column: String( error?.column )
        , dataType: String( error?.dataType )
        , schema: String( error?.schema )
        , table: String( error?.table )
    };

    if ( dbError.code === '23502' )
        return new DatabaseNotNullError( dbError );
    if ( dbError.code === '23503' )
        return new DatabaseForeignKeyError( dbError );
    if ( dbError.code === '23505' )
        return new DatabaseDuplicateKeyError( dbError );

    return new DatabaseQueryError( { error: dbError } );
};

export const query = async <T>(
    params: QueryParams
): Promise< Either< DatabaseQueryError, T > > => {
    try {
        const results = await pool.query( params );
        const { rows } = results;
        
        // This utility function is crucial. If you don't have it, you'll need to create it.
        const formattedRows = rows.map( result =>
            convertObjectPropsToCamelCase( result ) ) as unknown;
        
        return success( formattedRows as T );
    } catch ( err ) {
        const dbError = buildDatabaseError(
            err as { [key: string ]: unknown }
        );
        console.error( dbError );
        return error( dbError );
    }
};
