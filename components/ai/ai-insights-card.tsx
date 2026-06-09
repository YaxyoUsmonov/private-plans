import { Brain, Sparkles } from "lucide-react";
import { PanelEmptyState, PanelLoadingState } from "@/components/ui/detail-panel";

type AiInsightState = "empty" | "ready" | "loading";

type AiInsightsCardProps = {
  state?: AiInsightState;
};

const stateContent = {
  empty: {
    label: "Ma’lumot kerak",
    text: "Hali tahlil uchun yetarli ma’lumot yo‘q",
    button: "Keyinroq tekshirish",
  },
  ready: {
    label: "AI tahlil mavjud emas",
    text: "Hali AI tahlil qilinmagan",
    button: "Tahlilni ko‘rish",
  },
  loading: {
    label: "Tahlil jarayoni",
    text: "AI tahlil qilmoqda...",
    button: "Kuting",
  },
};

export function AiInsightsCard({ state = "empty" }: AiInsightsCardProps) {
  const content = stateContent[state];
  const isLoading = state === "loading";
  const isEmpty = state === "empty";
  const smartInsights: Array<[string, string]> = [];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-violet-200/14 bg-white/[0.035] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200/16 bg-violet-400/12 text-violet-100">
          <Brain size={21} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white">AI murabbiy</h2>
            <Sparkles size={15} className="text-violet-200" />
          </div>
          <p className="mt-0.5 text-xs font-semibold text-violet-100/70">Haftalik o‘sish tahlilingiz</p>

          {isLoading ? (
            <div className="mt-4">
              <PanelLoadingState title="AI tahlil qilmoqda..." rows={2} />
            </div>
          ) : isEmpty ? (
            <div className="mt-4">
              <PanelEmptyState title="Hali tahlil yo‘q" description={content.text} icon={Sparkles} compact />
            </div>
          ) : (
            <div className="mt-4 rounded-[22px] border border-violet-200/10 bg-black/10 p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-violet-100/75">{content.label}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-200">{content.text}</p>
            </div>
          )}

          {!isLoading && !isEmpty ? (
            <div className="mt-3 grid gap-2">
              {smartInsights.map(([label, text]) => (
                <div key={label} className="rounded-[18px] border border-violet-200/10 bg-white/[0.035] px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-100/55">{label}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            className="plans-focus-button mt-3 min-h-10 rounded-full border px-4 text-sm font-black text-violet-50 transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {content.button}
          </button>
        </div>
      </div>
    </section>
  );
}
