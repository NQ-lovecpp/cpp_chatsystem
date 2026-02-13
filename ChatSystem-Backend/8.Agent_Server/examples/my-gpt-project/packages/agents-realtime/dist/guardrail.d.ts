import { OutputGuardrailResult, OutputGuardrail, OutputGuardrailDefinition, OutputGuardrailMetadata, OutputGuardrailFunctionArgs } from '@openai/agents-core';
export interface RealtimeOutputGuardrailSettings {
    /**
     * The number of characters in the text transcript to trigger the next guardrail execution.
     * Executes every `debounceTextLength` characters.
     * Defaults to 100.
     * Set to -1 if you want to only run the guardrail when the entire transcript is available.
     *
     * @default 100
     */
    debounceTextLength: number;
}
export declare function getRealtimeGuardrailSettings(settings: Partial<RealtimeOutputGuardrailSettings>): RealtimeOutputGuardrailSettings;
export interface RealtimeOutputGuardrail extends OutputGuardrail {
    /**
     * This will be passed to the model to inform it about why the guardrail was triggered and to
     * correct the behavior. If it's not specified the name of your guardrail will be passed instead.
     */
    policyHint?: string;
}
export interface RealtimeGuardrailMetadata extends OutputGuardrailMetadata {
    policyHint?: string;
}
export interface RealtimeOutputGuardrailDefinition extends OutputGuardrailDefinition<RealtimeGuardrailMetadata>, RealtimeGuardrailMetadata {
    run(args: OutputGuardrailFunctionArgs<unknown>): Promise<OutputGuardrailResult<RealtimeGuardrailMetadata>>;
}
export declare function defineRealtimeOutputGuardrail({ policyHint: policyHintInput, ...options }: RealtimeOutputGuardrail): RealtimeOutputGuardrailDefinition;
/**
 * Generates a message that informs the model about why the guardrail was triggered and to
 * correct the behavior.
 */
export declare function getRealtimeGuardrailFeedbackMessage(result: OutputGuardrailResult<RealtimeGuardrailMetadata>): string;
