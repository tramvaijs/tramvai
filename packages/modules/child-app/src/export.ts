import type { TokenInterface } from '@tinkoff/dippy';

export * from '@tramvai/tokens-child-app';
export { ChildApp } from './shared/react/component';

export interface TypedContractsRequired {}
export interface TypedContractsProvided {}

export interface TypedContracts {
  required: TypedContractsRequired;
  provided: TypedContractsProvided;
}

/**
 * opaque types for unknown symbols will not be expanded (in error message)
 */
declare const errorTag: unique symbol;
export type TypesError<T> = { [errorTag]: T };

/**
 * expand generic types one level down (in error message)
 */
type Prettify<T> = T extends Record<string, any> ? {} & { [P in keyof T]: T[P] } : {} & T;

/**
 * exclude keys with `never` value from records
 */
type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

/**
 * validate required and provided contracts, `TypesError` returns on failure
 */
export type ContractsValidation = TypedContracts extends {
  required: TypedContractsRequired;
  provided: TypedContractsRequired;
}
  ? TypedContracts
  : TypesError<
      Prettify<
        OmitNever<{
          [key in keyof Omit<TypedContracts['required'], keyof TypedContracts['provided']>]: {
            message: `Contract is not provided`;
          };
        }> &
          OmitNever<{
            [key in keyof TypedContracts['provided']]: TypedContracts['provided'][key] extends TypedContracts['required'][key]
              ? never
              : {
                  message: `Contract is incompatible`;
                  expected: TypedContracts['required'][key] extends TokenInterface<infer T>
                    ? T
                    : TypedContracts['required'][key];
                  actual: TypedContracts['provided'][key] extends TokenInterface<infer T>
                    ? T
                    : TypedContracts['provided'][key];
                };
          }>
      >
    >;

/**
 * only for type-checking, simple way to fail application build if contracts are not valid
 *
 * @example `Assert({} as ContractsValidation)`
 */
export const Assert = <T>(t: T extends TypesError<any> ? never : T) => {};
