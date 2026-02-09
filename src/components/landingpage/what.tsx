import React from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

export default function What(params: { multiLanguage: string; image: string }) {
  const t = useTranslations(params.multiLanguage);

  const points = [
    { title: t("what.itemTitle1"), description: t("what.itemDescription1") },
    { title: t("what.itemTitle2"), description: t("what.itemDescription2") },
    { title: t("what.itemTitle3"), description: t("what.itemDescription3") },
  ];

  return (
    <section className="z-20 w-full px-4">
      <div className="mx-auto grid w-full max-w-7xl gap-10 rounded-[2rem] border border-slate-200/70 bg-white/75 p-6 shadow-lg md:grid-cols-[0.9fr_1.1fr] md:p-10">
        <div className="overflow-hidden rounded-3xl">
          <img
            src={params.image}
            alt="Feature showcase"
            className="h-full min-h-[280px] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div>
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">
            Why it stands out
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-4xl">{t("what.title")}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{t("what.description")}</p>

          <ul className="mt-7 space-y-4">
            {points.map((point) => (
              <li key={point.title} className="rounded-2xl bg-slate-50/85 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Icon icon="solar:check-circle-line-duotone" width={16} />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">{point.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{point.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
