import React from "react";
import EnhancedWorker from "@/components/replicate/text-to-image/enhanced-worker";
import { getMetadata } from "@/components/seo/seo";

export async function generateMetadata({
  params,
}: {
  params: { locale?: string };
}) {
  return await getMetadata(
    params?.locale || "",
    "TextToImage.seo",
    "text-to-image"
  );
}

export default function TextToImage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <main className="mx-auto flex max-w-[1400px] flex-col items-center px-4 py-10 md:px-6">
      <div className="mb-10 text-center">
        <span className="inline-flex rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
          Studio Workspace
        </span>
        <h1 className="mt-5 text-4xl font-extrabold text-slate-900 md:text-6xl">
          AI Image Generator
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
          Create production-quality visuals with model controls, ratio presets, and curated prompts in a single workflow.
        </p>
      </div>

      <EnhancedWorker />
    </main>
  );
}
