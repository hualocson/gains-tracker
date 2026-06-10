import Link from "next/link";

import { cn } from "@/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";

// Sticker-palette accents (DESIGN.md): decorative only — they tint the icon chip,
// never the surface. Static class pairs so Tailwind can see them at build time.
const ACCENTS = {
  sky: { chip: "bg-chart-1/12", icon: "text-chart-1" },
  green: { chip: "bg-chart-2/12", icon: "text-chart-2" },
  purple: { chip: "bg-chart-4/12", icon: "text-chart-4" },
} as const;

export function QuickAction({
  href,
  label,
  hint,
  icon: Icon,
  accent,
}: {
  href: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  accent: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  return (
    <Link
      href={href}
      className="group bg-card hover:bg-accent focus-visible:ring-ring/50 flex items-center gap-3.5 rounded-xl border p-3 transition-colors outline-none focus-visible:ring-[3px]"
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg",
          a.chip
        )}
      >
        <Icon className={cn("size-5", a.icon)} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-tight font-semibold">{label}</span>
        {hint && (
          <span className="text-muted-foreground block text-sm leading-tight">
            {hint}
          </span>
        )}
      </span>
      <ChevronRight
        className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-colors"
        aria-hidden="true"
      />
    </Link>
  );
}
