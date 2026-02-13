import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionId, getTokenSet } from "@/lib/session";

export async function GET() {
  const sessionId = await getSessionId();
  const tokenSet = getTokenSet(sessionId);
  const jar = await cookies();
  const accessToken = jar.get("gc_access_token")?.value;
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env as Record<
    string,
    string | undefined
  >;
  const oauthConfigured = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
  return NextResponse.json({
    connected: Boolean(tokenSet || accessToken),
    oauthConfigured,
  });
}
