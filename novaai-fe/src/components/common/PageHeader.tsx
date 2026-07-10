import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  subtitle?: string;
  badges?: string[];
  align?: "left" | "center";
}

export function PageHeader({
  title,
  subtitle,
  badges,
  align = "center",
  className,
  ...props
}: PageHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        'w-full space-y-8',
        isCentered ? 'mx-auto max-w-4xl text-center' : 'text-left',
        className,
      )}
      {...props}
    >
      <div className="space-y-6">
        <h1
          className={cn(
            'text-hero w-full text-foreground',
            isCentered ? 'text-center' : 'text-left',
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              'text-body-lg leading-relaxed text-muted',
              isCentered && 'mx-auto max-w-3xl',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {badges && badges.length > 0 && (
        <div
          className={cn("flex flex-wrap gap-2", isCentered && "justify-center")}
        >
          {badges.map((badge) => (
            <span
              key={badge}
              className={cn(
                "inline-flex items-center rounded-[var(--radius-badge)] border border-border",
                "bg-surface-container-low px-3 py-1 text-label-sm uppercase text-muted"
              )}
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
