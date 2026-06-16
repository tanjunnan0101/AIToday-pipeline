import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <header className="mb-4 space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {body ? <p className="text-sm text-slate-600">{body}</p> : null}
      </div>
    </header>
  );
}
