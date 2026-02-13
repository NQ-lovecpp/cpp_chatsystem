import { isBrowserEnvironment, useWebSocketProtocols, WebSocket, } from '@openai/agents-realtime/_shims';
import { OpenAIRealtimeBase, } from "./openaiRealtimeBase.mjs";
import { base64ToArrayBuffer, HEADERS, WEBSOCKET_META } from "./utils.mjs";
import { UserError } from '@openai/agents-core';
import { parseRealtimeEvent } from "./openaiRealtimeEvents.mjs";
/**
 * Transport layer that's handling the connection between the client and OpenAI's Realtime API
 * via WebSockets. While this transport layer is designed to be used within a RealtimeSession, it
 * can also be used standalone if you want to have a direct connection to the Realtime API.
 */
export class OpenAIRealtimeWebSocket extends OpenAIRealtimeBase {
    #apiKey;
    #url;
    #defaultUrl;
    #state = {
        status: 'disconnected',
        websocket: undefined,
    };
    #useInsecureApiKey;
    #currentItemId;
    #currentAudioContentIndex;
    /**
     * Timestamp maintained by the transport layer to aid with the calculation of the elapsed time
     * since the response started to compute the right interruption time.
     *
     * Mostly internal but might be used by extended transport layers for their interruption
     * calculation.
     */
    _firstAudioTimestamp;
    _audioLengthMs = 0;
    #ongoingResponse = false;
    #createWebSocket;
    #skipOpenEventListeners;
    #resetAudioPlaybackState() {
        this.#currentItemId = undefined;
        this._firstAudioTimestamp = undefined;
        this._audioLengthMs = 0;
        this.#currentAudioContentIndex = undefined;
    }
    constructor(options = {}) {
        super(options);
        this.#url = options.url;
        this.#defaultUrl = options.url;
        this.#useInsecureApiKey = options.useInsecureApiKey ?? false;
        this.#createWebSocket = options.createWebSocket;
        this.#skipOpenEventListeners = options.skipOpenEventListeners ?? false;
    }
    getCommonRequestHeaders() {
        return HEADERS;
    }
    /**
     * The current status of the WebSocket connection.
     */
    get status() {
        return this.#state.status;
    }
    /**
     * The current connection state of the WebSocket connection.
     */
    get connectionState() {
        return this.#state;
    }
    /**
     * Always returns `null` as the WebSocket transport layer does not handle muting. Instead,
     * this should be handled by the client by not triggering the `sendAudio` method.
     */
    get muted() {
        return null;
    }
    /**
     * The current item ID of the ongoing response.
     */
    get currentItemId() {
        return this.#currentItemId;
    }
    /**
     * Triggers the `audio` event that a client might listen to to receive the audio buffer.
     * Protected for you to be able to override and disable emitting this event in case your extended
     * transport layer handles audio internally.
     *
     * @param audioEvent - The audio event to emit.
     */
    _onAudio(audioEvent) {
        this.emit('audio', audioEvent);
    }
    _afterAudioDoneEvent() {
        this.#resetAudioPlaybackState();
    }
    async #setupWebSocket(resolve, reject, sessionConfig) {
        if (this.#state.websocket) {
            resolve();
            return;
        }
        if (!this.#apiKey) {
            throw new UserError('API key is not set. Please call `connect()` with an API key first.');
        }
        if (isBrowserEnvironment() &&
            !this.#apiKey.startsWith('ek_') &&
            !this.#useInsecureApiKey) {
            throw new UserError('Using the WebSocket connection in a browser environment requires an ephemeral client key. If you have to use a regular API key, set the `useInsecureApiKey` option to true.');
        }
        let ws = null;
        if (this.#createWebSocket) {
            ws = await this.#createWebSocket({
                url: this.#url,
                apiKey: this.#apiKey,
            });
        }
        else {
            // browsers and workerd should use the protocols argument, node should use the headers argument
            const websocketArguments = useWebSocketProtocols
                ? [
                    'realtime',
                    // Auth
                    'openai-insecure-api-key.' + this.#apiKey,
                    // Version header
                    WEBSOCKET_META,
                ]
                : {
                    headers: {
                        Authorization: `Bearer ${this.#apiKey}`,
                        ...this.getCommonRequestHeaders(),
                    },
                };
            ws = new WebSocket(this.#url, websocketArguments);
        }
        this.#state = {
            status: 'connecting',
            websocket: ws,
        };
        this.emit('connection_change', this.#state.status);
        const onSocketOpenReady = () => {
            this.#state = {
                status: 'connected',
                websocket: ws,
            };
            this.emit('connection_change', this.#state.status);
            this._onOpen();
            resolve();
        };
        if (this.#skipOpenEventListeners === true) {
            onSocketOpenReady();
        }
        else {
            ws.addEventListener('open', onSocketOpenReady);
        }
        ws.addEventListener('error', (error) => {
            this._onError(error);
            this.#state = {
                status: 'disconnected',
                websocket: undefined,
            };
            this.emit('connection_change', this.#state.status);
            reject(error);
        });
        ws.addEventListener('message', (message) => {
            this._onMessage(message);
            const { data: parsed, isGeneric } = parseRealtimeEvent(message);
            if (!parsed || isGeneric) {
                return;
            }
            if (parsed.type === 'response.output_audio.delta') {
                this.#currentAudioContentIndex = parsed.content_index;
                this.#currentItemId = parsed.item_id;
                if (this._firstAudioTimestamp === undefined) {
                    // If the response start timestamp is not set, we set it to the current time.
                    // This is used to calculate the elapsed time for interruption.
                    this._firstAudioTimestamp = Date.now();
                    this._audioLengthMs = 0;
                }
                const buff = base64ToArrayBuffer(parsed.delta);
                // calculate the audio length in milliseconds
                // GA format: session.audio.output.format supports structured { type: "audio/pcm", rate } or "audio/pcmu" etc.
                const fmt = this._rawSessionConfig?.audio?.output?.format;
                if (fmt && typeof fmt === 'object') {
                    // Structured format
                    const t = fmt.type;
                    if (t === 'audio/pcmu' || t === 'audio/pcma') {
                        // 8kHz, 1 byte per sample
                        this._audioLengthMs += buff.byteLength / 8;
                    }
                    else if (t === 'audio/pcm') {
                        const rate = fmt.rate ?? 24000;
                        // bytes -> samples (2 bytes per sample) -> ms
                        this._audioLengthMs += (buff.byteLength / 2 / rate) * 1000;
                    }
                    else {
                        // Fallback assumption similar to legacy
                        this._audioLengthMs += buff.byteLength / 24 / 2;
                    }
                }
                else if (typeof fmt === 'string') {
                    if (fmt.startsWith('g711_')) {
                        this._audioLengthMs += buff.byteLength / 8;
                    }
                    else {
                        // Assume 24kHz PCM16
                        this._audioLengthMs += buff.byteLength / 24 / 2;
                    }
                }
                else {
                    // Default to 24kHz PCM16 behavior if unspecified
                    this._audioLengthMs += buff.byteLength / 24 / 2;
                }
                const audioEvent = {
                    type: 'audio',
                    data: buff,
                    responseId: parsed.response_id,
                };
                this._onAudio(audioEvent);
            }
            else if (parsed.type === 'input_audio_buffer.speech_started') {
                const automaticResponseCancellationEnabled = this._rawSessionConfig?.audio?.input?.turn_detection
                    ?.interrupt_response ?? false;
                this.interrupt(!automaticResponseCancellationEnabled);
            }
            else if (parsed.type === 'response.created') {
                this.#ongoingResponse = true;
            }
            else if (parsed.type === 'response.done') {
                this.#ongoingResponse = false;
            }
            else if (parsed.type === 'session.created') {
                this._tracingConfig = parsed.session.tracing;
                // Trying to turn on tracing after the session is created
                const tracingConfig = typeof sessionConfig.tracing === 'undefined'
                    ? 'auto'
                    : sessionConfig.tracing;
                this._updateTracingConfig(tracingConfig);
            }
        });
        ws.addEventListener('close', () => {
            this.#state = {
                status: 'disconnected',
                websocket: undefined,
            };
            this.emit('connection_change', this.#state.status);
            this._onClose();
        });
    }
    async connect(options) {
        const model = options.model ?? this.currentModel;
        this.currentModel = model;
        this.#apiKey = await this._getApiKey(options);
        const callId = options.callId;
        let url;
        if (options.url) {
            url = options.url;
            this.#defaultUrl = options.url;
        }
        else if (callId) {
            url = `wss://api.openai.com/v1/realtime?call_id=${callId}`;
        }
        else if (this.#defaultUrl) {
            url = this.#defaultUrl;
        }
        else {
            url = `wss://api.openai.com/v1/realtime?model=${this.currentModel}`;
        }
        this.#url = url;
        const sessionConfig = {
            ...(options.initialSessionConfig || {}),
            model: this.currentModel,
        };
        await new Promise((resolve, reject) => {
            this.#setupWebSocket(resolve, reject, sessionConfig).catch(reject);
        });
        await this.updateSessionConfig(sessionConfig);
    }
    /**
     * Send an event to the Realtime API. This will stringify the event and send it directly to the
     * API. This can be used if you want to take control over the connection and send events manually.
     *
     * @param event - The event to send.
     */
    sendEvent(event) {
        if (!this.#state.websocket) {
            throw new Error('WebSocket is not connected. Make sure you call `connect()` before sending events.');
        }
        this.#state.websocket.send(JSON.stringify(event));
    }
    /**
     * Close the WebSocket connection.
     *
     * This will also reset any internal connection tracking used for interruption handling.
     */
    close() {
        this.#state.websocket?.close();
        this.#currentItemId = undefined;
        this._firstAudioTimestamp = undefined;
        this._audioLengthMs = 0;
        this.#currentAudioContentIndex = undefined;
    }
    /**
     * Will throw an error as the WebSocket transport layer does not support muting.
     */
    mute(_muted) {
        throw new Error('Mute is not supported for the WebSocket transport. You have to mute the audio input yourself.');
    }
    /**
     * Send an audio buffer to the Realtime API. This is used for your client to send audio to the
     * model to respond.
     *
     * @param audio - The audio buffer to send.
     * @param options - The options for the audio buffer.
     */
    sendAudio(audio, options = {}) {
        if (this.#state.status === 'connected') {
            super.sendAudio(audio, options);
        }
    }
    /**
     * Send a cancel response event to the Realtime API. This is used to cancel an ongoing
     *  response that the model is currently generating.
     */
    _cancelResponse() {
        // cancel the ongoing response
        if (this.#ongoingResponse) {
            this.sendEvent({
                type: 'response.cancel',
            });
            this.#ongoingResponse = false;
        }
    }
    /**
     * Do NOT call this method directly. Call `interrupt()` instead for proper interruption handling.
     *
     * This method is used to send the right events to the API to inform the model that the user has
     * interrupted the response. It might be overridden/extended by an extended transport layer. See
     * the `TwilioRealtimeTransportLayer` for an example.
     *
     * @param elapsedTime - The elapsed time since the response started.
     */
    _interrupt(elapsedTime, cancelOngoingResponse = true) {
        if (elapsedTime < 0) {
            return;
        }
        // immediately emit this event so the client can stop playing audio
        if (cancelOngoingResponse) {
            this._cancelResponse();
        }
        const length = this._audioLengthMs ?? Number.POSITIVE_INFINITY;
        // audio_end_ms must be an integer
        const audio_end_ms = Math.max(0, Math.floor(Math.min(elapsedTime, length)));
        this.emit('audio_interrupted');
        this.sendEvent({
            type: 'conversation.item.truncate',
            item_id: this.#currentItemId,
            content_index: this.#currentAudioContentIndex,
            audio_end_ms,
        });
    }
    /**
     * Interrupt the ongoing response. This method is triggered automatically by the client when
     * voice activity detection (VAD) is enabled (default) as well as when an output guardrail got
     * triggered.
     *
     * You can also call this method directly if you want to interrupt the conversation for example
     * based on an event in the client.
     */
    interrupt(cancelOngoingResponse = true) {
        if (!this.#currentItemId || typeof this._firstAudioTimestamp !== 'number') {
            return;
        }
        const elapsedTime = Date.now() - this._firstAudioTimestamp;
        if (elapsedTime >= 0) {
            this._interrupt(elapsedTime, cancelOngoingResponse);
        }
        this.#resetAudioPlaybackState();
    }
}
//# sourceMappingURL=openaiRealtimeWebsocket.mjs.map