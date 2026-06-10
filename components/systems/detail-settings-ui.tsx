"use client";

import type { LucideIcon } from "lucide-react";

export function DetailSettingsGroup({
  children,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section>
      <div
        className={`overflow-hidden rounded-[22px] border ${
          danger
            ? "border-[#FF3B30]/18 bg-[#FF3B30]/[0.06]"
            : "border-white/[0.06] bg-white/[0.035]"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

export function DetailSettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
  valueClassName = "text-slate-400",
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick?: () => void;
  valueClassName?: string;
}) {
  const content = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-violet-100/72">
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1 text-sm font-black text-white">{label}</span>
      {value ? (
        <span className={`max-w-[48%] truncate text-right text-sm font-bold ${valueClassName}`}>
          {value}
        </span>
      ) : null}
    </>
  );

  const className =
    "flex min-h-14 w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0";

  return onClick ? (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

export function DetailSettingsAction({
  icon: Icon,
  label,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      className={`flex min-h-14 w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 disabled:cursor-not-allowed ${
        danger
          ? "border-[#FF3B30]/12 text-[#FF3B30]"
          : "border-white/[0.06] text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center ${
          danger ? "text-[#FF3B30]" : "text-violet-100/72"
        }`}
      >
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1 text-sm font-black">{label}</span>
    </button>
  );
}
