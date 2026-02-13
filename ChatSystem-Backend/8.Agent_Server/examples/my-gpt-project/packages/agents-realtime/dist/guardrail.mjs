import { defineOutputGuardrail, } from '@openai/agents-core';
export function getRealtimeGuardrailSettings(settings) {
    return {
        debounceTextLength: settings.debounceTextLength ?? 100,
    };
}
export function defineRealtimeOutputGuardrail({ policyHint: policyHintInput, ...options }) {
    const baseGuardrail = defineOutputGuardrail(options);
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
export function getRealtimeGuardrailFeedbackMessage(result) {
    return `
⚠️ Your last answer was blocked. 
Failed Guardrail Reason: ${result.guardrail.policyHint}. 
Failure Details: ${JSON.stringify(result.output.outputInfo ?? {})}. 
Please respond again following policy. Apologize for not being able to answer the question (while avoiding the specific reason) and divert discussion back to an approved topic immediately and not invite more discussion.
`.trim();
}
//# sourceMappingURL=guardrail.mjs.map