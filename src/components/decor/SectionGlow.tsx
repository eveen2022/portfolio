import { cn } from "@/lib/cn";

type GlowVariant = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const positionClasses: Record<GlowVariant, string> = {
  "top-left": "-top-24 -left-24",
  "top-right": "-top-24 -right-24",
  "bottom-left": "-bottom-24 -left-24",
  "bottom-right": "-bottom-24 -right-24",
};

const colorVars = [
  "var(--aurora-1)",
  "var(--aurora-2)",
  "var(--aurora-3)",
] as const;

/**
 * A single soft, slowly-drifting blurred blob for a section's own background —
 * distinct from the global .tech-bg (which is excluded from this redesign).
 * Caller's section needs `relative overflow-hidden` so this doesn't push the
 * page into horizontal scroll (it's intentionally offset past the section's
 * own edges to feel ambient rather than boxed-in).
 */
export function SectionGlow({
  variant = "top-right",
  color = 1,
  className,
}: {
  variant?: GlowVariant;
  color?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "glow-orb pointer-events-none absolute -z-10 size-72 rounded-full sm:size-96",
        positionClasses[variant],
        className,
      )}
      style={{
        background: `radial-gradient(circle, ${colorVars[color - 1]}, transparent 70%)`,
      }}
    />
  );
}
