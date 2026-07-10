import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "box-border w-full px-4 sm:px-6 lg:px-10 xl:px-12",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
