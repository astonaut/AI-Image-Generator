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
    <main className="flex flex-col items-center px-4 md:px-6 py-10 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          AI Image Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create stunning images with advanced AI models. Choose your model, set your preferences, and let AI bring your ideas to life.
        </p>
      </div>

      {/* Enhanced Worker Component */}
      <EnhancedWorker />
    </main>
  );
}
