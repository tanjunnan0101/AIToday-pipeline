"use client";

import { useActionState } from "react";

import { loginAction, type LoginFormState } from "@/app/login/actions";

const initialState: LoginFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-300">{errors[0]}</p>;
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm text-slate-200">
        Email
        <input
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
          defaultValue="admin@aitoday.sg"
          name="email"
          type="email"
        />
        <FieldError errors={state.fieldErrors?.email} />
      </label>
      <label className="block text-sm text-slate-200">
        Password
        <input
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
          defaultValue="demo-password"
          name="password"
          type="password"
        />
        <FieldError errors={state.fieldErrors?.password} />
      </label>
      {state.message ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Opening workspace..." : "Enter workspace"}
      </button>
    </form>
  );
}
