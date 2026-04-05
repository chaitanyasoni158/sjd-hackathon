import { NextResponse } from "next/server";
import { signUpNewUser } from "@/actions/actions";

export async function POST(request: Request) {
  const values = await request.json().catch(() => null);
  const result = await signUpNewUser(values);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
