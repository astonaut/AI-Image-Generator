import React from "react";
import { useTranslations } from "next-intl";

export default function How(params: { multiLanguage: string; image: string }) {
  const t = useTranslations(params.multiLanguage);
  const steps = [t("how.item1"), t("how.item2"), t("how.item3")];

  return (
    <section className="z-20 w-full px-4">
      <div className="mx-auto grid w-full max-w-7xl gap-10 rounded-[2rem] border border-slate-200/70 bg-slate-900 p-6 text-white shadow-2xl md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">
            Workflow
          </span>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">{t("how.title")}</h2>
          <p className="mt-4 text-base leading-7 text-slate-300">{t("how.description")}</p>

          <ol className="mt-7 space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-900">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-slate-200 md:text-base">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10">
          <img
            src={params.image}
            alt="How it works"
            className="h-full min-h-[280px] w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
