import { RunContext, Usage, RunToolApprovalItem } from '@openai/agents-core';
import { RuntimeEventEmitter } from '@openai/agents-core/_shims';
import type { RealtimeSessionConfig, RealtimeUserInput, RealtimeMcpToolInfo } from './clientMessages';
import { RealtimeOutputGuardrail, RealtimeOutputGuardrailSettings } from './guardrail';
import { RealtimeItem } from './items';
import { OpenAIRealtimeModels } from './openaiRealtimeBase';
import { RealtimeAgent } from './realtimeAgent';
import { RealtimeSessionEventTypes } from './realtimeSessionEvents';
import type { ApiKey, RealtimeTransportLayer } from './transportLayer';
/**
 * The context data for a realtime session. This is the context data that is passed to the agent.
 * The RealtimeSession will automatically add the current snapshot of the history to the context.
 */
export type RealtimeContextData<TContext = unknown> = TContext & {
    history: RealtimeItem[];
};
export type RealtimeSessionOptions<TContext = unknown> = {
    /**
     * The API key to use for the connection. Pass a function to lazily load the API key
     */
    apiKey: ApiKey;
    /**
     * The transport layer to use.
     */
    transport: 'webrtc' | 'websocket' | RealtimeTransportLayer;
    /**
     * The model to use.
     */
    model?: OpenAIRealtimeModels | (string & {});
    /**
     * Additional context to pass to the agent
     */
    context?: TContext;
    /**
     * Any output guardrails to apply to agent output in parallel
     */
    outputGuardrails?: RealtimeOutputGuardrail[];
    /**
     * Configure the behavior of your guardrails
     */
    outputGuardrailSettings?: RealtimeOutputGuardrailSettings;
    /**
     * Additional session config options. Overrides default client options.
     */
    config?: Partial<RealtimeSessionConfig>;
    /**
     * Whether the history copy should include a local copy of the audio data. By default it is not
     * included in the history to save runtime memory on the client. If you wish to keep this data
     * you can enable this option.
     */
    historyStoreAudio?: boolean;
    /**
     * Whether tracing is disabled for this session. If disabled, we will not trace the agent run.
     */
    tracingDisabled?: boolean;
    /**
     * A group identifier to use for tracing, to link multiple traces together. For example, if you
     * want to connect your RealtimeSession traces with those of a backend text-based agent run.
     */
    groupId?: string;
    /**
     * An optional dictionary of additional metadata to include with the trace.
     */
    traceMetadata?: Record<string, any>;
    /**
     * The workflow name to use for tracing.
     */
    workflowName?: string;
    /**
     * Whether to automatically trigger a response for MCP tool calls.
     */
    automaticallyTriggerResponseForMcpToolCalls?: boolean;
};
export type RealtimeSessionConnectOptions = {
    /**
     * The API key to use for the connection. Pass a function to lazily load the API key. Overrides
     * default client options.
     */
    apiKey: string | (() => string | Promise<string>);
    /**
     * The model to use for the connection.
     */
    model?: OpenAIRealtimeModels | (string & {});
    /**
     * The URL to use for the connection.
     */
    url?: string;
    /**
     * The call ID to attach to when connecting to a SIP-initiated session.
     */
    callId?: string;
};
/**
 * A `RealtimeSession` is the cornerstone of building Voice Agents. It's the equivalent of a
 * Runner in text-based agents except that it automatically handles multiple turns by maintaining a
 * connection with the underlying transport layer.
 *
 * The session handles managing the local history copy, executes tools, runs output guardrails, and
 * facilitates handoffs.
 *
 * The actual audio handling and generation of model responses is handled by the underlying
 * transport layer. By default if you are using a browser with WebRTC support, the session will
 * automatically use the WebRTC version of the OpenAI Realtime API. On the server or if you pass
 * `websocket` as the transport layer, the session will establish a connection using WebSockets.
 *
 * In the case of WebRTC, in the browser, the transport layer will also automatically configure the
 * microphone and audio output to be used by the session.
 *
 * You can also create a transport layer instance yourself and pass it in to have more control over
 * the configuration or even extend the existing ones. Check out the `TwilioRealtimeTransportLayer`
 * for an example of how to create a custom transport layer.
 *
 * @example
 * ```ts
 * const agent = new RealtimeAgent({
 *   name: 'my-agent',
 *   instructions: 'You are a helpful assistant that can answer questions and help with tasks.',
 * })
 *
 * const session = new RealtimeSession(agent);
 * session.connect({
 *   apiKey: 'your-api-key',
 * });
 * ```
 */
