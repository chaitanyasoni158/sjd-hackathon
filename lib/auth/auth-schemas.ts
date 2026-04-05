import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.email("Enter a valid email address.").trim(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "You must accept the terms to continue.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthFieldErrors = Partial<Record<string, string>>;

export function getZodFieldErrors(error: z.ZodError): AuthFieldErrors {
  const fieldErrors: AuthFieldErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  });

  return fieldErrors;
}
