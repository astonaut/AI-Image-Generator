"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

export default function FeatureHero(params: { multiLanguage: string }) {
  const t = useTranslations(params.multiLanguage);
  const features = [
    {
      icon: "solar:camera-line-duotone",
      title: t("Features.feature1.title"),
      description: t("Features.feature1.description"),
    },
    {
      icon: "solar:bolt-line-duotone",
      title: t("Features.feature2.title"),
      description: t("Features.feature2.description"),
    },
    {
      icon: "solar:text-field-line-duotone",
      title: t("Features.feature3.title"),
      description: t("Features.feature3.description"),
    },
    {
      icon: "solar:layers-line-duotone",
      title: t("Features.feature4.title"),
      description: t("Features.feature4.description"),
    },
    {
      icon: "solar:gallery-wide-line-duotone",
      title: t("Features.feature5.title"),
      description: t("Features.feature5.description"),
    },
    {
      icon: "solar:chip-line-duotone",
      title: t("Features.feature6.title"),
      description: t("Features.feature6.description"),
    },
  ];

  return (
    <section className="relative z-20 py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
            <Icon icon="solar:star-line-duotone" width={16} />
            Product Highlights
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-slate-900 md:text-5xl">
            {t("Features.heading")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            {t("Features.subheading")}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="card-hover rounded-3xl border border-slate-200/80 bg-white/80 p-7 shadow-sm backdrop-blur-xl"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700">
                <Icon icon={feature.icon} width={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
