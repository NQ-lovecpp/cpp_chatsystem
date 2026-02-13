import { getAgent } from '@/agents';

/**
 * 预热 Agent 与 MCP 连接，避免首条消息时出现
 * "Received request before initialization was complete" 竞态。
 */
export async function GET() {
  try {
    await getAgent();
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[Agent init]', error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
