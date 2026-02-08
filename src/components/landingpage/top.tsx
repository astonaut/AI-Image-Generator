"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function TopHero(params: {
  multiLanguage: string;
  locale: string;
}) {
  const t = useTranslations(params.multiLanguage);
  const router = useRouter();

  return (
    <section className="relative z-20 flex flex-col items-center justify-center py-12 md:py-20">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-white to-transparent opacity-60" />

      <div className="text-center mb-6 max-w-5xl px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-4">
          <span className="text-gray-900">{t("top.title.part1")} </span>
          <span className="text-blue-600 inline-flex items-center gap-2">
            {t("top.title.part2")}
            <span className="inline-block">✨</span>
          </span>
          <br />
          <span className="text-gray-900">{t("top.title.part3")}</span>
        </h1>
      </div>

      <p className="text-center text-lg md:text-xl text-gray-600 max-w-3xl px-4 mb-8 leading-relaxed">
        {t("top.description")}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
        <Button
          size="lg"
          color="primary"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg"
          onClick={() => router.push(`/${params.locale}/text-to-image`)}
        >
          🎨 {t("top.cta.primary")}
        </Button>
        <Button
          size="lg"
          variant="bordered"
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 text-lg"
          onClick={() => {
            const featuresSection = document.getElementById("features");
            featuresSection?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {t("top.cta.secondary")}
        </Button>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-3 justify-center items-center text-sm text-gray-600 max-w-2xl px-4">
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-full shadow-sm">
          <span>⚡</span>
          <span>{t("top.features.fast")}</span>
        </div>
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-full shadow-sm">
          <span>🎯</span>
          <span>{t("top.features.accurate")}</span>
        </div>
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-full shadow-sm">
          <span>🆓</span>
          <span>{t("top.features.free")}</span>
        </div>
      </div>
    </section>
  );
}
