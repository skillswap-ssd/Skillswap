import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
};

export function Button({ className, variant = "primary", href, children, ...props }: Props) {
  const cls = cn(
    "focus-ring inline-flex min-h-11 items-center justify-center rounded-[14px] px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer select-none tracking-wide",
    variant === "primary" &&
      "bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--primary-dark)] hover:bg-[var(--primary-dark)] shadow-sm hover:shadow",
    variant === "secondary" &&
      "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-muted)] shadow-sm",
    variant === "ghost" &&
      "bg-transparent text-[var(--foreground)] border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-muted)]",
    className
  );

  if (href) {
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
