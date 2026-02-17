"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEADERS = exports.DEFAULT_OPENAI_MODEL = exports.DEFAULT_OPENAI_API = void 0;
exports.setTracingExportApiKey = setTracingExportApiKey;
exports.getTracingExportApiKey = getTracingExportApiKey;
exports.shouldUseResponsesByDefault = shouldUseResponsesByDefault;
exports.setOpenAIAPI = setOpenAIAPI;
exports.setDefaultOpenAIClient = setDefaultOpenAIClient;
exports.getDefaultOpenAIClient = getDefaultOpenAIClient;
exports.setDefaultOpenAIKey = setDefaultOpenAIKey;
exports.getDefaultOpenAIKey = getDefaultOpenAIKey;
var _shims_1 = require("@openai/agents-core/_shims");
var metadata_1 = require("./metadata");
exports.DEFAULT_OPENAI_API = 'responses';
exports.DEFAULT_OPENAI_MODEL = 'gpt-4.1';
var _defaultOpenAIAPI = exports.DEFAULT_OPENAI_API;
var _defaultOpenAIClient;
var _defaultOpenAIKey = undefined;
var _defaultTracingApiKey = undefined;
function setTracingExportApiKey(key) {
    _defaultTracingApiKey = key;
}
function getTracingExportApiKey() {
    return _defaultTracingApiKey !== null && _defaultTracingApiKey !== void 0 ? _defaultTracingApiKey : (0, _shims_1.loadEnv)().OPENAI_API_KEY;
}
function shouldUseResponsesByDefault() {
    return _defaultOpenAIAPI === 'responses';
}
function setOpenAIAPI(value) {
    _defaultOpenAIAPI = value;
}
function setDefaultOpenAIClient(client) {
    _defaultOpenAIClient = client;
}
function getDefaultOpenAIClient() {
    return _defaultOpenAIClient;
}
function setDefaultOpenAIKey(key) {
    _defaultOpenAIKey = key;
}
function getDefaultOpenAIKey() {
    return _defaultOpenAIKey !== null && _defaultOpenAIKey !== void 0 ? _defaultOpenAIKey : (0, _shims_1.loadEnv)().OPENAI_API_KEY;
}
exports.HEADERS = {
    'User-Agent': "Agents/JavaScript ".concat(metadata_1.default.version),
};
