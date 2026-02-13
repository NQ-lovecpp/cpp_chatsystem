import type { ZodObject, ZodType } from 'zod';
type ZodDefinition = Record<string, unknown> | undefined;
type ZodTypeAny = ZodType<any, any, any>;
export type ZodTypeLike = ZodTypeAny;
export type ZodObjectLike = ZodObject<any, any>;
export declare function asZodType(schema: ZodTypeLike): ZodTypeLike;
export declare function readZodDefinition(input: unknown): ZodDefinition;
export declare function readZodType(input: unknown): string | undefined;
export type ZodInfer<T extends ZodTypeLike> = T extends {
    _output: infer Output;
} ? Output : never;
export {};
