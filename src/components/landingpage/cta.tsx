"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

export default function CreateButton(params: { multiLanguage: string }) {
  const tCreateButton = useTranslations(params.multiLanguage);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-12 text-center text-white shadow-2xl md:px-12 md:py-16">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-400/30 blur-2xl" />
        <div className="pointer-events-none absolute -right-8 bottom-2 h-48 w-48 rounded-full bg-blue-400/30 blur-2xl" />

        <h2 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
          {tCreateButton("cta.title")}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
          {tCreateButton("cta.description")}
        </p>
        <button
          onClick={scrollToTop}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-slate-900 transition hover:-translate-y-1"
        >
          {tCreateButton("cta.cta")}
          <Icon icon="solar:arrow-right-line-duotone" width={18} />
        </button>
      </div>
    </section>
  );
}
