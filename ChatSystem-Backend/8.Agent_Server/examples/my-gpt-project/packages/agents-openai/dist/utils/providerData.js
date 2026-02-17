"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelOrSnakeToSnakeCase = camelOrSnakeToSnakeCase;
/**
 * Converts camelCase or snake_case keys of an object to snake_case recursively.
 */
function camelOrSnakeToSnakeCase(providerData) {
    if (!providerData ||
        typeof providerData !== 'object' ||
        Array.isArray(providerData)) {
        return providerData;
    }
    var result = {};
    for (var _i = 0, _a = Object.entries(providerData); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        var snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        result[snakeKey] = camelOrSnakeToSnakeCase(value);
    }
    return result;
}
