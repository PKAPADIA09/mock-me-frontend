import humps from 'humps';

// This utility function converts an object's properties from snake_case to camelCase.
// It's crucial for mapping database results to your TypeScript interfaces.
export const convertObjectPropsToCamelCase = <T = unknown> (
    object: { [ key: string ]: T }
): { [ key: string ]: T } => {
    // This is a common pattern to handle complex objects and trim strings
    const trimString = ( key: string, value: string ): string => {
        if ( typeof value === 'string' ) {
            return value.trim();
        }
        return value;
    };
    object = JSON.parse( JSON.stringify( object, trimString ) );
    // Use the 'humps' library to do the conversion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return humps.camelizeKeys(
        object as any
    ) as unknown as { [ key: string ]: T };
};

// You can add other utility functions here if needed.
// This is just a placeholder to show the structure.
export const convertStringToCamelCase = ( value: string ): string =>
    humps.camelize( value );

export const convertStringToSnakeCase = ( value: string ): string =>
    humps.decamelize( value );
