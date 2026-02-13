"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryHandleRunError = void 0;
const errors_1 = require("../errors.js");
const message_1 = require("../helpers/message.js");
const items_1 = require("../items.js");
const result_1 = require("../result.js");
const guardrails_1 = require("./guardrails.js");
const items_2 = require("./items.js");
const streaming_1 = require("./streaming.js");
const buildRunData = (state) => ({
    input: state._originalInput,
    newItems: state._generatedItems,
    history: (0, items_2.getTurnInput)(state._originalInput, state._generatedItems),
    output: (0, items_2.getTurnInput)([], state._generatedItems),
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
const createFinalOutputItem = (agent, outputText) => new items_1.RunMessageOutputItem((0, message_1.assistant)(outputText), agent);
const tryHandleRunError = async ({ error, state, errorHandlers, outputGuardrailDefs, emitAgentEnd, streamResult, }) => {
    if (!(error instanceof errors_1.MaxTurnsExceededError)) {
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
        (0, streaming_1.streamStepItemsToRunResult)(streamResult, [item]);
    }
    state._currentStep = {
        type: 'next_step_final_output',
        output: outputText,
    };
    state._finalOutputSource = 'error_handler';
    await (0, guardrails_1.runOutputGuardrails)(state, outputGuardrailDefs, outputText);
    state._currentTurnInProgress = false;
    emitAgentEnd(state._context, state._currentAgent, outputText);
    return new result_1.RunResult(state);
};
exports.tryHandleRunError = tryHandleRunError;
//# sourceMappingURL=errorHandlers.js.map