import { WebSocket } from '@openai/agents-realtime/_shims';
import { RealtimeTransportLayerConnectOptions, RealtimeTransportLayer } from './transportLayer';
import { RealtimeClientMessage } from './clientMessages';
import { OpenAIRealtimeBase, OpenAIRealtimeBaseOptions } from './openaiRealtimeBase';
import { TransportLayerAudio } from './transportLayerEvents';
/**
 * The connection state of the WebSocket connection.
 */
export type WebSocketState = {
    status: 'disconnected';
    websocket: undefined;
} | {
    status: 'connecting';
    websocket: WebSocket;
} | {
    status: 'connected';
    websocket: WebSocket;
};
export interface CreateWebSocketOptions {
    url: string;
    apiKey: string;
}
/**
 * The options for the OpenAI Realtime WebSocket transport layer.
 */
export type OpenAIRealtimeWebSocketOptions = {
    /**
     * **Important**: Do not use this option unless you know what you are doing.
     *
     * Whether to use an insecure API key. This has to be set if you are trying to use a regular
     * OpenAI API key instead of a client ephemeral key.
     * @see https://platform.openai.com/docs/guides/realtime#creating-an-ephemeral-token
     */
    useInsecureApiKey?: boolean;
    /**
     * The URL to use for the WebSocket connection.
     */
    url?: string;
    /**
     * Builds a new WebSocket connection.
     * @param options - The options for the WebSocket connection.
     * @returns The WebSocket connection.
     */
    createWebSocket?: (options: CreateWebSocketOptions) => Promise<WebSocket>;
    /**
     * When you pass your own createWebSocket function, which completes the connection state transition,
     * you can set this to true to skip registering the `open` event listener for the same purpose.
     * If this flag is set to true, the constructor will immediately call the internal operation
     * to mark the internal connection state to `connected`. Otherwise, the constructor will register
     * the `open` event listener and wait for it to be triggered.
     *
     * By default (meaning if this property is absent), this is set to false.
     */
    skipOpenEventListeners?: boolean;
} & OpenAIRealtimeBaseOptions;
/**
 * Transport layer that's handling the connection between the client and OpenAI's Realtime API
 * via WebSockets. While this transport layer is designed to be used within a RealtimeSession, it
 * can also be used standalone if you want to have a direct connection to the Realtime API.
 */
export declare class OpenAIRealtimeWebSocket extends OpenAIRealtimeBase implements RealtimeTransportLayer {
    #private;
    /**
     * Timestamp maintained by the transport layer to aid with the calculation of the elapsed time
     * since the response started to compute the right interruption time.
     *
     * Mostly internal but might be used by extended transport layers for their interruption
     * calculation.
     */
    protected _firstAudioTimestamp: number | undefined;
    protected _audioLengthMs: number;
    constructor(options?: OpenAIRealtimeWebSocketOptions);
    protected getCommonRequestHeaders(): {
        'User-Agent': string;
        'X-OpenAI-Agents-SDK': string;
    };
    /**
     * The current status of the WebSocket connection.
     */
    get status(): "connecting" | "connected" | "disconnected";
    /**
     * The current connection state of the WebSocket connection.
     */
    get connectionState(): WebSocketState;
    /**
     * Always returns `null` as the WebSocket transport layer does not handle muting. Instead,
     * this should be handled by the client by not triggering the `sendAudio` method.
     */
    get muted(): null;
    /**
     * The current item ID of the ongoing response.
     */
    protected get currentItemId(): string | undefined;
    /**
     * Triggers the `audio` event that a client might listen to to receive the audio buffer.
     * Protected for you to be able to override and disable emitting this event in case your extended
     * transport layer handles audio internally.
     *
     * @param audioEvent - The audio event to emit.
     */
    protected _onAudio(audioEvent: TransportLayerAudio): void;
    protected _afterAudioDoneEvent(): void;
    connect(options: RealtimeTransportLayerConnectOptions): Promise<void>;
    /**
     * Send an event to the Realtime API. This will stringify the event and send it directly to the
     * API. This can be used if you want to take control over the connection and send events manually.
     *
     * @param event - The event to send.
     */
    sendEvent(event: RealtimeClientMessage): void;
    /**
     * Close the WebSocket connection.
     *
     * This will also reset any internal connection tracking used for interruption handling.
     */
    close(): void;
    /**
     * Will throw an error as the WebSocket transport layer does not support muting.
     */
    mute(_muted: boolean): never;
    /**
     * Send an audio buffer to the Realtime API. This is used for your client to send audio to the
     * model to respond.
     *
     * @param audio - The audio buffer to send.
     * @param options - The options for the audio buffer.
     */
    sendAudio(audio: ArrayBuffer, options?: {
        commit?: boolean;
    }): void;
    /**
     * Send a cancel response event to the Realtime API. This is used to cancel an ongoing
     *  response that the model is currently generating.
     */
    _cancelResponse(): void;
    /**
     * Do NOT call this method directly. Call `interrupt()` instead for proper interruption handling.
     *
     * This method is used to send the right events to the API to inform the model that the user has
     * interrupted the response. It might be overridden/extended by an extended transport layer. See
     * the `TwilioRealtimeTransportLayer` for an example.
     *
     * @param elapsedTime - The elapsed time since the response started.
     */
    _interrupt(elapsedTime: number, cancelOngoingResponse?: boolean): void;
    /**
     * Interrupt the ongoing response. This method is triggered automatically by the client when
     * voice activity detection (VAD) is enabled (default) as well as when an output guardrail got
     * triggered.
     *
     * You can also call this method directly if you want to interrupt the conversation for example
     * based on an event in the client.
     */
    interrupt(cancelOngoingResponse?: boolean): void;
}
