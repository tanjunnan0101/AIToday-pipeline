"use client";

import Link from "next/link";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-200">
        Authentication is disabled in this local build. Open the workspace directly.
      </p>
      <Link
        href={nextPath}
        className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
      >
        Enter workspace
      </Link>
    </div>
  );
}
