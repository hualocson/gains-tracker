import Link from "next/link";

import { ChevronLeft } from "lucide-react";

// Shared sub-page header: a quiet back affordance, an optional uppercase eyebrow,
// and the page title set in DESIGN.md's tight, heavy display voice.
export function PageHeader({
  title,
  eyebrow,
  backHref = "/",
}: {
  title: string;
  eyebrow?: string;
  backHref?: string;
}) {
  return (
    <header className="space-y-3">
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-foreground -ml-1 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back
      </Link>
      <div className="space-y-1">
        {eyebrow && <p className="eyebrow text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-[28px] leading-none font-bold tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
