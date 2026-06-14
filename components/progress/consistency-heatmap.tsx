import type { CompletionLog } from "@/lib/mock-data";
import { toDateKey } from "@/lib/date-utils";

const intensity = [
  "bg-white/[0.035]",
  "bg-violet-400/14",
  "bg-[#25EB2F]/18",
  "bg-[#25EB2F]/34",
];

export function ConsistencyHeatmap({
  logs,
  selectedDate,
  onSelectDate,
}: {
  logs: CompletionLog[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}) {
  const logsByDate = new Map<string, CompletionLog[]>();
  logs.forEach((log) => {
    const current = logsByDate.get(log.date) ?? [];
    current.push(log);
    logsByDate.set(log.date, current);
  });
  const today = new Date();
  const cells = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (34 - index));
    const dateKey = toDateKey(date);
    const dayLogs = logsByDate.get(dateKey) ?? [];
    const value = dayLogs.some((log) => log.status === "completed")
      ? 3
      : dayLogs.some((log) => log.status === "planned")
        ? 2
        : dayLogs.some((log) => log.status === "missed")
          ? 1
          : 0;

    return { dateKey, value };
  });

  return (
    <section className="rounded-[28px] border border-violet-200/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.055)]">
      <div className="mb-3">
        <h2 className="text-base font-black text-white">Barqarorlik xaritasi</h2>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">Oxirgi 30 kunlik faollik</p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map(({ dateKey, value }) => (
          <button
            key={dateKey}
            type="button"
            aria-label={`${dateKey} faolligi`}
            onClick={() => onSelectDate?.(dateKey)}
            className={`aspect-square rounded-[7px] border transition active:scale-90 ${
              selectedDate === dateKey
                ? "border-[#7F00FF]"
                : "border-white/[0.035]"
            } ${intensity[value]}`}
          />
        ))}
      </div>
    </section>
  );
}
