import { Validations, Values } from './interfaces';
export declare function isArray(value: unknown): value is unknown[];
export declare function isObject(value: unknown): value is object;
export declare function isTypeUndefined(value: unknown): value is undefined;
export declare function isDate(value: unknown): value is Date;
export declare function isFunction(value: unknown): value is Function;
export declare function isString(value: unknown): value is string;
export declare function isNumber(value: unknown): value is number;
export declare function isValueStringEmpty(value: string): boolean;
export declare function isValueNullOrUndefined(value: unknown): boolean;
export declare function isValueUndefined(value: unknown): boolean;
export declare function noop(): void;
export declare function cloneIfObject(value: unknown): unknown;
export declare function isSame(a: unknown, b: unknown): any;
export declare function runRules<V>(value: V, currentValues: Values, validations: Validations<V>, validationRules: Validations<V>): {
    errors: string[];
    failed: string[];
    success: string[];
};
