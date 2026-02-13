import { z } from 'zod';
import { ModelResponse } from '../model';
import { RunItem } from '../items';
import { AgentInputItem } from '../types';
export declare const nextStepSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"next_step_handoff">;
    newAgent: z.ZodAny;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"next_step_final_output">;
    output: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"next_step_run_again">;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"next_step_interruption">;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
}, z.core.$strip>], "type">;
export type NextStep = z.infer<typeof nextStepSchema>;
export declare class SingleStepResult {
    originalInput: string | AgentInputItem[];
    modelResponse: ModelResponse;
    preStepItems: RunItem[];
    newStepItems: RunItem[];
    nextStep: NextStep;
    constructor(originalInput: string | AgentInputItem[], modelResponse: ModelResponse, preStepItems: RunItem[], newStepItems: RunItem[], nextStep: NextStep);
    get generatedItems(): RunItem[];
}
