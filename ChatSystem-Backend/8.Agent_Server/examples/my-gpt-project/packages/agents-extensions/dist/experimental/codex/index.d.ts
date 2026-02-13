import type { FunctionCallItem, FunctionTool } from '@openai/agents';
import { Codex, type CodexOptions, type SandboxMode, type ThreadEvent, type ThreadOptions, type TurnOptions, type Usage as CodexUsage } from '@openai/codex-sdk';
import { z } from 'zod';
declare const OutputSchemaDescriptorSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    properties: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        schema: z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"string">;
            description: z.ZodOptional<z.ZodString>;
            enum: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"number">;
            description: z.ZodOptional<z.ZodString>;
            enum: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"integer">;
            description: z.ZodOptional<z.ZodString>;
            enum: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"boolean">;
            description: z.ZodOptional<z.ZodString>;
            enum: z.ZodOptional<z.ZodArray<z.ZodBoolean>>;
        }, z.core.$strict>]>, z.ZodObject<{
            type: z.ZodLiteral<"array">;
            description: z.ZodOptional<z.ZodString>;
            items: z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"string">;
                description: z.ZodOptional<z.ZodString>;
                enum: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"number">;
                description: z.ZodOptional<z.ZodString>;
                enum: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"integer">;
                description: z.ZodOptional<z.ZodString>;
                enum: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"boolean">;
                description: z.ZodOptional<z.ZodString>;
                enum: z.ZodOptional<z.ZodArray<z.ZodBoolean>>;
            }, z.core.$strict>]>;
        }, z.core.$strict>]>;
    }, z.core.$strict>>;
    required: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
declare const codexParametersSchema: z.ZodObject<{
    inputs: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"local_image">;
        path: z.ZodString;
    }, z.core.$strict>]>>;
}, z.core.$strict>;
type CodexToolParametersSchema = typeof codexParametersSchema;
type OutputSchemaDescriptor = z.infer<typeof OutputSchemaDescriptorSchema>;
export type CodexToolStreamEvent = {
    event: ThreadEvent;
    threadId: string | null;
    toolCall?: FunctionCallItem;
};
export type CodexToolStreamHandler = (event: CodexToolStreamEvent) => void | Promise<void>;
export type CodexToolOptions = {
    /**
     * Name of the tool as exposed to the agent model.
     *
     * @defaultValue `'codex'`
     */
    name?: string;
    /**
     * Description surfaced to the agent model.
     */
    description?: string;
    /**
     * Explicit Zod parameter schema. When omitted, the default schema is used.
     * Custom schemas must be compatible with the default `inputs` shape.
     */
    parameters?: CodexToolParametersSchema;
    /**
     * Optional descriptor or JSON schema used for Codex structured output.
     * This schema is applied to every Codex turn.
     */
    outputSchema?: OutputSchemaDescriptor | Record<string, unknown> | z.ZodTypeAny;
    /**
     * Reuse an existing Codex instance. When omitted a new Codex instance will be created.
     */
    codex?: Codex;
    /**
     * Options passed to the Codex constructor when {@link CodexToolOptions.codex} is undefined.
     */
    codexOptions?: CodexOptions;
    /**
     * Default options applied to every Codex thread.
     */
    defaultThreadOptions?: ThreadOptions;
    /**
     * Resume a specific Codex thread by id.
     */
    threadId?: string;
    /**
     * Sandbox permissions for the Codex task.
     */
    sandboxMode?: SandboxMode;
    /**
     * Absolute path used as the working directory for the Codex thread.
     */
    workingDirectory?: string;
    /**
     * Allow Codex to run outside a Git repository when true.
     */
    skipGitRepoCheck?: boolean;
    /**
     * Default options applied to every Codex turn.
     */
    defaultTurnOptions?: TurnOptions;
    /**
     * Reuse a single Codex thread across tool invocations.
     */
    persistSession?: boolean;
    /**
     * Optional hook to receive streamed Codex events during execution.
     */
    onStream?: CodexToolStreamHandler;
};
type CodexToolResult = {
    threadId: string | null;
    response: string;
    usage: CodexUsage | null;
};
/**
 * Wraps the Codex SDK in a function tool that can be consumed by the Agents SDK.
 *
 * The tool streams Codex events, creating child spans for reasoning items, command executions,
 * and MCP tool invocations. Those spans are nested under the Codex tool span automatically when
 * tracing is enabled.
 */
export declare function codexTool(options?: CodexToolOptions): FunctionTool<unknown, typeof codexParametersSchema, CodexToolResult>;
export type CodexOutputSchemaDescriptor = OutputSchemaDescriptor;
export type CodexOutputSchema = Record<string, unknown>;
export {};
