function resolveTextStream(source) {
    if (typeof source.toTextStream === 'function') {
        return source.toTextStream();
    }
    return source;
}
function encodeTextStream(textStream) {
    if (typeof TextEncoderStream !== 'undefined') {
        return textStream.pipeThrough(new TextEncoderStream());
    }
    const encoder = new TextEncoder();
    return textStream.pipeThrough(new TransformStream({
        transform(chunk, controller) {
            controller.enqueue(encoder.encode(chunk));
        },
    }));
}
function withDefaultHeaders(headers) {
    const result = new Headers(headers);
    if (!result.has('content-type')) {
        result.set('content-type', 'text/plain; charset=utf-8');
    }
    if (!result.has('cache-control')) {
        result.set('cache-control', 'no-cache');
    }
    return result;
}
/**
 * Creates a text-only streaming Response compatible with AI SDK UI text streams.
 */
export function createAiSdkTextStreamResponse(source, options = {}) {
    const textStream = resolveTextStream(source);
    const body = encodeTextStream(textStream);
    const headers = withDefaultHeaders(options.headers);
    return new Response(body, {
        status: options.status ?? 200,
        statusText: options.statusText,
        headers,
    });
}
//# sourceMappingURL=textStream.mjs.map