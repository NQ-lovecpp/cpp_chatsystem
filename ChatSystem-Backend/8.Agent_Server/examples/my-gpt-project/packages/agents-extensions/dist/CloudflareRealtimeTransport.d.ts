import { RealtimeTransportLayer, OpenAIRealtimeWebSocket, OpenAIRealtimeWebSocketOptions } from '@openai/agents/realtime';
/**
 * An adapter transport for Cloudflare Workers (workerd) environments.
 *
 * Cloudflare Workers cannot open outbound client WebSockets using the global `WebSocket`
 * constructor. Instead, a `fetch()` request with `Upgrade: websocket` must be performed and the
 * returned `response.webSocket` must be `accept()`ed. This transport encapsulates that pattern and
 * plugs into the Realtime SDK via the factory-based `createWebSocket` option.
 *
 * It behaves like `OpenAIRealtimeWebSocket`, but establishes the connection using `fetch()` and
 * sets `skipOpenEventListeners: true` since workerd sockets do not emit a traditional `open`
 * event after acceptance.
 *
 * Reference: Response API — `response.webSocket` (Cloudflare Workers).
 * https://developers.cloudflare.com/workers/runtime-apis/response/.
 */
export declare class CloudflareRealtimeTransportLayer extends OpenAIRealtimeWebSocket implements RealtimeTransportLayer {
    #private;
    protected _audioLengthMs: number;
    constructor(options: OpenAIRealtimeWebSocketOptions);
}
