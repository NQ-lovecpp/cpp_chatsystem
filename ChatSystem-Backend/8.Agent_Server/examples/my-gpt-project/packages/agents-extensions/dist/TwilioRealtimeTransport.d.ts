import { OpenAIRealtimeWebSocket, OpenAIRealtimeWebSocketOptions, RealtimeTransportLayerConnectOptions, TransportLayerAudio, RealtimeSessionConfig } from '@openai/agents/realtime';
import type { WebSocket as NodeWebSocket } from 'ws';
/**
 * The options for the Twilio Realtime Transport Layer.
 */
export type TwilioRealtimeTransportLayerOptions = OpenAIRealtimeWebSocketOptions & {
    /**
     * The websocket that is receiving messages from Twilio's Media Streams API. Typically the
     * connection gets passed into your request handler when running your WebSocket server.
     */
    twilioWebSocket: WebSocket | NodeWebSocket;
};
/**
 * An adapter to connect a websocket that is receiving messages from Twilio's Media Streams API to
 * the OpenAI Realtime API via WebSocket.
 *
 * It automatically handles setting the right audio format for the input and output audio, passing
 * the data along and handling the timing for interruptions using Twilio's `mark` events.
 *
 * It does require you to run your own WebSocket server that is receiving connection requests from
 * Twilio.
 *
 * It will emit all Twilio received messages as `twilio_message` type messages on the `*` handler.
 * If you are using a `RealtimeSession` you can listen to the `transport_event`.
 *
 * @example
 * ```ts
 * const transport = new TwilioRealtimeTransportLayer({
 *   twilioWebSocket: twilioWebSocket,
 * });
 *
 * transport.on('*', (event) => {
 *   if (event.type === 'twilio_message') {
 *     console.log('Twilio message:', event.data);
 *   }
 * });
 * ```
 */
export declare class TwilioRealtimeTransportLayer extends OpenAIRealtimeWebSocket {
    #private;
    constructor(options: TwilioRealtimeTransportLayerOptions);
    _setInputAndOutputAudioFormat(partialConfig?: Partial<RealtimeSessionConfig>): Partial<RealtimeSessionConfig>;
    connect(options: RealtimeTransportLayerConnectOptions): Promise<void>;
    updateSessionConfig(config: Partial<RealtimeSessionConfig>): void;
    _interrupt(_elapsedTime: number, cancelOngoingResponse?: boolean): void;
    protected _onAudio(audioEvent: TransportLayerAudio): void;
}
