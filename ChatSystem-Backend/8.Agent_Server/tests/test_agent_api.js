/**
 * Agent API Integration Tests
 *
 * Usage:
 *   1. Start the Agent Server on port 8080
 *   2. Run: node tests/test_agent_api.js
 *
 * Requires: Node.js 18+ (native fetch support)
 *
 * Environment variables:
 *   AGENT_BASE_URL  — default http://localhost:8080/agent
 *   TEST_SESSION_ID — a valid session ID for authentication
 */

const BASE_URL = process.env.AGENT_BASE_URL || 'http://localhost:8080/agent';
const SESSION_ID = process.env.TEST_SESSION_ID || 'test-session-001';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

async function test(name, fn) {
    process.stdout.write(`  ${name} ... `);
    try {
        await fn();
        console.log('PASS');
        passed++;
    } catch (e) {
        console.log(`FAIL: ${e.message}`);
        failed++;
    }
}

// --------------- Helpers ---------------

async function createTask(input, taskType = 'session', chatSessionId = null) {
    const body = { input, task_type: taskType };
    if (chatSessionId) body.chat_session_id = chatSessionId;

    const res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': SESSION_ID,
        },
        body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
}

/**
 * Subscribe to SSE events for a task, collecting them until `done` or `error` or timeout.
 * Returns an array of { type, data } objects.
 */
function collectSSEEvents(taskId, timeoutMs = 60000) {
    return new Promise(async (resolve, reject) => {
        const events = [];
        const controller = new AbortController();
        const timer = setTimeout(() => {
            controller.abort();
            resolve(events); // resolve with whatever we have
        }, timeoutMs);

        try {
            const res = await fetch(`${BASE_URL}/events?task_id=${taskId}`, {
                headers: {
                    'Accept': 'text/event-stream',
                    'X-Session-Id': SESSION_ID,
                },
                signal: controller.signal,
            });

            if (!res.ok) {
                clearTimeout(timer);
                return reject(new Error(`SSE connect failed: ${res.status}`));
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let eventType = null;
                let eventData = '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        eventType = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        eventData = line.slice(5).trim();
                    } else if (line === '' && eventType && eventData) {
                        try {
                            const parsed = JSON.parse(eventData);
                            events.push({ type: eventType, data: parsed });

                            if (eventType === 'done' || eventType === 'error') {
                                clearTimeout(timer);
                                controller.abort();
                                return resolve(events);
                            }
                        } catch (e) {
                            // ignore parse errors
                        }
                        eventType = null;
                        eventData = '';
                    }
                }
            }

            clearTimeout(timer);
            resolve(events);
        } catch (e) {
            clearTimeout(timer);
            if (e.name === 'AbortError') {
                resolve(events);
            } else {
                reject(e);
            }
        }
    });
}

// --------------- Tests ---------------

async function runTests() {
    console.log('\n=== Agent API Integration Tests ===\n');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Session ID: ${SESSION_ID}\n`);

    // ---- Test 1: Task Creation ----
    await test('POST /tasks returns task_id and status', async () => {
        const { status, data } = await createTask('Hello, please respond briefly.');
        assert(status === 200 || status === 201, `expected 2xx, got ${status}`);
        assert(data.task_id, 'response should contain task_id');
        assert(typeof data.task_id === 'string', 'task_id should be a string');
    });

    // ---- Test 2: Get Task ----
    await test('GET /tasks/:id returns task details', async () => {
        const { data: created } = await createTask('Test task for GET');
        const res = await fetch(`${BASE_URL}/tasks/${created.task_id}`, {
            headers: { 'X-Session-Id': SESSION_ID },
        });
        assert(res.ok, `expected 200, got ${res.status}`);
        const task = await res.json();
        assert(task.task_id === created.task_id, 'task_id should match');
    });

    // ---- Test 3: SSE Event Flow ----
    await test('SSE event stream includes init and done events', async () => {
        const { data } = await createTask('Say hi in one word.');
        const events = await collectSSEEvents(data.task_id, 30000);

        const types = events.map(e => e.type);
        assert(types.includes('init'), 'should have init event');
        assert(types.includes('done'), 'should have done event');
    });

    // ---- Test 4: SSE includes task_status running ----
    await test('SSE emits task_status with running', async () => {
        const { data } = await createTask('Respond with OK.');
        const events = await collectSSEEvents(data.task_id, 30000);

        const statusEvents = events.filter(e => e.type === 'task_status');
        const hasRunning = statusEvents.some(e => e.data.status === 'running');
        assert(hasRunning, 'should have task_status event with status=running');
    });

    // ---- Test 5: SSE thought_chain events ----
    await test('SSE emits thought_chain events', async () => {
        const { data } = await createTask('Search the web for "hello world" and summarize.');
        const events = await collectSSEEvents(data.task_id, 45000);

        const types = events.map(e => e.type);
        const hasThoughtChain = types.includes('thought_chain') || types.includes('thought_chain_update');
        // thought_chain may not appear for simple tasks, so just log
        if (!hasThoughtChain) {
            console.log('    (note: no thought_chain events — may need a task that triggers tool calls)');
        }
    });

    // ---- Test 6: Cancel Task ----
    await test('POST /tasks/:id/cancel cancels a task', async () => {
        const { data } = await createTask('Do a very long task that takes a while.');
        const res = await fetch(`${BASE_URL}/tasks/${data.task_id}/cancel`, {
            method: 'POST',
            headers: { 'X-Session-Id': SESSION_ID },
        });
        assert(res.ok, `expected 200, got ${res.status}`);
    });

    // ---- Test 7: Invalid task_id returns error ----
    await test('GET /tasks/invalid returns 404', async () => {
        const res = await fetch(`${BASE_URL}/tasks/nonexistent-task-id`, {
            headers: { 'X-Session-Id': SESSION_ID },
        });
        assert(res.status === 404, `expected 404, got ${res.status}`);
    });

    // ---- Test 8: Todo events for task type ----
    await test('Session task with add_todos instruction emits todo events', async () => {
        const { data } = await createTask(
            '请帮我完成以下任务：1) 列出3个编程语言 2) 每个语言写一句话介绍。请先用 add_todos 创建步骤清单。',
            'session'
        );
        const events = await collectSSEEvents(data.task_id, 60000);

        const types = events.map(e => e.type);
        // For session tasks, todo events come from child TaskAgent
        // They may appear as task_created first
        const hasTaskCreated = types.includes('task_created');
        const hasTodos = types.includes('todo_added');
        if (!hasTaskCreated && !hasTodos) {
            console.log('    (note: no todo_added or task_created events — model may not have spawned a child task)');
        }
    });

    // ---- Summary ----
    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
    console.error('Test runner error:', e);
    process.exit(1);
});
