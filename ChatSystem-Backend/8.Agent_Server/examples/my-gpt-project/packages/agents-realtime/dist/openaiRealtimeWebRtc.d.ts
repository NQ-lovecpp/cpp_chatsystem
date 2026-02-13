import { RealtimeTransportLayer, RealtimeTransportLayerConnectOptions } from './transportLayer';
import { RealtimeClientMessage } from './clientMessages';
import { OpenAIRealtimeBase, OpenAIRealtimeBaseOptions } from './openaiRealtimeBase';
/**
 * The connection state of the WebRTC connection.
 */
export type WebRTCState = {
    status: 'disconnected';
    peerConnection: undefined;
    dataChannel: undefined;
    callId: string | undefined;
} | {
    status: 'connecting';
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
    callId: string | undefined;
} | {
    status: 'connected';
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
    callId: string | undefined;
};
/**
 * The options for the OpenAI Realtime WebRTC transport layer.
 */
export type OpenAIRealtimeWebRTCOptions = {
    /**
     * Override of the base URL for the Realtime API
     */
    baseUrl?: string;
    /**
     * The audio element to use for audio playback. If not provided, a new audio element will be
     * created.
     */
    audioElement?: HTMLAudioElement;
    /**
     * The media stream to use for audio input. If not provided, the default microphone will be used.
     */
    mediaStream?: MediaStream;
    /**
     * **Important**: Do not use this option unless you know what you are doing.
     *
     * Whether to use an insecure API key. This has to be set if you are trying to use a regular
     * OpenAI API key instead of a client ephemeral key.
     * @see https://platform.openai.com/docs/guides/realtime#creating-an-ephemeral-token
     */
    useInsecureApiKey?: boolean;
    /**
     * Optional hook invoked with the freshly created peer connection. Returning a
     * different connection will override the one created by the transport layer.
     * This is called right before the offer is created and can be asynchronous.
     */
    changePeerConnection?: (peerConnection: RTCPeerConnection) => RTCPeerConnection | Promise<RTCPeerConnection>;
} & OpenAIRealtimeBaseOptions;
/**
 * Transport layer that's handling the connection between the client and OpenAI's Realtime API
 * via WebRTC. While this transport layer is designed to be used within a RealtimeSession, it can
 * also be used standalone if you want to have a direct connection to the Realtime API.
 *
 * Unless you specify a `mediaStream` or `audioElement` option, the transport layer will
 * automatically configure the microphone and audio output to be used by the session.
 */
export declare class OpenAIRealtimeWebRTC extends OpenAIRealtimeBase implements RealtimeTransportLayer {
    #private;
    private readonly options;
    constructor(options?: OpenAIRealtimeWebRTCOptions);
    /**
     * The current call ID of the WebRTC connection.
     */
    get callId(): string | undefined;
    /**
     * The current status of the WebRTC connection.
     */
    get status(): "connecting" | "connected" | "disconnected";
    /**
     * The current connection state of the WebRTC connection including the peer connection and data
     * channel.
     */
    get connectionState(): WebRTCState;
    /**
     * Whether the session is muted.
     */
    get muted(): boolean;
    /**
     * Connect to the Realtime API. This will establish the connection to the OpenAI Realtime API
     * via WebRTC.
     *
     * If you are using a browser, the transport layer will also automatically configure the
     * microphone and audio output to be used by the session.
     *
     * @param options - The options for the connection.
     */
    connect(options: RealtimeTransportLayerConnectOptions): Promise<void>;
    /**
     * Send an event to the Realtime API. This will stringify the event and send it directly to the
     * API. This can be used if you want to take control over the connection and send events manually.
     *
     * @param event - The event to send.
     */
    sendEvent(event: RealtimeClientMessage): void;
    /**
     * Mute or unmute the session.
     * @param muted - Whether to mute the session.
     */
    mute(muted: boolean): void;
    protected _afterAudioDoneEvent(): void;
    /**
     * Close the connection to the Realtime API and disconnects the underlying WebRTC connection.
     */
    close(): void;
    /**
     * Interrupt the current response if one is ongoing and clear the audio buffer so that the agent
     * stops talking.
     */
    interrupt(): void;
}
