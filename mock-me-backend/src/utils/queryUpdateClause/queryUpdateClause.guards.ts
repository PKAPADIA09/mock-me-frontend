import {
    CustomColumn
    , Field
    , ForeignTableColumn
} from './queryUpdateClause.types';


export const isCustomColumn = <T>(
    field: Field<T>
): field is CustomColumn<T> => {
    return typeof field === 'object'
        && field !== null
        && 'columnName' in ( field as CustomColumn<T> )
        && 'value' in ( field as CustomColumn<T> );
};

export const isForeignTableColumn = <T>(
    field: Field<T>
): field is ForeignTableColumn<T> => {
    return typeof field === 'object'
        && field !== null
        && 'foreignTable' in ( field as ForeignTableColumn<T> );
};