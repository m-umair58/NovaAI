import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  subtitle?: string;
  badges?: string[];
  action?: ReactNode;
  align?: "left" | "center";
}

export function PageHeader({
  title,
  subtitle,
  badges,
  action,
  align = "center",
  className,
  ...props
}: PageHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "w-full space-y-8 text-center",
        isCentered && "mx-auto max-w-4xl",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-2 sm:gap-3",
          isCentered && "items-center text-center"
        )}
      >
        <h1 className="text-hero w-full text-center text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "text-body-lg leading-relaxed text-muted",
              isCentered && "w-full max-w-3xl text-center"
            )}
          >
            {subtitle}
          </p>
        )}
        {action && (
          <div
            className={cn(
              "flex flex-wrap gap-2 pt-1",
              isCentered && "justify-center"
            )}
          >
            {action}
          </div>
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