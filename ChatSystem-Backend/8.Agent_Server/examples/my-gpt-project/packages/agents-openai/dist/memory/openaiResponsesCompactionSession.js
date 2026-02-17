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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIResponsesCompactionSession = void 0;
var openai_1 = require("openai");
var agents_core_1 = require("@openai/agents-core");
var defaults_1 = require("../defaults");
var openaiResponsesModel_1 = require("../openaiResponsesModel");
var openaiSessionApi_1 = require("./openaiSessionApi");
var DEFAULT_COMPACTION_THRESHOLD = 10;
var logger = (0, agents_core_1.getLogger)('openai-agents:openai:compaction');
/**
 * Session decorator that triggers `responses.compact` when the stored history grows.
 *
 * This session is intended to be passed to `run()` so the runner can automatically supply the
 * latest `responseId` and invoke compaction after each completed turn is persisted.
 *
 * To debug compaction decisions, enable the `debug` logger for
 * `openai-agents:openai:compaction` (for example, `DEBUG=openai-agents:openai:compaction`).
 */
var OpenAIResponsesCompactionSession = /** @class */ (function () {
    function OpenAIResponsesCompactionSession(options) {
        var _b, _c, _d, _e;
        this[_a] = 'responses';
        this.client = resolveClient(options);
        if (isOpenAIConversationsSessionDelegate(options.underlyingSession)) {
            throw new agents_core_1.UserError('OpenAIResponsesCompactionSession does not support OpenAIConversationsSession as an underlying session.');
        }
        this.underlyingSession = (_b = options.underlyingSession) !== null && _b !== void 0 ? _b : new agents_core_1.MemorySession();
        var model = ((_c = options.model) !== null && _c !== void 0 ? _c : defaults_1.DEFAULT_OPENAI_MODEL).trim();
        assertSupportedOpenAIResponsesCompactionModel(model);
        this.model = model;
        this.compactionMode = (_d = options.compactionMode) !== null && _d !== void 0 ? _d : 'auto';
        this.shouldTriggerCompaction =
            (_e = options.shouldTriggerCompaction) !== null && _e !== void 0 ? _e : defaultShouldTriggerCompaction;
        this.compactionCandidateItems = undefined;
        this.sessionItems = undefined;
        this.lastStore = undefined;
    }
    OpenAIResponsesCompactionSession.prototype.runCompaction = function () {
        return __awaiter(this, arguments, void 0, function (args) {
            var requestedMode, resolvedMode, _b, compactionCandidateItems, sessionItems, shouldTriggerCompaction, _c, compactRequest, compacted, outputItems;
            var _d, _e, _f, _g, _h;
            if (args === void 0) { args = {}; }
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        this.responseId = (_e = (_d = args.responseId) !== null && _d !== void 0 ? _d : this.responseId) !== null && _e !== void 0 ? _e : undefined;
                        if (args.store !== undefined) {
                            this.lastStore = args.store;
                        }
                        requestedMode = (_f = args.compactionMode) !== null && _f !== void 0 ? _f : this.compactionMode;
                        resolvedMode = resolveCompactionMode({
                            requestedMode: requestedMode,
                            responseId: this.responseId,
                            store: (_g = args.store) !== null && _g !== void 0 ? _g : this.lastStore,
                        });
                        if (resolvedMode === 'previous_response_id' && !this.responseId) {
                            throw new agents_core_1.UserError('OpenAIResponsesCompactionSession.runCompaction requires a responseId from the last completed turn when using previous_response_id compaction.');
                        }
                        return [4 /*yield*/, this.ensureCompactionCandidates()];
                    case 1:
                        _b = _j.sent(), compactionCandidateItems = _b.compactionCandidateItems, sessionItems = _b.sessionItems;
                        if (!(args.force === true)) return [3 /*break*/, 2];
                        _c = true;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.shouldTriggerCompaction({
                            responseId: this.responseId,
                            compactionMode: resolvedMode,
                            compactionCandidateItems: compactionCandidateItems,
                            sessionItems: sessionItems,
                        })];
                    case 3:
                        _c = _j.sent();
                        _j.label = 4;
                    case 4:
                        shouldTriggerCompaction = _c;
                        if (!shouldTriggerCompaction) {
                            logger.debug('skip: decision hook %o', {
                                responseId: this.responseId,
                                compactionMode: resolvedMode,
                            });
                            return [2 /*return*/, null];
                        }
                        logger.debug('compact: start %o', {
                            responseId: this.responseId,
                            model: this.model,
                            compactionMode: resolvedMode,
                        });
                        compactRequest = {
                            model: this.model,
                        };
                        if (resolvedMode === 'previous_response_id') {
                            compactRequest.previous_response_id = this.responseId;
                        }
                        else {
                            compactRequest.input = (0, openaiResponsesModel_1.getInputItems)(sessionItems);
                        }
                        return [4 /*yield*/, this.client.responses.compact(compactRequest)];
                    case 5:
                        compacted = _j.sent();
                        return [4 /*yield*/, this.underlyingSession.clearSession()];
                    case 6:
                        _j.sent();
                        outputItems = ((_h = compacted.output) !== null && _h !== void 0 ? _h : []);
                        if (!(outputItems.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.underlyingSession.addItems(outputItems)];
                    case 7:
                        _j.sent();
                        _j.label = 8;
                    case 8:
                        this.compactionCandidateItems = selectCompactionCandidateItems(outputItems);
                        this.sessionItems = outputItems;
                        logger.debug('compact: done %o', {
                            responseId: this.responseId,
                            compactionMode: resolvedMode,
                            outputItemCount: outputItems.length,
                            candidateCount: this.compactionCandidateItems.length,
                        });
                        return [2 /*return*/, {
                                usage: toRequestUsage(compacted.usage),
                            }];
                }
            });
        });
    };
    OpenAIResponsesCompactionSession.prototype.getSessionId = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, this.underlyingSession.getSessionId()];
            });
        });
    };
    OpenAIResponsesCompactionSession.prototype.getItems = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, this.underlyingSession.getItems(limit)];
            });
        });
    };
    OpenAIResponsesCompactionSession.prototype.addItems = function (items) {
        return __awaiter(this, void 0, void 0, function () {
            var candidates;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (items.length === 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.underlyingSession.addItems(items)];
                    case 1:
                        _b.sent();
                        if (this.compactionCandidateItems) {
                            candidates = selectCompactionCandidateItems(items);
                            if (candidates.length > 0) {
                                this.compactionCandidateItems = __spreadArray(__spreadArray([], this.compactionCandidateItems, true), candidates, true);
                            }
                        }
                        if (this.sessionItems) {
                            this.sessionItems = __spreadArray(__spreadArray([], this.sessionItems, true), items, true);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenAIResponsesCompactionSession.prototype.popItem = function () {
        return __awaiter(this, void 0, void 0, function () {
            var popped, index, _b, isCandidate, index, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.underlyingSession.popItem()];
                    case 1:
                        popped = _e.sent();
                        if (!popped) {
                            return [2 /*return*/, popped];
                        }
                        if (!this.sessionItems) return [3 /*break*/, 4];
                        index = this.sessionItems.lastIndexOf(popped);
                        if (!(index >= 0)) return [3 /*break*/, 2];
                        this.sessionItems.splice(index, 1);
                        return [3 /*break*/, 4];
                    case 2:
                        _b = this;
                        return [4 /*yield*/, this.underlyingSession.getItems()];
                    case 3:
                        _b.sessionItems = _e.sent();
                        _e.label = 4;
                    case 4:
                        if (!this.compactionCandidateItems) return [3 /*break*/, 7];
                        isCandidate = selectCompactionCandidateItems([popped]).length > 0;
                        if (!isCandidate) return [3 /*break*/, 7];
                        index = this.compactionCandidateItems.indexOf(popped);
                        if (!(index >= 0)) return [3 /*break*/, 5];
                        this.compactionCandidateItems.splice(index, 1);
                        return [3 /*break*/, 7];
                    case 5:
                        // Fallback when the popped item reference differs from stored candidates.
                        _c = this;
                        _d = selectCompactionCandidateItems;
                        return [4 /*yield*/, this.underlyingSession.getItems()];
                    case 6:
                        // Fallback when the popped item reference differs from stored candidates.
                        _c.compactionCandidateItems = _d.apply(void 0, [_e.sent()]);
                        _e.label = 7;
                    case 7: return [2 /*return*/, popped];
                }
            });
        });
    };
    OpenAIResponsesCompactionSession.prototype.clearSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.underlyingSession.clearSession()];
                    case 1:
                        _b.sent();
                        this.compactionCandidateItems = [];
                        this.sessionItems = [];
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenAIResponsesCompactionSession.prototype.ensureCompactionCandidates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var history, compactionCandidates;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.compactionCandidateItems && this.sessionItems) {
                            logger.debug('candidates: cached %o', {
                                candidateCount: this.compactionCandidateItems.length,
                            });
                            return [2 /*return*/, {
                                    compactionCandidateItems: __spreadArray([], this.compactionCandidateItems, true),
                                    sessionItems: __spreadArray([], this.sessionItems, true),
                                }];
                        }
                        return [4 /*yield*/, this.underlyingSession.getItems()];
                    case 1:
                        history = _b.sent();
                        compactionCandidates = selectCompactionCandidateItems(history);
                        this.compactionCandidateItems = compactionCandidates;
                        this.sessionItems = history;
                        logger.debug('candidates: initialized %o', {
                            historyLength: history.length,
                            candidateCount: compactionCandidates.length,
                        });
                        return [2 /*return*/, {
                                compactionCandidateItems: __spreadArray([], compactionCandidates, true),
                                sessionItems: __spreadArray([], history, true),
                            }];
                }
            });
        });
    };
    return OpenAIResponsesCompactionSession;
}());
exports.OpenAIResponsesCompactionSession = OpenAIResponsesCompactionSession;
_a = openaiSessionApi_1.OPENAI_SESSION_API;
function resolveCompactionMode(options) {
    var requestedMode = options.requestedMode, responseId = options.responseId, store = options.store;
    if (requestedMode !== 'auto') {
        return requestedMode;
    }
    if (store === false) {
        return 'input';
    }
    if (!responseId) {
        return 'input';
    }
    return 'previous_response_id';
}
function resolveClient(options) {
    if (options.client) {
        return options.client;
    }
    var defaultClient = (0, defaults_1.getDefaultOpenAIClient)();
    if (defaultClient) {
        return defaultClient;
    }
    return new openai_1.default();
}
function defaultShouldTriggerCompaction(_b) {
    var compactionCandidateItems = _b.compactionCandidateItems;
    return compactionCandidateItems.length >= DEFAULT_COMPACTION_THRESHOLD;
}
function selectCompactionCandidateItems(items) {
    return items.filter(function (item) {
        if (item.type === 'compaction') {
            return false;
        }
        return !(item.type === 'message' && item.role === 'user');
    });
}
function assertSupportedOpenAIResponsesCompactionModel(model) {
    if (!isOpenAIModelName(model)) {
        throw new Error("Unsupported model for OpenAI responses compaction: ".concat(JSON.stringify(model)));
    }
}
function isOpenAIModelName(model) {
    var trimmed = model.trim();
    if (!trimmed) {
        return false;
    }
    // The OpenAI SDK does not ship a runtime allowlist of model names.
    // This check relies on common model naming conventions and intentionally allows unknown `gpt-*` variants.
    // Fine-tuned model IDs typically look like: ft:gpt-4o-mini:org:project:suffix.
    var withoutFineTunePrefix = trimmed.startsWith('ft:')
        ? trimmed.slice('ft:'.length)
        : trimmed;
    var root = withoutFineTunePrefix.split(':', 1)[0];
    // Allow unknown `gpt-*` variants to avoid needing updates whenever new models ship.
    if (root.startsWith('gpt-')) {
        return true;
    }
    // Allow the `o*` reasoning models
    if (/^o\d[a-z0-9-]*$/i.test(root)) {
        return true;
    }
    return false;
}
function toRequestUsage(usage) {
    var _b, _c, _d;
    return new agents_core_1.RequestUsage({
        inputTokens: (_b = usage === null || usage === void 0 ? void 0 : usage.input_tokens) !== null && _b !== void 0 ? _b : 0,
        outputTokens: (_c = usage === null || usage === void 0 ? void 0 : usage.output_tokens) !== null && _c !== void 0 ? _c : 0,
        totalTokens: (_d = usage === null || usage === void 0 ? void 0 : usage.total_tokens) !== null && _d !== void 0 ? _d : 0,
        inputTokensDetails: __assign({}, usage === null || usage === void 0 ? void 0 : usage.input_tokens_details),
        outputTokensDetails: __assign({}, usage === null || usage === void 0 ? void 0 : usage.output_tokens_details),
        endpoint: 'responses.compact',
    });
}
function isOpenAIConversationsSessionDelegate(underlyingSession) {
    return (!!underlyingSession &&
        typeof underlyingSession === 'object' &&
        openaiSessionApi_1.OPENAI_SESSION_API in underlyingSession &&
        underlyingSession[openaiSessionApi_1.OPENAI_SESSION_API] === 'conversations');
}
