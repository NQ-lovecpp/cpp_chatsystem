import { RuntimeEventEmitter } from '@openai/agents-core';
import type { MessageEvent as WebSocketMessageEvent } from 'ws';
import { RealtimeClientMessage, RealtimeSessionConfig, RealtimeSessionConfigDefinition, RealtimeTracingConfig, RealtimeUserInput } from './clientMessages';
import { RealtimeItem, RealtimeMcpCallApprovalRequestItem } from './items';
import { ApiKey, RealtimeTransportLayer, RealtimeTransportLayerConnectOptions } from './transportLayer';
import { RealtimeTransportEventTypes, TransportToolCallEvent } from './transportLayerEvents';
import { EventEmitterDelegate } from '@openai/agents-core/utils';
/**
 * The models that are supported by the OpenAI Realtime API.
 */
export type OpenAIRealtimeModels = 'gpt-4o-realtime-preview' | 'gpt-4o-mini-realtime-preview' | 'gpt-4o-realtime-preview-2025-06-03' | 'gpt-4o-realtime-preview-2024-12-17' | 'gpt-4o-realtime-preview-2024-10-01' | 'gpt-4o-mini-realtime-preview-2024-12-17' | 'gpt-realtime' | 'gpt-realtime-2025-08-28' | 'gpt-realtime-mini' | 'gpt-realtime-mini-2025-10-06' | (string & {});
/**
 * The default model that is used during the connection if no model is provided.
 */
export declare const DEFAULT_OPENAI_REALTIME_MODEL: OpenAIRealtimeModels;
/**
 * The default session config that gets send over during session connection unless overridden
 * by the user.
 */
export declare const DEFAULT_OPENAI_REALTIME_SESSION_CONFIG: Partial<RealtimeSessionConfigDefinition>;
/**
 * The options for the OpenAI Realtime transport layer.
 */
export type OpenAIRealtimeBaseOptions = {
    /**
     * The model to used during the connection.
     */
    model?: OpenAIRealtimeModels;
    /**
     * The API key to use for the connection.
     */
    apiKey?: ApiKey;
};
/**
 * The events that are emitted by the OpenAI Realtime transport layer.
 */
export type OpenAIRealtimeEventTypes = {
    /**
     * Triggered when the connection is established.
     */
    connected: [];
    /**
     * Triggered when the connection is closed.
     */
    disconnected: [];
} & RealtimeTransportEventTypes;
/**
 * Shape of the payload that the Realtime API expects for session.create/update operations.
 * This closely mirrors the REST `CallAcceptParams` type so that callers can feed the payload
 * directly into the `openai.realtime.calls.accept` helper without casts.
 */
export type RealtimeSessionPayload = {
    type: 'realtime';
} & Record<string, any>;
export declare abstract class OpenAIRealtimeBase extends EventEmitterDelegate<OpenAIRealtimeEventTypes> implements RealtimeTransportLayer {
    #private;
    protected eventEmitter: RuntimeEventEmitter<OpenAIRealtimeEventTypes>;
    constructor(options?: OpenAIRealtimeBaseOptions);
    /**
     * The current model that is being used by the transport layer.
     */
    get currentModel(): OpenAIRealtimeModels;
    /**
     * The current model that is being used by the transport layer.
     * **Note**: The model cannot be changed mid conversation.
     */
    set currentModel(model: OpenAIRealtimeModels);
    abstract get status(): 'connected' | 'disconnected' | 'connecting' | 'disconnecting';
    abstract connect(options: RealtimeTransportLayerConnectOptions): Promise<void>;
    abstract sendEvent(event: RealtimeClientMessage): void;
    abstract mute(muted: boolean): void;
    abstract close(): void;
    abstract interrupt(): void;
    abstract readonly muted: boolean | null;
    /**
     * Hook for subclasses to clean up transport-specific state when audio
     * playback finishes. Defaults to a no-op.
     */
    protected _afterAudioDoneEvent(): void;
    protected get _rawSessionConfig(): Record<string, any> | null;
    protected _getApiKey(options: RealtimeTransportLayerConnectOptions): Promise<string>;
    protected _onMessage(event: MessageEvent | WebSocketMessageEvent): void;
    protected _onError(error: any): void;
    protected _onOpen(): void;
    protected _onClose(): void;
    /**
     * Send a message to the Realtime API. This will create a new item in the conversation and
     * trigger a response.
     *
     * @param message - The message to send.
     * @param otherEventData - Additional event data to send.
     */
    sendMessage(message: RealtimeUserInput, otherEventData: Record<string, any>, { triggerResponse }?: {
        triggerResponse?: boolean;
    }): void;
    addImage(image: string, { triggerResponse }?: {
        triggerResponse?: boolean;
    }): void;
    protected _getMergedSessionConfig(config: Partial<RealtimeSessionConfig>): RealtimeSessionPayload;
    /**
     * Build the payload object expected by the Realtime API when creating or updating a session.
     *
     * The helper centralises the conversion from camelCase runtime config to the snake_case payload
     * required by the Realtime API so transports that need a one-off payload (for example SIP call
     * acceptance) can reuse the same logic without duplicating private state.
     *
     * @param config - The session config to merge with defaults.
     */
    buildSessionPayload(config: Partial<RealtimeSessionConfig>): RealtimeSessionPayload;
    private static buildTurnDetectionConfig;
    /**
     * Sets the internal tracing config. This is used to track the tracing config that has been set
     * during the session.create event.
     */
    set _tracingConfig(tracingConfig: RealtimeTracingConfig | null);
    /**
     * Sets the tracing config for the session. This will send the tracing config to the Realtime API.
     *
     * @param tracingConfig - The tracing config to set. We don't support 'auto' here as the SDK will always configure a Workflow Name unless it exists
     */
    protected _updateTracingConfig(tracingConfig: RealtimeTracingConfig | null): void;
    /**
     * Updates the session config. This will merge it with the current session config with the default
     * values and send it to the Realtime API.
     *
     * @param config - The session config to update.
     */
    updateSessionConfig(config: Partial<RealtimeSessionConfig>): void;
    /**
     * Send the output of a function call to the Realtime API.
     *
     * @param toolCall - The tool call to send the output for.
     * @param output - The output of the function call.
     * @param startResponse - Whether to start a new response after sending the output.
     */
    sendFunctionCallOutput(toolCall: TransportToolCallEvent, output: string, startResponse?: boolean): void;
    /**
     * Send an audio buffer to the Realtime API. If `{ commit: true }` is passed, the audio buffer
     * will be committed and the model will start processing it. This is necessary if you have
     * disabled turn detection / voice activity detection (VAD).
     *
     * @param audio - The audio buffer to send.
     * @param options - The options for the audio buffer.
     */
    sendAudio(audio: ArrayBuffer, { commit }?: {
        commit?: boolean;
    }): void;
    /**
     * Reset the history of the conversation. This will create a diff between the old and new history
     * and send the necessary events to the Realtime API to update the history.
     *
     * @param oldHistory - The old history of the conversation.
     * @param newHistory - The new history of the conversation.
     */
    resetHistory(oldHistory: RealtimeItem[], newHistory: RealtimeItem[]): void;
    sendMcpResponse(approvalRequest: RealtimeMcpCallApprovalRequestItem, approved: boolean): void;
}
