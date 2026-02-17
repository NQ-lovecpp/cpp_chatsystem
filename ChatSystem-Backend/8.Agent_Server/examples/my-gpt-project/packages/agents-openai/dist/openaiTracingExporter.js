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
var _OpenAITracingExporter_options;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAITracingExporter = void 0;
exports.setDefaultOpenAITracingExporter = setDefaultOpenAITracingExporter;
var agents_core_1 = require("@openai/agents-core");
var defaults_1 = require("./defaults");
var logger_1 = require("./logger");
/**
 * A tracing exporter that exports traces to OpenAI's tracing API.
 */
var OpenAITracingExporter = /** @class */ (function () {
    function OpenAITracingExporter(options) {
        if (options === void 0) { options = {}; }
        var _a, _b, _c, _d, _e, _f, _g;
        _OpenAITracingExporter_options.set(this, void 0);
        __classPrivateFieldSet(this, _OpenAITracingExporter_options, {
            apiKey: (_a = options.apiKey) !== null && _a !== void 0 ? _a : undefined,
            organization: (_b = options.organization) !== null && _b !== void 0 ? _b : '',
            project: (_c = options.project) !== null && _c !== void 0 ? _c : '',
            endpoint: (_d = options.endpoint) !== null && _d !== void 0 ? _d : 'https://api.openai.com/v1/traces/ingest',
            maxRetries: (_e = options.maxRetries) !== null && _e !== void 0 ? _e : 3,
            baseDelay: (_f = options.baseDelay) !== null && _f !== void 0 ? _f : 1000,
            maxDelay: (_g = options.maxDelay) !== null && _g !== void 0 ? _g : 30000,
        }, "f");
    }
    OpenAITracingExporter.prototype.export = function (items, signal) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultApiKey, itemsByKey, _i, items_1, item, mapKey, list, _a, _b, _c, key, groupedItems, apiKey, payloadItems, payload, attempts, delay, _loop_1, this_1, state_1;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        defaultApiKey = (_d = __classPrivateFieldGet(this, _OpenAITracingExporter_options, "f").apiKey) !== null && _d !== void 0 ? _d : (0, defaults_1.getTracingExportApiKey)();
                        itemsByKey = new Map();
                        for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                            item = items_1[_i];
                            mapKey = item.tracingApiKey;
                            list = (_e = itemsByKey.get(mapKey)) !== null && _e !== void 0 ? _e : [];
                            list.push(item);
                            itemsByKey.set(mapKey, list);
                        }
                        _a = 0, _b = itemsByKey.entries();
                        _f.label = 1;
                    case 1:
                        if (!(_a < _b.length)) return [3 /*break*/, 6];
                        _c = _b[_a], key = _c[0], groupedItems = _c[1];
                        apiKey = key !== null && key !== void 0 ? key : defaultApiKey;
                        if (!apiKey) {
                            logger_1.default.error('No API key provided for OpenAI tracing exporter. Exports will be skipped');
                            return [3 /*break*/, 5];
                        }
                        payloadItems = groupedItems
                            .map(function (entry) { return entry.toJSON(); })
                            .filter(function (item) { return !!item; });
                        payload = { data: payloadItems };
                        attempts = 0;
                        delay = __classPrivateFieldGet(this, _OpenAITracingExporter_options, "f").baseDelay;
                        _loop_1 = function () {
                            var response, _g, _h, _j, _k, error_1, sleepTime;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        _l.trys.push([0, 4, , 5]);
                                        return [4 /*yield*/, fetch(__classPrivateFieldGet(this_1, _OpenAITracingExporter_options, "f").endpoint, {
                                                method: 'POST',
                                                headers: __assign({ 'Content-Type': 'application/json', Authorization: "Bearer ".concat(apiKey), 'OpenAI-Beta': 'traces=v1' }, defaults_1.HEADERS),
                                                body: JSON.stringify(payload),
                                                signal: signal,
                                            })];
                                    case 1:
                                        response = _l.sent();
                                        if (response.ok) {
                                            logger_1.default.debug("Exported ".concat(payload.data.length, " items"));
                                            return [2 /*return*/, "break"];
                                        }
                                        if (!(response.status >= 400 && response.status < 500)) return [3 /*break*/, 3];
                                        _h = (_g = logger_1.default).error;
                                        _k = (_j = "[non-fatal] Tracing client error ".concat(response.status, ": ")).concat;
                                        return [4 /*yield*/, response.text()];
                                    case 2:
                                        _h.apply(_g, [_k.apply(_j, [_l.sent()])]);
                                        return [2 /*return*/, "break"];
                                    case 3:
                                        logger_1.default.warn("[non-fatal] Tracing: server error ".concat(response.status, ", retrying."));
                                        return [3 /*break*/, 5];
                                    case 4:
                                        error_1 = _l.sent();
                                        logger_1.default.error('[non-fatal] Tracing: request failed: ', error_1);
                                        return [3 /*break*/, 5];
                                    case 5:
                                        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                                            logger_1.default.error('Tracing: request aborted');
                                            return [2 /*return*/, "break"];
                                        }
                                        sleepTime = delay + Math.random() * 0.1 * delay;
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, sleepTime); })];
                                    case 6:
                                        _l.sent();
                                        delay = Math.min(delay * 2, __classPrivateFieldGet(this_1, _OpenAITracingExporter_options, "f").maxDelay);
                                        attempts++;
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _f.label = 2;
                    case 2:
                        if (!(attempts < __classPrivateFieldGet(this, _OpenAITracingExporter_options, "f").maxRetries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1()];
                    case 3:
                        state_1 = _f.sent();
                        if (state_1 === "break")
                            return [3 /*break*/, 4];
                        return [3 /*break*/, 2];
                    case 4:
                        if (attempts >= __classPrivateFieldGet(this, _OpenAITracingExporter_options, "f").maxRetries) {
                            logger_1.default.error("Tracing: failed to export traces after ".concat(__classPrivateFieldGet(this, _OpenAITracingExporter_options, "f").maxRetries, " attempts"));
                        }
                        _f.label = 5;
                    case 5:
                        _a++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return OpenAITracingExporter;
}());
exports.OpenAITracingExporter = OpenAITracingExporter;
_OpenAITracingExporter_options = new WeakMap();
/**
 * Sets the OpenAI Tracing exporter as the default exporter with a BatchTraceProcessor handling the
 * traces
 */
function setDefaultOpenAITracingExporter() {
    var exporter = new OpenAITracingExporter();
    var processor = new agents_core_1.BatchTraceProcessor(exporter);
    (0, agents_core_1.setTraceProcessors)([processor]);
}
