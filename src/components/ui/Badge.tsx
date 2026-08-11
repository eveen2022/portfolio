import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-black/10 bg-white/50 px-3 py-1 text-xs font-medium text-foreground-secondary backdrop-blur-sm dark:border-white/10 dark:bg-white/5",
        className,
      )}
    >
      {children}
    </span>
  );
}
