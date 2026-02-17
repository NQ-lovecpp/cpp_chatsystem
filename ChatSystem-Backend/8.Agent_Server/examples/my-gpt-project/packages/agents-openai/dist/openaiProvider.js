"use strict";
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
var _OpenAIProvider_instances, _OpenAIProvider_client, _OpenAIProvider_useResponses, _OpenAIProvider_options, _OpenAIProvider_getClient;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
var agents_core_1 = require("@openai/agents-core");
var openai_1 = require("openai");
var defaults_1 = require("./defaults");
var openaiResponsesModel_1 = require("./openaiResponsesModel");
var openaiChatCompletionsModel_1 = require("./openaiChatCompletionsModel");
/**
 * The provider of OpenAI's models (or Chat Completions compatible ones)
 */
var OpenAIProvider = /** @class */ (function () {
    function OpenAIProvider(options) {
        if (options === void 0) { options = {}; }
        _OpenAIProvider_instances.add(this);
        _OpenAIProvider_client.set(this, void 0);
        _OpenAIProvider_useResponses.set(this, void 0);
        _OpenAIProvider_options.set(this, void 0);
        __classPrivateFieldSet(this, _OpenAIProvider_options, options, "f");
        if (__classPrivateFieldGet(this, _OpenAIProvider_options, "f").openAIClient) {
            if (__classPrivateFieldGet(this, _OpenAIProvider_options, "f").apiKey) {
                throw new Error('Cannot provide both apiKey and openAIClient');
            }
            if (__classPrivateFieldGet(this, _OpenAIProvider_options, "f").baseURL) {
                throw new Error('Cannot provide both baseURL and openAIClient');
            }
            __classPrivateFieldSet(this, _OpenAIProvider_client, __classPrivateFieldGet(this, _OpenAIProvider_options, "f").openAIClient, "f");
        }
        __classPrivateFieldSet(this, _OpenAIProvider_useResponses, __classPrivateFieldGet(this, _OpenAIProvider_options, "f").useResponses, "f");
    }
    OpenAIProvider.prototype.getModel = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var model, useResponses;
            var _a;
            return __generator(this, function (_b) {
                model = modelName || (0, agents_core_1.getDefaultModel)();
                useResponses = (_a = __classPrivateFieldGet(this, _OpenAIProvider_useResponses, "f")) !== null && _a !== void 0 ? _a : (0, defaults_1.shouldUseResponsesByDefault)();
                if (useResponses) {
                    return [2 /*return*/, new openaiResponsesModel_1.OpenAIResponsesModel(__classPrivateFieldGet(this, _OpenAIProvider_instances, "m", _OpenAIProvider_getClient).call(this), model)];
                }
                return [2 /*return*/, new openaiChatCompletionsModel_1.OpenAIChatCompletionsModel(__classPrivateFieldGet(this, _OpenAIProvider_instances, "m", _OpenAIProvider_getClient).call(this), model)];
            });
        });
    };
    return OpenAIProvider;
}());
exports.OpenAIProvider = OpenAIProvider;
_OpenAIProvider_client = new WeakMap(), _OpenAIProvider_useResponses = new WeakMap(), _OpenAIProvider_options = new WeakMap(), _OpenAIProvider_instances = new WeakSet(), _OpenAIProvider_getClient = function _OpenAIProvider_getClient() {
    var _a, _b;
    // If the constructor does not accept the OpenAI client,
    if (!__classPrivateFieldGet(this, _OpenAIProvider_client, "f")) {
        __classPrivateFieldSet(this, _OpenAIProvider_client, 
        // this provider checks if there is the default client first,
        (_a = (0, defaults_1.getDefaultOpenAIClient)()) !== null && _a !== void 0 ? _a : 
        // and then manually creates a new one.
        new openai_1.default({
            apiKey: (_b = __classPrivateFieldGet(this, _OpenAIProvider_options, "f").apiKey) !== null && _b !== void 0 ? _b : (0, defaults_1.getDefaultOpenAIKey)(),
            baseURL: __classPrivateFieldGet(this, _OpenAIProvider_options, "f").baseURL,
            organization: __classPrivateFieldGet(this, _OpenAIProvider_options, "f").organization,
            project: __classPrivateFieldGet(this, _OpenAIProvider_options, "f").project,
        }), "f");
    }
    return __classPrivateFieldGet(this, _OpenAIProvider_client, "f");
};
