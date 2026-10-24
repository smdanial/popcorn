import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  corn: "border-corn/20 bg-corn/10 text-corn",
  ember: "border-ember/20 bg-ember/10 text-ember",
  mint: "border-mint/20 bg-mint/10 text-mint",
  sky: "border-sky/20 bg-sky/10 text-sky",
  paper: "border-white/10 bg-white/[0.04] text-paper",
};

export type StatTone = keyof typeof tones;

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "paper",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: StatTone;
}) {
  return (
    <div className="card flex items-start justify-between gap-3 p-4 sm:p-5">
      <div className="min-w-0">
        <p className="eyebrow text-[10px]">{label}</p>
        <p className="mt-2 truncate text-xl font-extrabold tracking-tight text-paper sm:text-2xl">
          {value}
        </p>
        {sub && <p className="mt-1 text-[11px] text-mist">{sub}</p>}
      </div>
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
          tones[tone],
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
    </div>
  );
}
