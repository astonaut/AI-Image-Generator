"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function TopHero(params: {
  multiLanguage: string;
  locale: string;
}) {
  const t = useTranslations(params.multiLanguage);
  const router = useRouter();

  return (
    <section className="relative z-20 overflow-hidden px-4 pb-10 pt-10 md:pt-16">
      <div className="pointer-events-none absolute left-[8%] top-8 h-44 w-44 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[5%] top-24 h-56 w-56 rounded-full bg-blue-300/40 blur-3xl" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
            {t("top.features.fast")}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
            {t("top.title.part1")}
            <span className="text-gradient block">{t("top.title.part2")}</span>
            <span className="block">{t("top.title.part3")}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            {t("top.description")}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 rounded-2xl bg-slate-900 px-8 text-base font-bold text-white shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:bg-slate-800"
              onClick={() => router.push(`/${params.locale}/text-to-image`)}
            >
              {t("top.cta.primary")}
              <Icon icon="solar:arrow-right-line-duotone" width={20} />
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="h-14 rounded-2xl border-slate-300 bg-white/70 px-8 text-base font-bold text-slate-800"
              onClick={() => {
                const featuresSection = document.getElementById("features");
                featuresSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("top.cta.secondary")}
            </Button>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["top.features.fast", "top.features.accurate", "top.features.free"].map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm"
              >
                {t(key)}
              </div>
            ))}
          </div>
        </div>

        <div className="animate-float relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-cyan-200/50 via-blue-200/40 to-transparent blur-2xl" />
          <div className="glass relative overflow-hidden rounded-[2rem] border border-white/70 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-slate-500">Studio Preview</p>
                <p className="text-lg font-bold text-slate-900">Create in seconds</p>
              </div>
              <div className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">Live</div>
            </div>
            <img
              src="/resources/text-to-image.jpg"
              alt="AI preview"
              className="h-[320px] w-full rounded-2xl object-cover"
              loading="lazy"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <p className="text-xs uppercase tracking-wide text-slate-300">Models</p>
                <p className="mt-1 text-2xl font-bold">3+</p>
              </div>
              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">Aspect ratios</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
