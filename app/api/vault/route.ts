import { NextRequest, NextResponse } from "next/server";
import { vaultProcess } from "@/lib/server/VaultProcess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body.cmd !== "string") {
      return NextResponse.json({ ok: false, error: "Missing cmd parameter" }, { status: 400 });
    }

    const result = await vaultProcess.send(body);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
