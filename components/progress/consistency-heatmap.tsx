import type { CompletionLog } from "@/lib/mock-data";

const intensity = [
  "bg-white/[0.035]",
  "bg-violet-400/14",
  "bg-[#25EB2F]/18",
  "bg-[#25EB2F]/34",
];

export function ConsistencyHeatmap({ logs }: { logs: CompletionLog[] }) {
  const recentLogs = logs.slice(-35);
  const cells = Array.from({ length: 35 }, (_, index) => {
    const log = recentLogs[index];
    if (!log) return 0;
    if (log.status === "completed") return 3;
    if (log.status === "missed") return 1;
    return 2;
  });

  return (
    <section className="rounded-[28px] border border-violet-200/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.055)]">
      <div className="mb-3">
        <h2 className="text-base font-black text-white">Barqarorlik xaritasi</h2>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">Oxirgi 30 kunlik faollik</p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className={`aspect-square rounded-[7px] border border-white/[0.035] ${intensity[value]}`}
          />
        ))}
      </div>
    </section>
  );
}
