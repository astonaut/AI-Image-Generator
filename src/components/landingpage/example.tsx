"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";

export default function UserExample(params: {
  multiLanguage: string;
  images: { img: string; video: string }[];
}) {
  const t = useTranslations(params.multiLanguage);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <div className="mb-10 text-center animate-fade-in">
        <h2 className="text-3xl font-extrabold text-slate-900 md:text-5xl">
          {t("userExample.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">{t("userExample.description")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {params.images?.map((src, index) => (
          <button
            key={index}
            onClick={() => setSelectedVideo(src.video)}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <img
              src={src.img}
              alt={t("userExample.title")}
              className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-800">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">▶</span>
              Play sample
            </div>
          </button>
        ))}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white p-4 shadow-2xl">
            <video src={selectedVideo} controls autoPlay className="w-full rounded-2xl" />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedVideo(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
