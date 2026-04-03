import { NextResponse } from "next/server";

export async function GET() {
  const delayMs = 900;

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  return NextResponse.json({
    ok: true,
    delayMs,
    source: "slow-endpoint",
  });
}
