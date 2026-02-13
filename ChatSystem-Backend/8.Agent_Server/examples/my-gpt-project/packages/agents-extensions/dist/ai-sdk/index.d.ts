import type { LanguageModelV2 as LanguageModelV2Base, LanguageModelV2CallOptions, LanguageModelV2FunctionTool, LanguageModelV2ToolChoice } from '@ai-sdk/provider';
import { Model, ModelRequest, ResponseStreamEvent, Usage, ModelSettingsToolChoice } from '@openai/agents';
type LanguageModelV3Compatible = {
    specificationVersion: string;
    provider: string;
    modelId: string;
    supportedUrls: any;
    doGenerate: (options: any) => PromiseLike<any> | any;
    doStream: (options: any) => PromiseLike<{
        stream: AsyncIterable<any>;
    }> | {
        stream: AsyncIterable<any>;
    } | any;
};
type LanguageModelV2ProviderDefinedTool = {
    type: 'provider-defined';
    id: string;
    name: string;
    args?: Record<string, any>;
};
type LanguageModelV2ProviderTool = {
    type: 'provider';
    id: string;
    name: string;
    args?: Record<string, any>;
};
type LanguageModelV2ProviderToolCompat = LanguageModelV2ProviderDefinedTool | LanguageModelV2ProviderTool;
type LanguageModelV2CallOptionsCompat = Omit<LanguageModelV2CallOptions, 'tools'> & {
    tools?: Array<LanguageModelV2FunctionTool | LanguageModelV2ProviderToolCompat>;
};
type LanguageModelV2Compat = Omit<LanguageModelV2Base, 'doGenerate' | 'doStream'> & {
    doGenerate: (options: LanguageModelV2CallOptionsCompat) => PromiseLike<any> | any;
    doStream: (options: LanguageModelV2CallOptionsCompat) => PromiseLike<{
        stream: AsyncIterable<any>;
    }> | {
        stream: AsyncIterable<any>;
    } | any;
};
type LanguageModelCompatible = LanguageModelV2Compat | LanguageModelV3Compatible;
/**
 * Wraps a model from the AI SDK that adheres to the LanguageModelV2 spec to be used used as a model
 * in the OpenAI Agents SDK to use other models.
 *
 * While you can use this with the OpenAI models, it is recommended to use the default OpenAI model
 * provider instead.
 *
 * If tracing is enabled, the model will send generation spans to your traces processor.
 *
 * ```ts
 * import { aisdk } from '@openai/agents-extensions';
 * import { openai } from '@ai-sdk/openai';
 *
 * const model = aisdk(openai('gpt-4o'));
 *
 * const agent = new Agent({
 *   name: 'My Agent',
 *   model
 * });
 * ```
 *
 * @param model - The Vercel AI SDK model to wrap.
 * @returns The wrapped model.
 */
export declare class AiSdkModel implements Model {
    #private;
    constructor(model: LanguageModelCompatible);
    getResponse(request: ModelRequest): Promise<{
        readonly responseId: any;
        readonly usage: Usage;
        readonly output: import("@openai/agents").AgentOutputItem[];
        readonly providerData: any;
    }>;
    getStreamedResponse(request: ModelRequest): AsyncIterable<ResponseStreamEvent>;
}
/**
 * Wraps a model from the AI SDK that adheres to the LanguageModelV2 spec to be used used as a model
 * in the OpenAI Agents SDK to use other models.
 *
 * While you can use this with the OpenAI models, it is recommended to use the default OpenAI model
 * provider instead.
 *
 * If tracing is enabled, the model will send generation spans to your traces processor.
 *
 * ```ts
 * import { aisdk } from '@openai/agents-extensions';
 * import { openai } from '@ai-sdk/openai';
 *
 * const model = aisdk(openai('gpt-4o'));
 *
 * const agent = new Agent({
 *   name: 'My Agent',
 *   model
 * });
 * ```
 *
 * @param model - The Vercel AI SDK model to wrap.
 * @returns The wrapped model.
 */
export declare function aisdk(model: LanguageModelCompatible): AiSdkModel;
export declare function parseArguments(args: string | undefined | null): any;
export declare function toolChoiceToLanguageV2Format(toolChoice: ModelSettingsToolChoice | undefined): LanguageModelV2ToolChoice | undefined;
export {};
