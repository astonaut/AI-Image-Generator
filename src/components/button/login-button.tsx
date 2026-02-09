"use client";

import { Button } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function () {
  const t = useTranslations("Nav");
  return (
    <Button
      className="rounded-full bg-slate-900 px-5 font-semibold capitalize text-white shadow-md transition hover:bg-slate-800"
      onClick={() => signIn("google")}
    >
      {t("login")}
    </Button>
  );
}
