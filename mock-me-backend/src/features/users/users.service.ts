import bcrypt from 'bcrypt';
import { DatabaseQueryError } from '../../db/db.errors';
import { query } from '../../db/db.query';
import {
    Either
    , error
    , success
} from '../../types/either';

import { NewUser, User } from "./users.types";
import { buildQueryUpdateClause, UpdateClauseFields } from '../../utils/queryUpdateClause';
import { UserNotFound } from './users.error';

export const createUser = async(
    newUser: NewUser
): Promise<Either<DatabaseQueryError, User>> => {

    const hashedPassword = await bcrypt.hash( newUser.password, 10 );

    const text = `
        INSERT INTO users
        (
            first_name
            , last_name
            , email
            , password
        )
        VALUES ( $1, $2, $3, $4 )
        RETURNING id
            , first_name
            , last_name
            , email
            , password
            , created_at
            , updated_at
    `;

    const values = [
        newUser.firstName
        , newUser.lastName
        , newUser.email
        , hashedPassword
    ]

    const queryResult = await query<User[]>( {text, values} );

    if ( queryResult.isError() ) {
        return error( queryResult.value )
    }

    const [ createdUser ] = queryResult.value;

    return success( createdUser );
}


export const updateUser = async(
    userId: User['id']
    , fields: UpdateClauseFields<Omit<User, 'id'>>
): Promise<Either<DatabaseQueryError | UserNotFound, User>> => {
    
    const { updateClause, values } = buildQueryUpdateClause(
        fields
        , [ userId ]
    );

    const text = `
        UPDATE users
        SET ${ updateClause }
        WHERE users.id = $1
        RETURNING users.id
        , users.first_name
        , users.last_name
        , users.email
        , users.password
        , users.created_at
        , users.updated_at
    `
    const queryResult = await query<User[]>( { text, values })

    if ( queryResult.isError() ) {
        return error( new UserNotFound() )
    } 

    const [ user ] = queryResult.value;

    return success( user )

}


export const getUserByEmail = async(
    email: User['email']
): Promise<Either<DatabaseQueryError | UserNotFound, User>> => {

    const text = `
        SELECT 
            id
            , first_name
            , last_name
            , email
            , password
            , created_at
            , updated_at
        FROM users
        WHERE users.email = $1
    `

    const values = [ email ];

    const queryResult = await query<User[]>( { text, values } );

    if ( queryResult.isError() ) {
        return error( queryResult.value )
    }   

    const [ user ] = queryResult.value 

    if ( !user ) {
        return error( new UserNotFound() );
    }

    return success( user )    
}

export const getUserById = async(
    userId: User['id']
): Promise<Either<DatabaseQueryError | UserNotFound, User>> => {

    const text = `
        SELECT 
            id
            , first_name
            , last_name
            , email
            , password
            , created_at
            , updated_at
        FROM users
        WHERE users.id = $1
    `

    const values = [ userId ];

    const queryResult = await query<User[]>( { text, values } );

    if ( queryResult.isError() ) {
        return error( queryResult.value )
    }   

    const [ user ] = queryResult.value 

    if ( !user ) {
        return error( new UserNotFound() );
    }

    return success( user )    
}