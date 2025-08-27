import { QueryParams } from "../../db/db.types";

export type ArrayElement<A> = A extends readonly ( infer T )[] ? T : never;

export type AtLeastOne<T, U
    = {[K in keyof T]: Pick<T, K> }>
    = Partial<T> & U[keyof U]

export interface CustomColumn<T> {
    columnName: keyof T | string;
    value: ArrayElement<QueryParams['values']>;
}

export interface ForeignTableColumn<T> {
    columnName?: keyof T | string;
    foreignTable: string;
    foreignTableColumnName: string;
    selectConstraints: string;
}

export type Field<T> = CustomColumn<T> | ForeignTableColumn<T> | ArrayElement<QueryParams['values']>;

export type UpdateClauseFields<T> = AtLeastOne<{ [key in keyof T]?: Field<T> }>;

export interface UpdateClauseReturn {
    updateClause: string;
    values: Required<QueryParams>['values'];
}