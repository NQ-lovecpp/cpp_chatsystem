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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertChatCompletionsStreamToResponses = convertChatCompletionsStreamToResponses;
var openaiChatCompletionsModel_1 = require("./openaiChatCompletionsModel");
function convertChatCompletionsStreamToResponses(response, stream) {
    return __asyncGenerator(this, arguments, function convertChatCompletionsStreamToResponses_1() {
        var usage, state, _a, stream_1, stream_1_1, chunk, delta, _i, _b, tc_delta, tc_function, e_1_1, outputs, content, _c, _d, function_call, finalEvent;
        var _e, e_1, _f, _g;
        var _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return __generator(this, function (_s) {
            switch (_s.label) {
                case 0:
                    usage = undefined;
                    state = {
                        started: false,
                        text_content: null,
                        refusal_content: null,
                        function_calls: {},
                        reasoning: '',
                    };
                    _s.label = 1;
                case 1:
                    _s.trys.push([1, 14, 15, 20]);
                    _a = true, stream_1 = __asyncValues(stream);
                    _s.label = 2;
                case 2: return [4 /*yield*/, __await(stream_1.next())];
                case 3:
                    if (!(stream_1_1 = _s.sent(), _e = stream_1_1.done, !_e)) return [3 /*break*/, 13];
                    _g = stream_1_1.value;
                    _a = false;
                    chunk = _g;
                    if (!!state.started) return [3 /*break*/, 6];
                    state.started = true;
                    return [4 /*yield*/, __await({
                            type: 'response_started',
                            providerData: __assign({}, chunk),
                        })];
                case 4: return [4 /*yield*/, _s.sent()];
                case 5:
                    _s.sent();
                    _s.label = 6;
                case 6: return [4 /*yield*/, __await({
                        type: 'model',
                        event: chunk,
                    })];
                case 7: 
                // always yield the raw event
                return [4 /*yield*/, _s.sent()];
                case 8:
                    // always yield the raw event
                    _s.sent();
                    // This is always set by the OpenAI API, but not by others e.g. LiteLLM
                    usage = chunk.usage || undefined;
                    if (!((_j = (_h = chunk.choices) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.delta))
                        return [3 /*break*/, 12];
                    delta = chunk.choices[0].delta;
                    if (!delta.content) return [3 /*break*/, 11];
                    if (!state.text_content) {
                        state.text_content = {
                            text: '',
                            type: 'output_text',
                            providerData: { annotations: [] },
                        };
                    }
                    return [4 /*yield*/, __await({
                            type: 'output_text_delta',
                            delta: delta.content,
                            providerData: __assign({}, chunk),
                        })];
                case 9: return [4 /*yield*/, _s.sent()];
                case 10:
                    _s.sent();
                    state.text_content.text += delta.content;
                    _s.label = 11;
                case 11:
                    if ('reasoning' in delta &&
                        delta.reasoning &&
                        typeof delta.reasoning === 'string') {
                        state.reasoning += delta.reasoning;
                    }
                    // Handle refusals
                    if ('refusal' in delta && delta.refusal) {
                        if (!state.refusal_content) {
                            state.refusal_content = { refusal: '', type: 'refusal' };
                        }
                        state.refusal_content.refusal += delta.refusal;
                    }
                    // Handle tool calls
                    if (delta.tool_calls) {
                        for (_i = 0, _b = delta.tool_calls; _i < _b.length; _i++) {
                            tc_delta = _b[_i];
                            if (!(tc_delta.index in state.function_calls)) {
                                state.function_calls[tc_delta.index] = {
                                    id: openaiChatCompletionsModel_1.FAKE_ID,
                                    arguments: '',
                                    name: '',
                                    type: 'function_call',
                                    callId: '',
                                };
                            }
                            tc_function = tc_delta.function;
                            state.function_calls[tc_delta.index].arguments +=
                                (tc_function === null || tc_function === void 0 ? void 0 : tc_function.arguments) || '';
                            state.function_calls[tc_delta.index].name += (tc_function === null || tc_function === void 0 ? void 0 : tc_function.name) || '';
                            state.function_calls[tc_delta.index].callId += tc_delta.id || '';
                        }
                    }
                    _s.label = 12;
                case 12:
                    _a = true;
                    return [3 /*break*/, 2];
                case 13: return [3 /*break*/, 20];
                case 14:
                    e_1_1 = _s.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 20];
                case 15:
                    _s.trys.push([15, , 18, 19]);
                    if (!(!_a && !_e && (_f = stream_1.return))) return [3 /*break*/, 17];
                    return [4 /*yield*/, __await(_f.call(stream_1))];
                case 16:
                    _s.sent();
                    _s.label = 17;
                case 17: return [3 /*break*/, 19];
                case 18:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 19: return [7 /*endfinally*/];
                case 20:
                    outputs = [];
                    if (state.reasoning) {
                        outputs.push({
                            type: 'reasoning',
                            content: [],
                            rawContent: [{ type: 'reasoning_text', text: state.reasoning }],
                        });
                    }
                    if (state.text_content || state.refusal_content) {
                        content = [];
                        if (state.text_content) {
                            content.push(state.text_content);
                        }
                        if (state.refusal_content) {
                            content.push(state.refusal_content);
                        }
                        outputs.push({
                            id: openaiChatCompletionsModel_1.FAKE_ID,
                            content: content,
                            role: 'assistant',
                            type: 'message',
                            status: 'completed',
                        });
                    }
                    for (_c = 0, _d = Object.values(state.function_calls); _c < _d.length; _c++) {
                        function_call = _d[_c];
                        // Some providers, such as Bedrock, may send two items:
                        // 1) an empty argument, and 2) the actual argument data.
                        // This is a workaround for that specific behavior.
                        if (function_call.arguments.startsWith('{}{')) {
                            function_call.arguments = function_call.arguments.slice(2);
                        }
                        outputs.push(function_call);
                    }
                    finalEvent = {
                        type: 'response_done',
                        response: {
                            id: response.id,
                            usage: {
                                inputTokens: (_k = usage === null || usage === void 0 ? void 0 : usage.prompt_tokens) !== null && _k !== void 0 ? _k : 0,
                                outputTokens: (_l = usage === null || usage === void 0 ? void 0 : usage.completion_tokens) !== null && _l !== void 0 ? _l : 0,
                                totalTokens: (_m = usage === null || usage === void 0 ? void 0 : usage.total_tokens) !== null && _m !== void 0 ? _m : 0,
                                inputTokensDetails: {
                                    cached_tokens: (_p = (_o = usage === null || usage === void 0 ? void 0 : usage.prompt_tokens_details) === null || _o === void 0 ? void 0 : _o.cached_tokens) !== null && _p !== void 0 ? _p : 0,
                                },
                                outputTokensDetails: {
                                    reasoning_tokens: (_r = (_q = usage === null || usage === void 0 ? void 0 : usage.completion_tokens_details) === null || _q === void 0 ? void 0 : _q.reasoning_tokens) !== null && _r !== void 0 ? _r : 0,
                                },
                            },
                            output: outputs,
                        },
                    };
                    return [4 /*yield*/, __await(finalEvent)];
                case 21: return [4 /*yield*/, _s.sent()];
                case 22:
                    _s.sent();
                    return [2 /*return*/];
            }
        });
    });
}
