import Link from "next/link";
import { BellDot, Search } from "lucide-react";

import { logoutAction } from "@/app/login/actions";

export function Topbar({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/70 bg-white/70 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          AIToday operating system
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Delivery control room
        </h2>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          <Search className="h-4 w-4" />
          Search client, stage, owner, document, or plan
        </div>
        <Link
          href="/notifications"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
        >
          <BellDot className="h-4 w-4" />
          2 alerts
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="font-semibold text-slate-900">{userName}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {userRole.replaceAll("_", " ")}
          </p>
        </div>
        <form action={logoutAction}>
          <button className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
