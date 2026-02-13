"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealtimeGuardrailSettings = getRealtimeGuardrailSettings;
exports.defineRealtimeOutputGuardrail = defineRealtimeOutputGuardrail;
exports.getRealtimeGuardrailFeedbackMessage = getRealtimeGuardrailFeedbackMessage;
const agents_core_1 = require("@openai/agents-core");
function getRealtimeGuardrailSettings(settings) {
    return {
        debounceTextLength: settings.debounceTextLength ?? 100,
    };
}
function defineRealtimeOutputGuardrail({ policyHint: policyHintInput, ...options }) {
    const baseGuardrail = (0, agents_core_1.defineOutputGuardrail)(options);
    const policyHint = policyHintInput ?? baseGuardrail.name;
    return {
        ...baseGuardrail,
        policyHint,
        run: async (args) => {
            const result = await baseGuardrail.run(args);
            return {
                ...result,
                guardrail: { ...result.guardrail, policyHint },
            };
        },
    };
}
/**
 * Generates a message that informs the model about why the guardrail was triggered and to
 * correct the behavior.
 */
function getRealtimeGuardrailFeedbackMessage(result) {
    return `
⚠️ Your last answer was blocked. 
Failed Guardrail Reason: ${result.guardrail.policyHint}. 
Failure Details: ${JSON.stringify(result.output.outputInfo ?? {})}. 
Please respond again following policy. Apologize for not being able to answer the question (while avoiding the specific reason) and divert discussion back to an approved topic immediately and not invite more discussion.
`.trim();
}
//# sourceMappingURL=guardrail.js.map