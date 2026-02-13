import type { RealtimeTransportLayerConnectOptions } from './transportLayer';
import { OpenAIRealtimeWebSocket, OpenAIRealtimeWebSocketOptions } from './openaiRealtimeWebsocket';
import type { RealtimeSessionPayload } from './openaiRealtimeBase';
import type { RealtimeSessionConfig } from './clientMessages';
import { type RealtimeSessionOptions, type RealtimeContextData } from './realtimeSession';
import { RealtimeAgent } from './realtimeAgent';
/**
 * Transport layer that connects to an existing SIP-initiated Realtime call via call ID.
 */
export declare class OpenAIRealtimeSIP extends OpenAIRealtimeWebSocket {
    constructor(options?: OpenAIRealtimeWebSocketOptions);
    /**
     * Build the initial session payload for a SIP-attached session, matching the config that a RealtimeSession would send on connect.
     *
     * This enables SIP deployments to accept an incoming call with a payload that already reflects
     * the active agent's instructions, tools, prompt, and tracing metadata without duplicating the
     * session logic outside of the SDK. The returned object structurally matches the REST
     * `CallAcceptParams` interface, so it can be forwarded directly to
     * `openai.realtime.calls.accept(...)`.
     *
     * @param agent - The starting agent used to seed the session instructions, tools, and prompt.
     * @param options - Optional session options that mirror the ones passed to the RealtimeSession constructor.
     * @param overrides - Additional config overrides applied on top of the session options.
     */
    static buildInitialConfig<TBaseContext = unknown>(agent: RealtimeAgent<TBaseContext> | RealtimeAgent<RealtimeContextData<TBaseContext>>, options?: Partial<RealtimeSessionOptions<TBaseContext>>, overrides?: Partial<RealtimeSessionConfig>): Promise<RealtimeSessionPayload>;
    sendAudio(_audio: ArrayBuffer, _options?: {
        commit?: boolean;
    }): never;
    connect(options: RealtimeTransportLayerConnectOptions): Promise<void>;
}
