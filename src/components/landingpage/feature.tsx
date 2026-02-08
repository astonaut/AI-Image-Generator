"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

export default function FeatureHero( params: { multiLanguage: string }) {
  const t = useTranslations(params.multiLanguage);
  const features = [
    {
      icon: "solar:camera-line-duotone",
      title: t('Features.feature1.title'),
      description: t('Features.feature1.description')
    },
    {
      icon: "solar:bolt-line-duotone",
      title: t('Features.feature2.title'),
      description: t('Features.feature2.description')
    },
    {
      icon: "solar:text-field-line-duotone",
      title: t('Features.feature3.title'),
      description: t('Features.feature3.description')
    },
    {
      icon: "solar:layers-line-duotone",
      title: t('Features.feature4.title'),
      description: t('Features.feature4.description')
    },
    {
      icon: "solar:gallery-wide-line-duotone",
      title: t('Features.feature5.title'),
      description: t('Features.feature5.description')
    },
    {
      icon: "solar:chip-line-duotone",
      title: t('Features.feature6.title'),
      description: t('Features.feature6.description')
    }
  ];

  return (
    <section className="z-20 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-16 rounded-3xl">
      <div className="flex flex-col items-center w-full max-w-7xl px-4 gap-12">
        <div className="text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
            {t('Features.heading')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('Features.subheading')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon icon={feature.icon} width={28} height={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
