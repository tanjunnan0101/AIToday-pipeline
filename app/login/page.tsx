import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#082f49,#0f172a_55%,#7c2d12)] px-5 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">
            AIToday
          </p>
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight">
            Client delivery, roadmap execution, and handover in one place.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Signed demo sessions are now active for the internal workspace. Supabase Auth can replace this layer cleanly once credentials are available.
          </p>
        </section>
        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur">
          <div className="space-y-4">
            <LoginForm />
            <Link
              href="/portal"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Open client portal
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
