import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Use "h1" when this is a standalone page's primary heading, "h2" for a subsection. */
  as?: "h1" | "h2";
}) {
  const HeadingTag = as;
  const isPage = as === "h1";

  return (
    <div className={isPage ? "mb-12" : "mb-10"}>
      {eyebrow && (
        <p className="mb-2 font-mono text-sm font-medium text-accent">
          <span className="opacity-60">{"// "}</span>
          {eyebrow}
        </p>
      )}
      <div className={cn("flex items-center", isPage ? "gap-4" : "gap-3")}>
        {Icon && (
          <span
            className={cn(
              "glass relative flex shrink-0 items-center justify-center rounded-2xl text-accent",
              isPage ? "size-12" : "size-10",
            )}
          >
            <Icon className={isPage ? "size-6" : "size-5"} />
          </span>
        )}
        <HeadingTag
          className={cn(
            "font-bold tracking-tight text-foreground",
            isPage ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
          )}
        >
          {title}
        </HeadingTag>
      </div>
      {description && (
        <p
          className={cn(
            "mt-3 max-w-2xl text-foreground-secondary",
            isPage && "text-lg",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
