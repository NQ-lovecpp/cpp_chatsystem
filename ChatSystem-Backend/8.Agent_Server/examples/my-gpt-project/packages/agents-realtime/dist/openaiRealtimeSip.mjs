import { UserError } from '@openai/agents-core';
import { OpenAIRealtimeWebSocket, } from "./openaiRealtimeWebsocket.mjs";
import { RealtimeSession, } from "./realtimeSession.mjs";
/**
 * Transport layer that connects to an existing SIP-initiated Realtime call via call ID.
 */
export class OpenAIRealtimeSIP extends OpenAIRealtimeWebSocket {
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
        const sessionConfig = await RealtimeSession.computeInitialSessionConfig(agent, options, overrides);
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
            throw new UserError('OpenAIRealtimeSIP requires `callId` in the connect options.');
        }
        await super.connect(options);
    }
}
//# sourceMappingURL=openaiRealtimeSip.mjs.map