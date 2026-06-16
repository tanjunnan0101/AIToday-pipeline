"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { authenticateDemoUser } from "@/lib/auth";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await authenticateDemoUser(parsed.data.email, parsed.data.password);
  if (!user) {
    return {
      message: "That demo account combination did not match.",
    };
  }

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
