import type { StreamedRunResult } from '@openai/agents';
export type AiSdkTextStreamSource = ReadableStream<string> | StreamedRunResult<any, any> | {
    toTextStream: () => ReadableStream<string>;
};
export type AiSdkTextStreamHeaders = Headers | Record<string, string> | Array<[string, string]>;
export type AiSdkTextStreamResponseOptions = {
    headers?: AiSdkTextStreamHeaders;
    status?: number;
    statusText?: string;
};
/**
 * Creates a text-only streaming Response compatible with AI SDK UI text streams.
 */
export declare function createAiSdkTextStreamResponse(source: AiSdkTextStreamSource, options?: AiSdkTextStreamResponseOptions): Response;
