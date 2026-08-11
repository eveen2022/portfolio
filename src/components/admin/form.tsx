import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full rounded-lg border border-border bg-white/70 px-3 py-2 text-sm text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none dark:bg-card/60";

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-foreground-secondary"
    >
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={cn(fieldClasses, className)} {...rest} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;
  return <textarea className={cn(fieldClasses, className)} {...rest} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return <select className={cn(fieldClasses, className)} {...rest} />;
}

export function Checkbox({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground-secondary">
      <input
        type="checkbox"
        className="size-4 rounded border-border"
        {...rest}
      />
      {label}
    </label>
  );
}

export function FormRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-1.5", className)}>{children}</div>;
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass glass-sheen relative rounded-2xl p-4 sm:p-6", className)}>
      {children}
    </div>
  );
}
