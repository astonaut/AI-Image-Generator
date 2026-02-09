import React from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

export default function Faq(params: { multiLanguage: string; grid: boolean }) {
  const t = useTranslations(params.multiLanguage);

  const faqs = [
    { title: t("FAQ.Q1"), content: t("FAQ.A1") },
    { title: t("FAQ.Q2"), content: t("FAQ.A2") },
    { title: t("FAQ.Q3"), content: t("FAQ.A3") },
    { title: t("FAQ.Q4"), content: t("FAQ.A4") },
    { title: t("FAQ.Q5"), content: t("FAQ.A5") },
    { title: t("FAQ.Q6"), content: t("FAQ.A6") },
  ];

  const firstHalf = faqs.slice(0, Math.ceil(faqs.length / 2));
  const secondHalf = faqs.slice(Math.ceil(faqs.length / 2));

  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 md:text-5xl">{t("FAQ.title")}</h2>
      </div>

      <div className={`grid grid-cols-1 gap-5 ${params.grid ? "lg:grid-cols-2" : ""}`}>
        {[firstHalf, secondHalf].map((column, columnIndex) => (
          <div key={columnIndex}>
            {column.map((item) => (
              <details
                key={item.title}
                className="group mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-5 text-left">
                  <h3 className="pr-4 text-base font-bold text-slate-900">{item.title}</h3>
                  <Icon
                    icon="solar:alt-arrow-down-linear"
                    width={20}
                    className="text-slate-500 transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>
                <div className="px-5 pb-5 text-sm leading-7 text-slate-600">{item.content}</div>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
