"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { AuthActionResult } from "@/actions/actions";
import {
  getZodFieldErrors,
  registerSchema,
  type AuthFieldErrors,
  type RegisterInput,
} from "@/lib/auth/auth-schemas";

async function submitRegister(values: RegisterInput): Promise<AuthActionResult> {
  const response = await fetch("/api/auth/register", {
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
      message: "Registration failed before the auth response could be read.",
    };
  }

  return (await response.json()) as AuthActionResult;
}

function applyFieldErrors(
  fieldErrors: AuthFieldErrors | undefined,
  setError: ReturnType<typeof useForm<RegisterInput>>["setError"],
) {
  if (!fieldErrors) {
    return;
  }

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (!message) {
      return;
    }

    setError(field as keyof RegisterInput, {
      type: "server",
      message,
    });
  });
}

export function RegisterForm() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = handleSubmit((values) => {
    setServerMessage(null);
    setSuccessMessage(null);
    clearErrors();

    const parsedValues = registerSchema.safeParse(values);

    if (!parsedValues.success) {
      applyFieldErrors(getZodFieldErrors(parsedValues.error), setError);
      return;
    }

    startTransition(async () => {
      const result = await submitRegister(parsedValues.data);

      if (!result.success) {
        applyFieldErrors(result.fieldErrors, setError);
        setServerMessage(result.message ?? "Unable to create your account right now.");
        return;
      }

      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
        return;
      }

      setSuccessMessage(result.message ?? "Account created. Check your inbox for the next step.");
    });
  });

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Full name</span>
        <input type="text" placeholder="Alex Morgan" {...register("fullName")} />
        {errors.fullName ? <span className="field-error">{errors.fullName.message}</span> : null}
      </label>

      <label className="field">
        <span>Email</span>
        <input type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
      </label>

      <label className="field">
        <span>Password</span>
        <input type="password" placeholder="Create a password" {...register("password")} />
        {errors.password ? <span className="field-error">{errors.password.message}</span> : null}
      </label>

      <label className="field">
        <span>Confirm password</span>
        <input
          type="password"
          placeholder="Repeat your password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <span className="field-error">{errors.confirmPassword.message}</span>
        ) : null}
      </label>

      <label className="checkbox-row">
        <input type="checkbox" {...register("acceptTerms")} />
        <span>I agree to build this space with honesty, care, and privacy in mind.</span>
      </label>
      {errors.acceptTerms ? <span className="field-error">{errors.acceptTerms.message}</span> : null}

      {serverMessage ? <p className="form-message form-message-error">{serverMessage}</p> : null}
      {successMessage ? (
        <p className="form-message form-message-success">{successMessage}</p>
      ) : null}

      <button className="auth-primary-button" disabled={isPending || isSubmitting} type="submit">
        {isPending || isSubmitting ? "Creating Account..." : "Create Account"}
      </button>

      <p className="auth-switch">
        Already registered? <a href="/login">Log in here</a>
      </p>
    </form>
  );
}
