import { cn } from "@/lib/cn";
import { getTechIcon } from "@/lib/techIcons";
import type { SkillLevel } from "@/lib/types";

const levelBars: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function SkillPill({
  name,
  level,
  icon,
}: {
  name: string;
  level: SkillLevel;
  icon?: string;
}) {
  const filled = levelBars[level];
  const techIcon = getTechIcon(icon);

  return (
    <span
      title={level}
      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 py-1 pr-3 pl-2.5 text-xs font-medium text-foreground-secondary backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
    >
      {techIcon && <techIcon.Icon className="size-3.5 shrink-0" />}
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cn(
              "w-[3px] rounded-full transition-colors",
              bar === 1 && "h-1.5",
              bar === 2 && "h-2.5",
              bar === 3 && "h-3.5",
              bar <= filled ? "bg-accent" : "bg-border",
            )}
          />
        ))}
      </span>
      {name}
    </span>
  );
}
