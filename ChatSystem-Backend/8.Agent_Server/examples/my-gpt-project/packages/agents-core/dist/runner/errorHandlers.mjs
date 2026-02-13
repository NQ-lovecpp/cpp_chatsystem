import { MaxTurnsExceededError } from "../errors.mjs";
import { assistant } from "../helpers/message.mjs";
import { RunMessageOutputItem } from "../items.mjs";
import { RunResult } from "../result.mjs";
import { runOutputGuardrails } from "./guardrails.mjs";
import { getTurnInput } from "./items.mjs";
import { streamStepItemsToRunResult } from "./streaming.mjs";
const buildRunData = (state) => ({
    input: state._originalInput,
    newItems: state._generatedItems,
    history: getTurnInput(state._originalInput, state._generatedItems),
    output: getTurnInput([], state._generatedItems),
    rawResponses: state._modelResponses,
    lastAgent: state._currentAgent,
    state,
});
const formatFinalOutput = (agent, finalOutput) => {
    if (agent.outputType === 'text') {
        return String(finalOutput);
    }
    return JSON.stringify(finalOutput);
};
const createFinalOutputItem = (agent, outputText) => new RunMessageOutputItem(assistant(outputText), agent);
export const tryHandleRunError = async ({ error, state, errorHandlers, outputGuardrailDefs, emitAgentEnd, streamResult, }) => {
    if (!(error instanceof MaxTurnsExceededError)) {
        return undefined;
    }
    const handler = errorHandlers?.maxTurns ?? errorHandlers?.default;
    if (!handler) {
        return undefined;
    }
    const handlerResult = await handler({
        error,
        context: state._context,
        runData: buildRunData(state),
    });
    if (!handlerResult) {
        return undefined;
    }
    const includeInHistory = handlerResult.includeInHistory !== false;
    const outputText = formatFinalOutput(state._currentAgent, handlerResult.finalOutput);
    state._lastTurnResponse = undefined;
    state._lastProcessedResponse = undefined;
    const item = createFinalOutputItem(state._currentAgent, outputText);
    if (includeInHistory) {
        state._generatedItems.push(item);
    }
    if (streamResult) {
        streamStepItemsToRunResult(streamResult, [item]);
    }
    state._currentStep = {
        type: 'next_step_final_output',
        output: outputText,
    };
    state._finalOutputSource = 'error_handler';
    await runOutputGuardrails(state, outputGuardrailDefs, outputText);
    state._currentTurnInProgress = false;
    emitAgentEnd(state._context, state._currentAgent, outputText);
    return new RunResult(state);
};
//# sourceMappingURL=errorHandlers.mjs.map