import Link from "next/link";
import { BarChart3, Bell, Briefcase, CalendarRange, ClipboardList, FileStack, FolderKanban, LayoutDashboard, Settings, ShieldCheck, Timer, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/gantt", label: "Gantt", icon: CalendarRange },
  { href: "/kanban", label: "Kanban", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/documents", label: "Documents", icon: FileStack },
  { href: "/implementation-plans", label: "Plans", icon: Briefcase },
  { href: "/time-logs", label: "Time", icon: Timer },
  { href: "/workload", label: "Workload", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/handover", label: "Handover", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/40 bg-[#06263a] px-5 py-6 text-slate-100 lg:flex lg:flex-col">
      <div className="mb-8 rounded-3xl bg-white/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
          AIToday
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Client Delivery Pipeline
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Closing, development, implementation zoom, and handover in one operating layer.
        </p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-white text-slate-950 shadow-lg"
                  : "text-slate-200 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
        <p className="font-semibold text-white">Production groundwork active</p>
        <p className="mt-2 leading-6">
          Demo-backed screens are live now while Prisma, Supabase, and API surfaces are being wired in.
        </p>
      </div>
    </aside>
  );
}
