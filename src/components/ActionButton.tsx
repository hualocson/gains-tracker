import Link from "next/link";

export function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-xl bg-black p-5 text-lg font-semibold text-white transition active:scale-95"
    >
      {label}
    </Link>
  );
}
