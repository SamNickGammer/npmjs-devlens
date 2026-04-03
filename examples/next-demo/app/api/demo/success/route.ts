import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = url.searchParams.get("user") ?? "guest";

  return NextResponse.json({
    ok: true,
    message: `hello-${user}`,
    time: new Date().toISOString(),
  });
}
