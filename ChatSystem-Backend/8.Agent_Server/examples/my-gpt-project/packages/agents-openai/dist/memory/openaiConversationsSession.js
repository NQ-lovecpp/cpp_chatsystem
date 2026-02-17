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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
var _OpenAIConversationsSession_client, _OpenAIConversationsSession_conversationId, _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIConversationsSession = void 0;
exports.startOpenAIConversationsSession = startOpenAIConversationsSession;
var openai_1 = require("openai");
var defaults_1 = require("../defaults");
var openaiResponsesModel_1 = require("../openaiResponsesModel");
var openaiSessionApi_1 = require("./openaiSessionApi");
function startOpenAIConversationsSession(client) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedClient, response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    resolvedClient = client !== null && client !== void 0 ? client : resolveClient({});
                    return [4 /*yield*/, resolvedClient.conversations.create({ items: [] })];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, response.id];
            }
        });
    });
}
var OpenAIConversationsSession = /** @class */ (function () {
    function OpenAIConversationsSession(options) {
        if (options === void 0) { options = {}; }
        // Marks this session as backed by the Conversations API so Responses-only integrations can reject it.
        this[_a] = 'conversations';
        _OpenAIConversationsSession_client.set(this, void 0);
        _OpenAIConversationsSession_conversationId.set(this, void 0);
        __classPrivateFieldSet(this, _OpenAIConversationsSession_client, resolveClient(options), "f");
        __classPrivateFieldSet(this, _OpenAIConversationsSession_conversationId, options.conversationId, "f");
    }
    Object.defineProperty(OpenAIConversationsSession.prototype, "sessionId", {
        get: function () {
            return __classPrivateFieldGet(this, _OpenAIConversationsSession_conversationId, "f");
        },
        enumerable: false,
        configurable: true
    });
    OpenAIConversationsSession.prototype.getSessionId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!__classPrivateFieldGet(this, _OpenAIConversationsSession_conversationId, "f")) return [3 /*break*/, 2];
                        _b = [this, _OpenAIConversationsSession_conversationId];
                        return [4 /*yield*/, startOpenAIConversationsSession(__classPrivateFieldGet(this, _OpenAIConversationsSession_client, "f"))];
                    case 1:
                        __classPrivateFieldSet.apply(void 0, _b.concat([_c.sent(), "f"]));
                        _c.label = 2;
                    case 2: return [2 /*return*/, __classPrivateFieldGet(this, _OpenAIConversationsSession_conversationId, "f")];
                }
            });
        });
    };
    OpenAIConversationsSession.prototype.getItems = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, toAgentItems, items, iterator_3, _b, iterator_1, iterator_1_1, item, e_1_1, itemGroups, total, iterator, _c, iterator_2, iterator_2_1, item, group, e_2_1, orderedItems, index;
            var _d, e_1, _e, _f, _g, e_2, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0: return [4 /*yield*/, this.getSessionId()];
                    case 1:
                        conversationId = _k.sent();
                        toAgentItems = function (item) {
                            var _b;
                            if (item.type === 'message' && item.role === 'user') {
                                var message = item;
                                return [
                                    {
                                        id: item.id,
                                        type: 'message',
                                        role: 'user',
                                        content: ((_b = message.content) !== null && _b !== void 0 ? _b : [])
                                            .map(function (c) {
                                            if (c.type === 'input_text') {
                                                return { type: 'input_text', text: c.text };
                                            }
                                            else if (c.type === 'input_image') {
                                                if (c.image_url) {
                                                    return { type: 'input_image', image: c.image_url };
                                                }
                                                else if (c.file_id) {
                                                    return { type: 'input_image', image: { id: c.file_id } };
                                                }
                                            }
                                            else if (c.type === 'input_file') {
                                                if (c.file_data) {
                                                    var fileItem = {
                                                        type: 'input_file',
                                                        file: c.file_data,
                                                    };
                                                    if (c.filename) {
                                                        fileItem.filename = c.filename;
                                                    }
                                                    return fileItem;
                                                }
                                                if (c.file_url) {
                                                    var fileItem = {
                                                        type: 'input_file',
                                                        file: c.file_url,
                                                    };
                                                    if (c.filename) {
                                                        fileItem.filename = c.filename;
                                                    }
                                                    return fileItem;
                                                }
                                                else if (c.file_id) {
                                                    var fileItem = {
                                                        type: 'input_file',
                                                        file: { id: c.file_id },
                                                    };
                                                    if (c.filename) {
                                                        fileItem.filename = c.filename;
                                                    }
                                                    return fileItem;
                                                }
                                            }
                                            // Add more content types here when they're added
                                            return null;
                                        })
                                            .filter(function (c) { return c !== null; }),
                                    },
                                ];
                            }
                            var outputItems = item
                                .output;
                            if (isResponseOutputItemArray(outputItems)) {
                                return (0, openaiResponsesModel_1.convertToOutputItem)(outputItems);
                            }
                            return (0, openaiResponsesModel_1.convertToOutputItem)([item]);
                        };
                        if (!(limit === undefined)) return [3 /*break*/, 14];
                        items = [];
                        iterator_3 = __classPrivateFieldGet(this, _OpenAIConversationsSession_client, "f").conversations.items.list(conversationId, {
                            order: 'asc',
                        });
                        _k.label = 2;
                    case 2:
                        _k.trys.push([2, 7, 8, 13]);
                        _b = true, iterator_1 = __asyncValues(iterator_3);
                        _k.label = 3;
                    case 3: return [4 /*yield*/, iterator_1.next()];
                    case 4:
                        if (!(iterator_1_1 = _k.sent(), _d = iterator_1_1.done, !_d)) return [3 /*break*/, 6];
                        _f = iterator_1_1.value;
                        _b = false;
                        item = _f;
                        items.push.apply(items, toAgentItems(item));
                        _k.label = 5;
                    case 5:
                        _b = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _k.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _k.trys.push([8, , 11, 12]);
                        if (!(!_b && !_d && (_e = iterator_1.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _e.call(iterator_1)];
                    case 9:
                        _k.sent();
                        _k.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [2 /*return*/, items];
                    case 14:
                        if (limit <= 0) {
                            return [2 /*return*/, []];
                        }
                        itemGroups = [];
                        total = 0;
                        iterator = __classPrivateFieldGet(this, _OpenAIConversationsSession_client, "f").conversations.items.list(conversationId, {
                            limit: limit,
                            order: 'desc',
                        });
                        _k.label = 15;
                    case 15:
                        _k.trys.push([15, 20, 21, 26]);
                        _c = true, iterator_2 = __asyncValues(iterator);
                        _k.label = 16;
                    case 16: return [4 /*yield*/, iterator_2.next()];
                    case 17:
                        if (!(iterator_2_1 = _k.sent(), _g = iterator_2_1.done, !_g)) return [3 /*break*/, 19];
                        _j = iterator_2_1.value;
                        _c = false;
                        item = _j;
                        group = toAgentItems(item);
                        if (!group.length) {
                            return [3 /*break*/, 18];
                        }
                        itemGroups.push(group);
                        total += group.length;
                        if (total >= limit) {
                            return [3 /*break*/, 19];
                        }
                        _k.label = 18;
                    case 18:
                        _c = true;
                        return [3 /*break*/, 16];
                    case 19: return [3 /*break*/, 26];
                    case 20:
                        e_2_1 = _k.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 26];
                    case 21:
                        _k.trys.push([21, , 24, 25]);
                        if (!(!_c && !_g && (_h = iterator_2.return))) return [3 /*break*/, 23];
                        return [4 /*yield*/, _h.call(iterator_2)];
                    case 22:
                        _k.sent();
                        _k.label = 23;
                    case 23: return [3 /*break*/, 25];
                    case 24:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 25: return [7 /*endfinally*/];
                    case 26:
                        orderedItems = [];
                        for (index = itemGroups.length - 1; index >= 0; index -= 1) {
                            orderedItems.push.apply(orderedItems, itemGroups[index]);
                        }
                        if (orderedItems.length > limit) {
                            orderedItems.splice(0, orderedItems.length - limit);
                        }
                        return [2 /*return*/, orderedItems];
                }
            });
        });
    };
    OpenAIConversationsSession.prototype.addItems = function (items) {
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, sanitizedItems;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!items.length) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getSessionId()];
                    case 1:
                        conversationId = _b.sent();
                        sanitizedItems = stripIdsAndProviderData(items);
                        return [4 /*yield*/, __classPrivateFieldGet(this, _OpenAIConversationsSession_client, "f").conversations.items.create(conversationId, {
                                items: (0, openaiResponsesModel_1.getInputItems)(sanitizedItems),
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenAIConversationsSession.prototype.popItem = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, latest, itemId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getSessionId()];
                    case 1:
                        conversationId = _b.sent();
                        return [4 /*yield*/, this.getItems(1)];
                    case 2:
                        latest = (_b.sent())[0];
                        if (!latest) {
                            return [2 /*return*/, undefined];
                        }
                        itemId = latest.id;
                        if (!itemId) return [3 /*break*/, 4];
                        return [4 /*yield*/, __classPrivateFieldGet(this, _OpenAIConversationsSession_client, "f").conversations.items.delete(itemId, {
                                conversation_id: conversationId,
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, latest];
                }
            });
        });
    };
    OpenAIConversationsSession.prototype.clearSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!__classPrivateFieldGet(this, _OpenAIConversationsSession_conversationId, "f")) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, __classPrivateFieldGet(this, _OpenAIConversationsSession_client, "f").conversations.delete(__classPrivateFieldGet(this, _OpenAIConversationsSession_conversationId, "f"))];
                    case 1:
                        _b.sent();
                        __classPrivateFieldSet(this, _OpenAIConversationsSession_conversationId, undefined, "f");
                        return [2 /*return*/];
                }
            });
        });
    };
    return OpenAIConversationsSession;
}());
exports.OpenAIConversationsSession = OpenAIConversationsSession;
_OpenAIConversationsSession_client = new WeakMap(), _OpenAIConversationsSession_conversationId = new WeakMap(), _a = openaiSessionApi_1.OPENAI_SESSION_API;
// --------------------------------------------------------------
//  Internals
// --------------------------------------------------------------
function stripIdsAndProviderData(items) {
    return items.map(function (item) {
        if (Array.isArray(item) || item === null || typeof item !== 'object') {
            return item;
        }
        // Conversations API rejects unknown top-level fields (e.g., model merged from providerData).
        // Only strip providerData.model from message-like items; keep IDs intact for tool linkage.
        var rest = __assign({}, item);
        var providerData = item.providerData;
        if (providerData &&
            typeof providerData === 'object' &&
            !Array.isArray(providerData)) {
            var pdObj = providerData;
            var _model = pdObj.model, pdRest = __rest(pdObj, ["model"]);
            rest.providerData =
                Object.keys(pdRest).length > 0 ? pdRest : undefined;
        }
        return rest;
    });
}
var INPUT_CONTENT_TYPES = new Set([
    'input_text',
    'input_image',
    'input_file',
    'input_audio',
]);
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
// Treats a value as ResponseOutputItem[] only when each entry resembles an output item rather than raw input content.
function isResponseOutputItemArray(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return false;
    }
    return value.every(function (entry) {
        if (!isObject(entry)) {
            return false;
        }
        var type = entry.type;
        if (typeof type !== 'string') {
            return false;
        }
        if (INPUT_CONTENT_TYPES.has(type)) {
            return false;
        }
        // Fallback: pre-emptively exclude future input_* variants so they never masquerade as response outputs.
        return !type.startsWith('input_');
    });
}
function resolveClient(options) {
    var _b, _c;
    if (options.client) {
        return options.client;
    }
    return ((_b = (0, defaults_1.getDefaultOpenAIClient)()) !== null && _b !== void 0 ? _b : new openai_1.default({
        apiKey: (_c = options.apiKey) !== null && _c !== void 0 ? _c : (0, defaults_1.getDefaultOpenAIKey)(),
        baseURL: options.baseURL,
        organization: options.organization,
        project: options.project,
    }));
}