export declare class RealtimeSession<TBaseContext = unknown> extends RuntimeEventEmitter<RealtimeSessionEventTypes<TBaseContext>> {
    #private;
    readonly initialAgent: RealtimeAgent<TBaseContext> | RealtimeAgent<RealtimeContextData<TBaseContext>>;
    readonly options: Partial<RealtimeSessionOptions<TBaseContext>>;
    constructor(initialAgent: RealtimeAgent<TBaseContext> | RealtimeAgent<RealtimeContextData<TBaseContext>>, options?: Partial<RealtimeSessionOptions<TBaseContext>>);
    /**
     * The transport layer used by the session.
     */
    get transport(): RealtimeTransportLayer;
    /**
     * The current agent in the session.
     */
    get currentAgent(): RealtimeAgent<TBaseContext> | RealtimeAgent<RealtimeContextData<TBaseContext>>;
    /**
     * The current usage of the session.
     */
    get usage(): Usage;
    /**
     * The current context of the session.
     */
    get context(): RunContext<RealtimeContextData<TBaseContext>>;
    /**
     * Whether the session is muted. Might be `null` if the underlying transport layer does not
     * support muting.
     */
    get muted(): boolean | null;
    /**
     * The history of the session.
     */
    get history(): RealtimeItem[];
    get availableMcpTools(): RealtimeMcpToolInfo[];
    /**
     * Compute the initial session config that the current session will use when connecting.
     *
     * This mirrors the configuration payload we send during `connect`, including dynamic values
     * such as the upstream agent instructions, tool definitions, and prompt content generated at
     * runtime. Keeping this helper exposed allows transports or orchestration layers to precompute
     * a CallAccept-compatible payload without opening a socket.
     *
     * @param overrides - Additional config overrides applied on top of the session options.
     */
    getInitialSessionConfig(overrides?: Partial<RealtimeSessionConfig>): Promise<Partial<RealtimeSessionConfig>>;
    /**
     * Convenience helper to compute the initial session config without manually instantiating and connecting a session.
     *
     * This is primarily useful for integrations that must provide the session configuration to a
     * third party (for example the SIP `calls.accept` endpoint) before the actual realtime session
     * is attached. The helper instantiates a throwaway session so all agent-driven dynamic fields
     * resolve in exactly the same way as the live session path.
     *
     * @param agent - The starting agent for the session.
     * @param options - Session options used to seed the config calculation.
     * @param overrides - Additional config overrides applied on top of the provided options.
     */
    static computeInitialSessionConfig<TBaseContext = unknown>(agent: RealtimeAgent<TBaseContext> | RealtimeAgent<RealtimeContextData<TBaseContext>>, options?: Partial<RealtimeSessionOptions<TBaseContext>>, overrides?: Partial<RealtimeSessionConfig>): Promise<Partial<RealtimeSessionConfig>>;
    updateAgent(newAgent: RealtimeAgent<TBaseContext>): Promise<RealtimeAgent<TBaseContext>>;
    /**
     * Connect to the session. This will establish the connection to the underlying transport layer
     * and start the session.
     *
     * After connecting, the session will also emit a `history_updated` event with an empty history.
     *
     * @param options - The options for the connection.
     */
    connect(options: RealtimeSessionConnectOptions): Promise<void>;
    /**
     * Update the history of the session.
     * @param newHistory - The new history to set.
     */
    updateHistory(newHistory: RealtimeItem[] | ((history: RealtimeItem[]) => RealtimeItem[])): void;
    /**
     * Send a message to the session.
     * @param message - The message to send.
     * @param otherEventData - Additional event data to send.
     */
    sendMessage(message: RealtimeUserInput, otherEventData?: Record<string, any>): void;
    /**
     * Add image to the session
     * @param image - The image to add.
     */
    addImage(image: string, { triggerResponse }?: {
        triggerResponse?: boolean;
    }): void;
    /**
     * Mute the session.
     * @param muted - Whether to mute the session.
     */
    mute(muted: boolean): void;
    /**
     * Disconnect from the session.
     */
    close(): void;
    /**
     * Send audio to the session.
     * @param audio - The audio to send.
     * @param options - Additional options.
     * @param options.commit - Whether to finish the turn with this audio.
     */
    sendAudio(audio: ArrayBuffer, options?: {
        commit?: boolean;
    }): void;
    /**
     * Interrupt the session artificially for example if you want to build a "stop talking"
     * button.
     */
    interrupt(): void;
    /**
     * Approve a tool call. This will also trigger the tool call to the agent.
     * @param approvalItem - The approval item to approve.
     * @param options - Additional options.
     * @param options.alwaysApprove - Whether to always approve the tool call.
     */
    approve(approvalItem: RunToolApprovalItem, options?: {
        alwaysApprove?: boolean;
    }): Promise<void>;
    /**
     * Reject a tool call. This will also trigger the tool call to the agent.
     * @param approvalItem - The approval item to reject.
     * @param options - Additional options.
     * @param options.alwaysReject - Whether to always reject the tool call.
     */
    reject(approvalItem: RunToolApprovalItem, options?: {
        alwaysReject?: boolean;
    }): Promise<void>;
}
