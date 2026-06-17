"use server";

import { redirect } from "next/navigation";

export async function logoutAction() {
  redirect("/dashboard");
}
