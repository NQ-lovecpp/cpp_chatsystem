"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeAgent = void 0;
const agents_core_1 = require("@openai/agents-core");
/**
 * A specialized agent instance that is meant to be used within a `RealtimeSession` to build
 * voice agents. Due to the nature of this agent, some configuration options are not supported
 * that are supported by regular `Agent` instances. For example:
 * - `model` choice is not supported as all RealtimeAgents will be handled by the same model within
 *   a `RealtimeSession`
 * - `modelSettings` is not supported as all RealtimeAgents will be handled by the same model within
 *   a `RealtimeSession`
 * - `outputType` is not supported as RealtimeAgents do not support structured outputs
 * - `toolUseBehavior` is not supported as all RealtimeAgents will be handled by the same model within
 *   a `RealtimeSession`
 * - `voice` can be configured on an `Agent` level however it cannot be changed after the first
 *    agent within a `RealtimeSession` spoke
 *
 * @example
 * ```ts
 * const agent = new RealtimeAgent({
 *   name: 'my-agent',
 *   instructions: 'You are a helpful assistant that can answer questions and help with tasks.',
 * })
 *
 * const session = new RealtimeSession(agent);
 * ```
 */
class RealtimeAgent extends agents_core_1.Agent {
    /**
     * The voice intended to be used by the agent. If another agent already spoke during the
     * RealtimeSession, changing the voice during a handoff will fail.
     */
    voice;
    constructor(config) {
        super(config);
        this.voice = config.voice;
    }
}
exports.RealtimeAgent = RealtimeAgent;
//# sourceMappingURL=realtimeAgent.js.map