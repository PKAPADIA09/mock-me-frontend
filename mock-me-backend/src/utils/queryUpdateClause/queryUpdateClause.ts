import format from 'pg-format';
import { convertStringToSnakeCase } from '..';
import { QueryParams } from '../../db/db.types';
import { isCustomColumn, isForeignTableColumn } from './queryUpdateClause.guards';
import {
    Field
    , UpdateClauseFields
    , UpdateClauseReturn
} from './queryUpdateClause.types';

export const buildQueryUpdateClause = <T>(
    fields: UpdateClauseFields<T>
    , values: Required<QueryParams>['values']
): UpdateClauseReturn => {
    let updateClause = '';
    const fieldKeys = Object.keys( fields ) as Array<keyof T>;

    for ( let i = 0; i < fieldKeys.length; i++ ) {
        const key = fieldKeys[i];
        const fieldValue: Field<T> = fields[ fieldKeys[ i ] ];

        if ( isCustomColumn<T>( fieldValue ) ) {
            const columnName = fieldValue.columnName;
            const columnValue = fieldValue.value;

            updateClause += `${ String( columnName ) } = $${ values.length + 1 }`;
            values.push( columnValue );
        } else if ( isForeignTableColumn<T>( fieldValue ) ) {
            const columnName = fieldValue.columnName
                ||  convertStringToSnakeCase(
                    String( key )
                );

            const subQuery = format(
                `( SELECT %I FROM %I ${ fieldValue.selectConstraints } )`
                , fieldValue.foreignTableColumnName
                , fieldValue.foreignTable
            );
            updateClause += `${ String( columnName ) } = ${ subQuery }`;
        } else {
            const columnName = convertStringToSnakeCase(
                String( key )
            );
            const columnValue = fieldValue;

            updateClause += `${ columnName } = $${ values.length + 1 }`;
            values.push( columnValue );
        }

        if ( i < fieldKeys.length - 1 ) updateClause += ', ';
    }

    return { updateClause, values };

};