import type { RunStreamEvent, StreamedRunResult } from '@openai/agents';
export type AiSdkUiMessageStreamSource = StreamedRunResult<any, any> | ReadableStream<RunStreamEvent> | AsyncIterable<RunStreamEvent> | {
    toStream: () => ReadableStream<RunStreamEvent>;
};
export type AiSdkUiMessageStreamHeaders = Headers | Record<string, string> | Array<[string, string]>;
export type AiSdkUiMessageStreamResponseOptions = {
    headers?: AiSdkUiMessageStreamHeaders;
    status?: number;
    statusText?: string;
};
/**
 * Creates a UI message stream Response compatible with the AI SDK data stream protocol.
 */
export declare function createAiSdkUiMessageStreamResponse(source: AiSdkUiMessageStreamSource, options?: AiSdkUiMessageStreamResponseOptions): Response;
