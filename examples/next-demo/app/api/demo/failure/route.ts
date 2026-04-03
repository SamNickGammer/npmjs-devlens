import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json(
    {
      ok: false,
      code: "DEMO_FAILURE",
      received: body,
    },
    {
      status: 418,
      headers: {
        "X-Demo-State": "failing",
      },
    },
  );
}
