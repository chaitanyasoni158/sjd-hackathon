"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { AuthActionResult } from "@/actions/actions";
import {
  getZodFieldErrors,
  loginSchema,
  type AuthFieldErrors,
  type LoginInput,
} from "@/lib/auth/auth-schemas";

async function submitLogin(values: LoginInput): Promise<AuthActionResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {
      success: false,
      message: "Login failed before the auth response could be read.",
    };
  }

  return (await response.json()) as AuthActionResult;
}

function applyFieldErrors(
  fieldErrors: AuthFieldErrors | undefined,
  setError: ReturnType<typeof useForm<LoginInput>>["setError"],
) {
  if (!fieldErrors) {
    return;
  }

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (!message) {
      return;
    }

    setError(field as keyof LoginInput, {
      type: "server",
      message,
    });
  });
}

export function LoginForm() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setServerMessage(null);
    clearErrors();

    const parsedValues = loginSchema.safeParse(values);

    if (!parsedValues.success) {
      applyFieldErrors(getZodFieldErrors(parsedValues.error), setError);
      return;
    }

    startTransition(async () => {
      const result = await submitLogin(parsedValues.data);

      if (!result.success) {
        applyFieldErrors(result.fieldErrors, setError);
        setServerMessage(result.message ?? "Unable to sign in right now.");
        return;
      }

      router.push(result.redirectTo ?? "/dashboard");
      router.refresh();
    });
  });

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Email</span>
        <input type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
      </label>

      <label className="field">
        <span>Password</span>
        <input type="password" placeholder="Enter your password" {...register("password")} />
        {errors.password ? <span className="field-error">{errors.password.message}</span> : null}
      </label>

      <div className="form-meta">
        <label className="checkbox-row">
          <input type="checkbox" />
          <span>Keep me signed in</span>
        </label>
        <a href="/register">Need an account?</a>
      </div>

      {serverMessage ? <p className="form-message form-message-error">{serverMessage}</p> : null}

      <button className="auth-primary-button" disabled={isPending || isSubmitting} type="submit">
        {isPending || isSubmitting ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
