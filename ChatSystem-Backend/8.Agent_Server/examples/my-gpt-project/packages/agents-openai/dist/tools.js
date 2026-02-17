"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGenerationStatus = exports.CodeInterpreterStatus = exports.FileSearchStatus = exports.WebSearchStatus = void 0;
exports.webSearchTool = webSearchTool;
exports.fileSearchTool = fileSearchTool;
exports.codeInterpreterTool = codeInterpreterTool;
exports.imageGenerationTool = imageGenerationTool;
var zod_1 = require("zod");
// -----------------------------------------------------
// Status enums
// -----------------------------------------------------
exports.WebSearchStatus = zod_1.z
    .enum(['in_progress', 'completed', 'searching', 'failed'])
    .default('failed');
exports.FileSearchStatus = zod_1.z
    .enum(['in_progress', 'completed', 'searching', 'failed', 'incomplete'])
    .default('failed');
exports.CodeInterpreterStatus = zod_1.z
    .enum(['in_progress', 'completed', 'interpreting'])
    .default('in_progress');
exports.ImageGenerationStatus = zod_1.z
    .enum(['in_progress', 'completed', 'generating', 'failed'])
    .default('failed');
/**
 * Adds web search abilities to your agent
 * @param options Additional configuration for the web search like specifying the location of your agent
 * @returns a web search tool definition
 */
function webSearchTool(options) {
    var _a, _b, _c, _d;
    if (options === void 0) { options = {}; }
    var providerData = {
        type: 'web_search',
        name: (_a = options.name) !== null && _a !== void 0 ? _a : 'web_search',
        user_location: options.userLocation,
        filters: ((_b = options.filters) === null || _b === void 0 ? void 0 : _b.allowedDomains)
            ? { allowed_domains: options.filters.allowedDomains }
            : undefined,
        search_context_size: (_c = options.searchContextSize) !== null && _c !== void 0 ? _c : 'medium',
    };
    return {
        type: 'hosted_tool',
        name: (_d = options.name) !== null && _d !== void 0 ? _d : 'web_search',
        providerData: providerData,
    };
}
/**
 * Adds file search abilities to your agent
 * @param vectorStoreIds The IDs of the vector stores to search.
 * @param options Additional configuration for the file search like specifying the maximum number of results to return.
 * @returns a file search tool definition
 */
function fileSearchTool(vectorStoreIds, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var vectorIds = Array.isArray(vectorStoreIds)
        ? vectorStoreIds
        : [vectorStoreIds];
    var providerData = {
        type: 'file_search',
        name: (_a = options.name) !== null && _a !== void 0 ? _a : 'file_search',
        vector_store_ids: vectorIds,
        max_num_results: options.maxNumResults,
        include_search_results: options.includeSearchResults,
        ranking_options: options.rankingOptions,
        filters: options.filters,
    };
    return {
        type: 'hosted_tool',
        name: (_b = options.name) !== null && _b !== void 0 ? _b : 'file_search',
        providerData: providerData,
    };
}
/**
 * Adds code interpreter abilities to your agent
 * @param options Additional configuration for the code interpreter
 * @returns a code interpreter tool definition
 */
function codeInterpreterTool(options) {
    var _a, _b, _c;
    if (options === void 0) { options = {}; }
    var providerData = {
        type: 'code_interpreter',
        name: (_a = options.name) !== null && _a !== void 0 ? _a : 'code_interpreter',
        container: (_b = options.container) !== null && _b !== void 0 ? _b : { type: 'auto' },
    };
    return {
        type: 'hosted_tool',
        name: (_c = options.name) !== null && _c !== void 0 ? _c : 'code_interpreter',
        providerData: providerData,
    };
}
/**
 * Adds image generation abilities to your agent
 * @param options Additional configuration for the image generation
 * @returns an image generation tool definition
 */
function imageGenerationTool(options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var providerData = {
        type: 'image_generation',
        name: (_a = options.name) !== null && _a !== void 0 ? _a : 'image_generation',
        background: options.background,
        input_fidelity: options.inputFidelity,
        input_image_mask: options.inputImageMask,
        model: options.model,
        moderation: options.moderation,
        output_compression: options.outputCompression,
        output_format: options.outputFormat,
        partial_images: options.partialImages,
        quality: options.quality,
        size: options.size,
    };
    return {
        type: 'hosted_tool',
        name: (_b = options.name) !== null && _b !== void 0 ? _b : 'image_generation',
        providerData: providerData,
    };
}
// HostedMCPTool exists in agents-core package
