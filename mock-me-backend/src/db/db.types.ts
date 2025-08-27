type PrimitiveValue = number
    | string
    | null
    | boolean
    | undefined;

type AcceptableValue = PrimitiveValue | PrimitiveValue[] | Set<PrimitiveValue>;

export interface QueryParams {
    text: string;
    values?: ( AcceptableValue | AcceptableValue[] )[];
}
export interface DatabaseErrorParams {
  errorMessage: string;
  detail?: string;
  name?: string;
  code?: string;
  column?: string;
  dataType?: string;
  schema?: string;
  table?: string;
}
