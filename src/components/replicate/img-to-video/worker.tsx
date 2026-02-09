"use client";

import React, { useEffect, useState } from "react";
import { Button, CircularProgress } from "@nextui-org/react";
import Prediction from "@/backend/type/domain/replicate";
import { useAppContext } from "@/contexts/app";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UserSubscriptionInfo } from "@/backend/type/domain/user_subscription_info";
import DeleteButton from "@/components/button/delete-button";
import { handleApiErrors } from "@/components/replicate/common-logic/response";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import CreditInfo from "@/components/landingpage/credit-info";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Worker(props: {
  lang: string;
  credit: number;
  prompt: string;
  model: string;
  version: string;
  effect_link_name: string;
  promotion: string;
}) {
  const t = useTranslations(props.lang);
  const [prompt, setPrompt] = useState(props.prompt);
  const [generating, setGenerating] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSubscriptionInfo, setUserSubscriptionInfo] = useState<UserSubscriptionInfo | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAppContext();

  useEffect(() => {
    if (user?.uuid) fetchUserSubscriptionInfo();
  }, [user?.uuid]);

  const fetchUserSubscriptionInfo = async () => {
    if (!user?.uuid) return;
    const info = await fetch("/api/user/get_user_subscription_info", {
      method: "POST",
      body: JSON.stringify({ user_id: user.uuid }),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch user subscription info");
      return res.json();
    });
    setUserSubscriptionInfo(info);
  };

  const convertImageToFile = async (): Promise<File | null> => {
    if (!image) {
      toast.warning("Please upload a photo");
      return null;
    }
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      return new File([blob], "input.jpg", { type: "image/jpeg" });
    } catch (err) {
      console.error("Error converting image:", err);
      return null;
    }
  };

  const handleGenerate = async () => {
    let newPrediction: Prediction;

    if (
      props.credit > 0 &&
      typeof userSubscriptionInfo?.remain_count === "number" &&
      userSubscriptionInfo.remain_count < props.credit
    ) {
      toast.warning("No credit left");
      return;
    }

    if (!user) {
      toast.warning("Please login first");
      await sleep(1000);
      signIn("google");
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const imageFile = await convertImageToFile();
      if (!imageFile) {
        setGenerating(false);
        return;
      }

      if (!prompt) {
        toast.warning("Please enter a prompt");
        setGenerating(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("model", props.model);
      formData.append("user_id", user.uuid || "");
      formData.append("user_email", user.email || "");
      formData.append("effect_link_name", props.effect_link_name);
      formData.append("prompt", prompt);
      formData.append("credit", props.credit.toString());

      const response = await fetch("/api/predictions/img_to_video", {
        method: "POST",
        body: formData,
      });

      newPrediction = await response.json();
      const canContinue = await handleApiErrors({ response, newPrediction, router });
      if (!canContinue) {
        setGenerating(false);
        return;
      }
      setPrediction(newPrediction);
    } catch (err) {
      console.error("Error occurred, please try again", err);
      toast.error("An error occurred, please try again");
      setGenerating(false);
      return;
    }

    while (newPrediction.status !== "succeeded" && newPrediction.status !== "failed") {
      await sleep(5000);
      const response = await fetch("/api/predictions/" + newPrediction.id);
      newPrediction = await response.json();
      if (response.status !== 200) {
        setError(newPrediction.detail);
        return;
      }
      setPrediction(newPrediction);
    }

    const runningTime =
      (newPrediction.created_at
        ? new Date().getTime() - new Date(newPrediction.created_at).getTime()
        : -1) / 1000;

    fetch("/api/effect_result/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        original_id: newPrediction.id,
        status: newPrediction.status,
        running_time: runningTime,
        updated_at: new Date(),
        original_image_url: "",
        object_key: newPrediction.id,
      }),
    });

    await sleep(4000);
    setGenerating(false);
    fetchUserSubscriptionInfo();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto my-4 grid w-full gap-6 rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-lg md:grid-cols-2 md:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{t("input.title")}</h2>
          <CreditInfo credit={userSubscriptionInfo?.remain_count?.toString() || ""} />
        </div>

        <label className="relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100">
          {image ? (
            <div className="relative h-full w-full">
              <img src={image} alt="Uploaded" className="h-full w-full rounded-xl object-contain" />
              <DeleteButton onClick={() => setImage(null)} />
            </div>
          ) : (
            <div className="flex flex-col items-center p-4 text-slate-500">
              <span className="text-4xl">＋</span>
              <span className="mt-2 text-sm">{t("input.upload-tips")}</span>
            </div>
          )}
          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
        </label>

        <div className="mt-5">
          <textarea
            className="w-full rounded-xl border border-slate-300 p-3 text-slate-700 focus:border-cyan-500 focus:outline-none"
            placeholder={t("input.promptTips")}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          isLoading={generating}
          className="mt-4 w-full rounded-xl bg-slate-900 font-semibold text-white"
          onClick={handleGenerate}
        >
          {generating
            ? prediction
              ? prediction.status === "succeeded"
                ? "Processing..."
                : prediction.status
              : "Processing..."
            : `${t("input.createButton")} (credit: ${props.credit})`}
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {prediction ? (
          prediction.output ? (
            <div className="group relative overflow-hidden rounded-xl">
              <video src={prediction.output} className="w-full rounded-xl" controls />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/35 opacity-0 transition group-hover:opacity-100">
                <Button
                  className="bg-white text-slate-900"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = prediction.output || "";
                    link.setAttribute("download", "");
                    link.setAttribute("target", "_blank");
                    link.click();
                  }}
                >
                  {t("output.downloadButton")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              <CircularProgress color="primary" aria-label="Loading..." />
              <span className="mt-3 text-sm font-semibold text-slate-700">{prediction.status}</span>
              <span className="mt-1 text-xs text-slate-500">please wait about two to three minutes</span>
            </div>
          )
        ) : (
          <div className="hidden h-full min-h-[320px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 md:flex">
            <video src={props.promotion} className="h-full rounded-xl object-cover" loop autoPlay muted playsInline />
          </div>
        )}
      </div>
    </div>
  );
}
