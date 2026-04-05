import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  getZodFieldErrors,
  loginSchema,
  registerSchema,
  type AuthFieldErrors,
} from "@/lib/auth/auth-schemas";

export type AuthActionResult = {
  success: boolean;
  message?: string;
  redirectTo?: string;
  fieldErrors?: AuthFieldErrors;
};

export async function signUpNewUser(values: unknown): Promise<AuthActionResult> {
  const parsedValues = registerSchema.safeParse(values);

  if (!parsedValues.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: getZodFieldErrors(parsedValues.error),
    };
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const supabase = await createClient();
  const { email, password, fullName } = parsedValues.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Account created. Check your email to confirm your address.",
    redirectTo: "/login",
  };
}

export async function signInWithEmail(values: unknown): Promise<AuthActionResult> {
  const parsedValues = loginSchema.safeParse(values);

  if (!parsedValues.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: getZodFieldErrors(parsedValues.error),
    };
  }

  const supabase = await createClient();
  const { email, password } = parsedValues.data;
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    redirectTo: "/dashboard",
  };
}
