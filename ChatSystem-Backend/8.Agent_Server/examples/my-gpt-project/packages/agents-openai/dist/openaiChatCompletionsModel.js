"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var _OpenAIChatCompletionsModel_instances, _OpenAIChatCompletionsModel_client, _OpenAIChatCompletionsModel_model, _OpenAIChatCompletionsModel_fetchResponse;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIChatCompletionsModel = exports.FAKE_ID = void 0;
var agents_core_1 = require("@openai/agents-core");
var logger_1 = require("./logger");
var defaults_1 = require("./defaults");
var openaiChatCompletionsStreaming_1 = require("./openaiChatCompletionsStreaming");
var openaiChatCompletionsConverter_1 = require("./openaiChatCompletionsConverter");
exports.FAKE_ID = 'FAKE_ID';
function hasReasoningContent(message) {
    return ('reasoning' in message &&
        typeof message.reasoning === 'string' &&
        message.reasoning !== '');
}
/**
 * A model that uses (or is compatible with) OpenAI's Chat Completions API.
 */
var OpenAIChatCompletionsModel = /** @class */ (function () {
    function OpenAIChatCompletionsModel(client, model) {
        _OpenAIChatCompletionsModel_instances.add(this);
        _OpenAIChatCompletionsModel_client.set(this, void 0);
        _OpenAIChatCompletionsModel_model.set(this, void 0);
        __classPrivateFieldSet(this, _OpenAIChatCompletionsModel_client, client, "f");
        __classPrivateFieldSet(this, _OpenAIChatCompletionsModel_model, model, "f");
    }
    OpenAIChatCompletionsModel.prototype.getResponse = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var response, output, message, hasContent, content, rest, refusal, rest, _a, data, remainingAudioData, _i, _b, tool_call, callId, remainingToolCallData, _c, args, name_1, remainingFunctionData, modelResponse;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, agents_core_1.withGenerationSpan)(function (span) { return __awaiter(_this, void 0, void 0, function () {
                            var response;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        span.spanData.model = __classPrivateFieldGet(this, _OpenAIChatCompletionsModel_model, "f");
                                        span.spanData.model_config = request.modelSettings
                                            ? {
                                                temperature: request.modelSettings.temperature,
                                                top_p: request.modelSettings.topP,
                                                frequency_penalty: request.modelSettings.frequencyPenalty,
                                                presence_penalty: request.modelSettings.presencePenalty,
                                                reasoning_effort: (_a = request.modelSettings.reasoning) === null || _a === void 0 ? void 0 : _a.effort,
                                                verbosity: (_b = request.modelSettings.text) === null || _b === void 0 ? void 0 : _b.verbosity,
                                            }
                                            : { base_url: __classPrivateFieldGet(this, _OpenAIChatCompletionsModel_client, "f").baseURL };
                                        return [4 /*yield*/, __classPrivateFieldGet(this, _OpenAIChatCompletionsModel_instances, "m", _OpenAIChatCompletionsModel_fetchResponse).call(this, request, span, false)];
                                    case 1:
                                        response = _c.sent();
                                        if (span && request.tracing === true) {
                                            span.spanData.output = [response];
                                        }
                                        return [2 /*return*/, response];
                                }
                            });
                        }); })];
                    case 1:
                        response = _d.sent();
                        output = [];
                        if (response.choices && response.choices[0]) {
                            message = response.choices[0].message;
                            if (hasReasoningContent(message)) {
                                output.push({
                                    type: 'reasoning',
                                    content: [],
                                    rawContent: [
                                        {
                                            type: 'reasoning_text',
                                            text: message.reasoning,
                                        },
                                    ],
                                });
                            }
                            hasContent = message.content !== undefined &&
                                message.content !== null &&
                                // Azure OpenAI returns empty string instead of null for tool calls, causing parser rejection
                                !(message.tool_calls && message.content === '');
                            if (hasContent) {
                                content = message.content, rest = __rest(message, ["content"]);
                                output.push({
                                    id: response.id,
                                    type: 'message',
                                    role: 'assistant',
                                    content: [
                                        {
                                            type: 'output_text',
                                            text: content || '',
                                            providerData: rest,
                                        },
                                    ],
                                    status: 'completed',
                                });
                            }
                            else if (message.refusal) {
                                refusal = message.refusal, rest = __rest(message, ["refusal"]);
                                output.push({
                                    id: response.id,
                                    type: 'message',
                                    role: 'assistant',
                                    content: [
                                        {
                                            type: 'refusal',
                                            refusal: refusal || '',
                                            providerData: rest,
                                        },
                                    ],
                                    status: 'completed',
                                });
                            }
                            else if (message.audio) {
                                _a = message.audio, data = _a.data, remainingAudioData = __rest(_a, ["data"]);
                                output.push({
                                    id: response.id,
                                    type: 'message',
                                    role: 'assistant',
                                    content: [
                                        {
                                            type: 'audio',
                                            audio: data,
                                            providerData: remainingAudioData,
                                        },
                                    ],
                                    status: 'completed',
                                });
                            }
                            if (message.tool_calls) {
                                for (_i = 0, _b = message.tool_calls; _i < _b.length; _i++) {
                                    tool_call = _b[_i];
                                    if (tool_call.type === 'function') {
                                        callId = tool_call.id, remainingToolCallData = __rest(tool_call, ["id"]);
                                        _c = tool_call.function, args = _c.arguments, name_1 = _c.name, remainingFunctionData = __rest(_c, ["arguments", "name"]);
                                        output.push({
                                            id: response.id,
                                            type: 'function_call',
                                            arguments: args,
                                            name: name_1,
                                            callId: callId,
                                            status: 'completed',
                                            providerData: __assign(__assign({}, remainingToolCallData), remainingFunctionData),
                                        });
                                    }
                                }
                            }
                        }
                        modelResponse = {
                            usage: response.usage
                                ? new agents_core_1.Usage(toResponseUsage(response.usage))
                                : new agents_core_1.Usage(),
                            output: output,
                            responseId: response.id,
                            providerData: response,
                        };
                        return [2 /*return*/, modelResponse];
                }
            });
        });
    };
    OpenAIChatCompletionsModel.prototype.getStreamedResponse = function (request) {
        return __asyncGenerator(this, arguments, function getStreamedResponse_1() {
            var span, stream, response, _a, _b, _c, event_1, e_1_1, error_1;
            var _d, e_1, _e, _f;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        span = request.tracing ? (0, agents_core_1.createGenerationSpan)() : undefined;
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 17, 18, 19]);
                        if (span) {
                            span.start();
                            (0, agents_core_1.setCurrentSpan)(span);
                        }
                        return [4 /*yield*/, __await(__classPrivateFieldGet(this, _OpenAIChatCompletionsModel_instances, "m", _OpenAIChatCompletionsModel_fetchResponse).call(this, request, span, true))];
                    case 2:
                        stream = _h.sent();
                        response = {
                            id: exports.FAKE_ID,
                            created: Math.floor(Date.now() / 1000),
                            model: __classPrivateFieldGet(this, _OpenAIChatCompletionsModel_model, "f"),
                            object: 'chat.completion',
                            choices: [],
                            usage: {
                                prompt_tokens: 0,
                                completion_tokens: 0,
                                total_tokens: 0,
                            },
                        };
                        _h.label = 3;
                    case 3:
                        _h.trys.push([3, 10, 11, 16]);
                        _a = true, _b = __asyncValues((0, openaiChatCompletionsStreaming_1.convertChatCompletionsStreamToResponses)(response, stream));
                        _h.label = 4;
                    case 4: return [4 /*yield*/, __await(_b.next())];
                    case 5:
                        if (!(_c = _h.sent(), _d = _c.done, !_d)) return [3 /*break*/, 9];
                        _f = _c.value;
                        _a = false;
                        event_1 = _f;
                        if (event_1.type === 'response_done' &&
                            ((_g = response.usage) === null || _g === void 0 ? void 0 : _g.total_tokens) === 0) {
                            response.usage = {
                                prompt_tokens: event_1.response.usage.inputTokens,
                                completion_tokens: event_1.response.usage.outputTokens,
                                total_tokens: event_1.response.usage.totalTokens,
                                prompt_tokens_details: Array.isArray(event_1.response.usage.inputTokensDetails)
                                    ? event_1.response.usage.inputTokensDetails[0]
                                    : event_1.response.usage.inputTokensDetails,
                                completion_tokens_details: Array.isArray(event_1.response.usage.outputTokensDetails)
                                    ? event_1.response.usage.outputTokensDetails[0]
                                    : event_1.response.usage.outputTokensDetails,
                            };
                        }
                        return [4 /*yield*/, __await(event_1)];
                    case 6: return [4 /*yield*/, _h.sent()];
                    case 7:
                        _h.sent();
                        _h.label = 8;
                    case 8:
                        _a = true;
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _h.trys.push([11, , 14, 15]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, __await(_e.call(_b))];
                    case 12:
                        _h.sent();
                        _h.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16:
                        if (span && response && request.tracing === true) {
                            span.spanData.output = [response];
                        }
                        return [3 /*break*/, 19];
                    case 17:
                        error_1 = _h.sent();
                        if (span) {
                            span.setError({
                                message: 'Error streaming response',
                                data: {
                                    error: request.tracing === true
                                        ? String(error_1)
                                        : error_1 instanceof Error
                                            ? error_1.name
                                            : undefined,
                                },
                            });
                        }
                        throw error_1;
                    case 18:
                        if (span) {
                            span.end();
                            (0, agents_core_1.resetCurrentSpan)();
                        }
                        return [7 /*endfinally*/];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    return OpenAIChatCompletionsModel;
}());
exports.OpenAIChatCompletionsModel = OpenAIChatCompletionsModel;
_OpenAIChatCompletionsModel_client = new WeakMap(), _OpenAIChatCompletionsModel_model = new WeakMap(), _OpenAIChatCompletionsModel_instances = new WeakSet(), _OpenAIChatCompletionsModel_fetchResponse = function _OpenAIChatCompletionsModel_fetchResponse(request, span, stream) {
    return __awaiter(this, void 0, void 0, function () {
        var tools, _i, _a, tool, _b, _c, handoff, responseFormat, parallelToolCalls, messages, providerData, requestData, completion;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    tools = [];
                    if (request.tools) {
                        for (_i = 0, _a = request.tools; _i < _a.length; _i++) {
                            tool = _a[_i];
                            tools.push((0, openaiChatCompletionsConverter_1.toolToOpenAI)(tool));
                        }
                    }
                    if (request.handoffs) {
                        for (_b = 0, _c = request.handoffs; _b < _c.length; _b++) {
                            handoff = _c[_b];
                            tools.push((0, openaiChatCompletionsConverter_1.convertHandoffTool)(handoff));
                        }
                    }
                    responseFormat = getResponseFormat(request.outputType);
                    parallelToolCalls = undefined;
                    if (typeof request.modelSettings.parallelToolCalls === 'boolean') {
                        if (request.modelSettings.parallelToolCalls && tools.length === 0) {
                            throw new Error('Parallel tool calls are not supported without tools');
                        }
                        parallelToolCalls = request.modelSettings.parallelToolCalls;
                    }
                    messages = (0, openaiChatCompletionsConverter_1.itemsToMessages)(request.input);
                    if (request.systemInstructions) {
                        messages.unshift({
                            content: request.systemInstructions,
                            role: 'system',
                        });
                    }
                    if (span && request.tracing === true) {
                        span.spanData.input = messages;
                    }
                    providerData = (_d = request.modelSettings.providerData) !== null && _d !== void 0 ? _d : {};
                    if (request.modelSettings.reasoning &&
                        request.modelSettings.reasoning.effort) {
                        // merge the top-level reasoning.effort into provider data
                        providerData.reasoning_effort = request.modelSettings.reasoning.effort;
                    }
                    if (request.modelSettings.text && request.modelSettings.text.verbosity) {
                        // merge the top-level text.verbosity into provider data
                        providerData.verbosity = request.modelSettings.text.verbosity;
                    }
                    requestData = __assign({ model: __classPrivateFieldGet(this, _OpenAIChatCompletionsModel_model, "f"), messages: messages, tools: tools.length ? tools : undefined, temperature: request.modelSettings.temperature, top_p: request.modelSettings.topP, frequency_penalty: request.modelSettings.frequencyPenalty, presence_penalty: request.modelSettings.presencePenalty, max_tokens: request.modelSettings.maxTokens, tool_choice: (0, openaiChatCompletionsConverter_1.convertToolChoice)(request.modelSettings.toolChoice), parallel_tool_calls: parallelToolCalls, stream: stream ? true : false, stream_options: stream ? { include_usage: true } : undefined, store: request.modelSettings.store, prompt_cache_retention: request.modelSettings.promptCacheRetention }, providerData);
                    if (responseFormat) {
                        requestData.response_format = responseFormat;
                    }
                    if (logger_1.default.dontLogModelData) {
                        logger_1.default.debug('Calling LLM');
                    }
                    else {
                        logger_1.default.debug("Calling LLM. Request data: ".concat(JSON.stringify(requestData, null, 2)));
                    }
                    return [4 /*yield*/, __classPrivateFieldGet(this, _OpenAIChatCompletionsModel_client, "f").chat.completions.create(requestData, {
                            headers: defaults_1.HEADERS,
                            signal: request.signal,
                        })];
                case 1:
                    completion = _e.sent();
                    if (logger_1.default.dontLogModelData) {
                        logger_1.default.debug('Response received');
                    }
                    else {
                        logger_1.default.debug("Response received: ".concat(JSON.stringify(completion, null, 2)));
                    }
                    return [2 /*return*/, completion];
            }
        });
    });
};
function getResponseFormat(outputType) {
    if (outputType === 'text') {
        // Avoid sending response_format for plain text responses because some Chat Completions
        // compatible providers (e.g., Claude) reject non-json_schema values here. OpenAI's API
        // already treats text as the default when the field is omitted.
        return undefined;
    }
    if (outputType.type === 'json_schema') {
        return {
            type: 'json_schema',
            json_schema: {
                name: outputType.name,
                strict: outputType.strict,
                schema: outputType.schema,
            },
        };
    }
    return { type: 'json_object' };
}
function toResponseUsage(usage) {
    var _a, _b;
    return {
        requests: 1,
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
        input_tokens_details: {
            cached_tokens: ((_a = usage.prompt_tokens_details) === null || _a === void 0 ? void 0 : _a.cached_tokens) || 0,
        },
        output_tokens_details: {
            reasoning_tokens: ((_b = usage.completion_tokens_details) === null || _b === void 0 ? void 0 : _b.reasoning_tokens) || 0,
        },
    };
}
