"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRealtimeSIP = void 0;
const agents_core_1 = require("@openai/agents-core");
const openaiRealtimeWebsocket_1 = require("./openaiRealtimeWebsocket.js");
const realtimeSession_1 = require("./realtimeSession.js");
/**
 * Transport layer that connects to an existing SIP-initiated Realtime call via call ID.
 */
class OpenAIRealtimeSIP extends openaiRealtimeWebsocket_1.OpenAIRealtimeWebSocket {
    constructor(options = {}) {
        super(options);
    }
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
    static async buildInitialConfig(agent, options = {}, overrides = {}) {
        const sessionConfig = await realtimeSession_1.RealtimeSession.computeInitialSessionConfig(agent, options, overrides);
        const transport = new OpenAIRealtimeSIP();
        return transport.buildSessionPayload(sessionConfig);
    }
    sendAudio(_audio, _options = {}) {
        // SIP integrations stream audio to OpenAI directly through the telephony provider, so the
        // transport deliberately prevents userland code from sending duplicate buffers.
        throw new Error('OpenAIRealtimeSIP does not support sending audio buffers; audio is handled by the SIP call.');
    }
    async connect(options) {
        if (!options.callId) {
            throw new agents_core_1.UserError('OpenAIRealtimeSIP requires `callId` in the connect options.');
        }
        await super.connect(options);
    }
}
exports.OpenAIRealtimeSIP = OpenAIRealtimeSIP;
//# sourceMappingURL=openaiRealtimeSip.js.map