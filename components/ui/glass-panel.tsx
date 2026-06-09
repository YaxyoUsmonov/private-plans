import type { ComponentPropsWithoutRef } from "react";

type GlassPanelProps = ComponentPropsWithoutRef<"section"> & {
  compact?: boolean;
};

export function GlassPanel({
  children,
  className = "",
  compact = false,
  ...props
}: GlassPanelProps) {
  return (
    <section
      className={`rounded-[28px] border border-violet-200/10 bg-white/[0.045] ${compact ? "p-3" : "p-4"} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
