import React from "react";
import { Link } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { getDomain } from "@/config/domain";

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations("Footer");
  const domain = getDomain();

  const legalLinks = [
    { name: t("legal.item.item1"), href: "/legal/privacy-policy" },
    { name: t("legal.item.item2"), href: "/legal/terms-of-service" },
  ];

  return (
    <footer className="relative mt-20 border-t border-slate-200/80 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200">
              <img src="/logo.jpeg" alt="AI Image Studio" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-slate-900">AI Image Studio</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">minimalist generator</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">{t("description")}</p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("recommend.title")}</p>
          <div className="mt-4 space-y-2">
            <Link className="text-slate-700" href={`${domain}/${locale}`}>
              {t("recommend.item.item1")}
            </Link>
            <Link className="text-slate-700" href={`${domain}`}>
              English
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("legal.title")}</p>
          <div className="mt-4 space-y-2">
            {legalLinks.map((item) => (
              <Link key={item.name} className="text-slate-700" href={item.href}>
                {item.name}
              </Link>
            ))}
            <a
              href={`mailto:support@${domain.replace("https://", "")}`}
              className="flex items-center gap-2 text-slate-700"
            >
              <Icon icon="mdi:email-outline" width={18} />
              support@{domain.replace("https://", "")}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/80 py-5 text-center text-xs text-slate-500">
        © 2026 AI Image Studio. All rights reserved.
      </div>
    </footer>
  );
}
