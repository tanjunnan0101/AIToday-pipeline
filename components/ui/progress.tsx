import { cn, formatPercent } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Progress</span>
        <span>{formatPercent(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#0f766e,#fb923c)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
