import { NextResponse } from "next/server";
import { signInWithEmail } from "@/actions/actions";

export async function POST(request: Request) {
  const values = await request.json().catch(() => null);
  const result = await signInWithEmail(values);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
