"use client";

import React, { useState, useEffect } from "react";
import { Button, Textarea, Select, SelectItem, Input, cn } from "@nextui-org/react";
import Prediction from "@/backend/type/domain/replicate";
import { useAppContext } from "@/contexts/app";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { handleApiErrors } from "@/components/replicate/common-logic/response";
import Output from "@/components/replicate/text-to-image/img-output";
import { UserSubscriptionInfo } from "@/backend/type/domain/user_subscription_info";
import CreditInfo from "@/components/landingpage/credit-info";
import { Icon } from "@iconify/react";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ASPECT_RATIOS = [
  { key: "1:1", label: "1:1", width: 1024, height: 1024 },
  { key: "16:9", label: "16:9", width: 1024, height: 576 },
  { key: "3:2", label: "3:2", width: 1024, height: 683 },
  { key: "2:3", label: "2:3", width: 683, height: 1024 },
  { key: "3:4", label: "3:4", width: 768, height: 1024 },
  { key: "4:3", label: "4:3", width: 1024, height: 768 },
  { key: "9:16", label: "9:16", width: 576, height: 1024 },
];

const AI_MODELS = [
  { key: "flux-schnell", label: "Flux Schnell", model: "black-forest-labs/flux-schnell", version: null, credit: 1 },
  { key: "flux-dev", label: "Flux Dev", model: "black-forest-labs/flux-dev", version: null, credit: 2 },
  { key: "sdxl", label: "SDXL", model: "stability-ai/sdxl", version: null, credit: 1 },
];

const PROMPT_CATEGORIES = [
  { key: "hot", label: "Hot" },
  { key: "portrait", label: "Portrait" },
  { key: "landscape", label: "Landscape" },
  { key: "architecture", label: "Architecture" },
  { key: "creative", label: "Creative" },
  { key: "animals", label: "Animals" },
  { key: "food", label: "Food" },
  { key: "scifi", label: "Sci-Fi" },
];

const PROMPT_INSPIRATIONS: Record<string, string[]> = {
  hot: [
    "Fashion model in haute couture dress, dramatic pose, high-fashion photography, studio setting",
    "Northern lights dancing over snowy landscape, vibrant aurora borealis, starry night sky",
    "Futuristic city skyline at night, neon lights, flying vehicles, cyberpunk aesthetic",
  ],
  portrait: [
    "Professional headshot, natural lighting, confident expression, business attire",
    "Artistic portrait with dramatic shadows, moody atmosphere, fine art photography",
    "Candid street portrait, urban background, natural expression, documentary style",
  ],
  landscape: [
    "Mountain peaks at sunrise, golden hour lighting, misty valleys below",
    "Tropical beach at sunset, palm trees silhouette, orange and purple sky",
    "Desert sand dunes, dramatic shadows, clear blue sky, minimalist composition",
  ],
  architecture: [
    "Modern glass skyscraper, reflective surfaces, urban architecture, blue sky",
    "Ancient temple ruins, overgrown with vegetation, mystical atmosphere",
    "Minimalist interior design, white walls, natural light, Scandinavian style",
  ],
  creative: [
    "Surreal dreamscape, floating islands, impossible physics, Salvador Dali style",
    "Abstract geometric patterns, vibrant colors, modern art, digital illustration",
    "Watercolor painting style, soft colors, artistic interpretation, dreamy atmosphere",
  ],
  animals: [
    "Majestic lion portrait, golden mane flowing, intense gaze, wildlife photography",
    "Colorful tropical bird, detailed feathers, natural habitat, macro photography",
    "Underwater scene, coral reef, tropical fish, clear blue water, marine life",
  ],
  food: [
    "Gourmet dish presentation, fine dining, artistic plating, professional food photography",
    "Chocolate lava cake, molten center flowing out, vanilla ice cream, dessert photography",
    "Fresh ingredients, rustic wooden table, natural lighting, farm-to-table aesthetic",
  ],
  scifi: [
    "Cyberpunk street at night, neon signs, rain-soaked pavement, flying cars, dystopian city",
    "Space station interior, futuristic technology, holographic displays, sci-fi aesthetic",
    "Robot character design, mechanical details, futuristic materials, concept art",
  ],
};

export default function EnhancedWorker() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [seed, setSeed] = useState<number>(-1);
  const [outputFormat, setOutputFormat] = useState<string>("jpeg");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSubscriptionInfo, setUserSubscriptionInfo] = useState<UserSubscriptionInfo | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState("hot");
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user?.uuid) {
      fetchUserSubscriptionInfo();
    }
  }, [user?.uuid]);

  const fetchUserSubscriptionInfo = async () => {
    if (!user?.uuid) return;
    try {
      const userSubscriptionInfo = await fetch("/api/user/get_user_subscription_info", {
        method: "POST",
        body: JSON.stringify({ user_id: user.uuid }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user subscription info");
        return res.json();
      });
      setUserSubscriptionInfo(userSubscriptionInfo);
      setIsSubscribed(userSubscriptionInfo.subscription_status === "active");
    } catch (err) {
      console.error("Failed to fetch subscription info:", err);
    }
  };

  const generateRandomSeed = () => setSeed(Math.floor(Math.random() * 1000000));

  const handleGenerate = async () => {
    if (!user) {
      toast.warning("Please sign in to generate images");
      router.push("/api/auth/signin");
      return;
    }

    if (
      selectedModel.credit > 0 &&
      typeof userSubscriptionInfo?.remain_count === "number" &&
      userSubscriptionInfo.remain_count < selectedModel.credit
    ) {
      toast.warning("No credit left");
      return;
    }

    if (prompt.length === 0) {
      toast.warning("Please enter a prompt");
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch("/api/predictions/text_to_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel.model,
          version: selectedModel.version,
          prompt,
          width: aspectRatio.width,
          height: aspectRatio.height,
          output_format: outputFormat,
          seed: seed === -1 ? undefined : seed,
          aspect_ratio: aspectRatio.key,
          user_id: user?.uuid,
          user_email: user?.email,
          effect_link_name: "text-to-image",
          credit: selectedModel.credit,
        }),
      });

      let newPrediction = await response.json();
      if (response.status !== 201) {
        await handleApiErrors({ response, newPrediction, router });
        setError(newPrediction.detail);
        return;
      }

      setPrediction(newPrediction);

      while (newPrediction.status !== "succeeded" && newPrediction.status !== "failed") {
        await sleep(1000);
        const getResponse = await fetch("/api/predictions/" + newPrediction.id);
        newPrediction = await getResponse.json();
        if (getResponse.status !== 200) {
          await handleApiErrors({ response: getResponse, newPrediction, router });
          setError(newPrediction.detail);
          return;
        }
        setPrediction(newPrediction);
      }

      if (newPrediction.status === "succeeded") {
        toast.success("Image generated successfully");
        fetchUserSubscriptionInfo();
      }
    } catch (err) {
      console.error("Generation error:", err);
      toast.error("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex w-full max-w-7xl flex-col gap-10">
      {user && userSubscriptionInfo && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <CreditInfo credit={String(userSubscriptionInfo.remain_count ?? "")} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-lg md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Generator Controls</h3>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-white">
              {selectedModel.credit} credit
            </span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Prompt</label>
            <Textarea
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              minRows={4}
              className="w-full"
              classNames={{ input: "text-base", inputWrapper: "rounded-xl border-2 border-slate-200" }}
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">AI Model</label>
            <div className="flex flex-wrap gap-2">
              {AI_MODELS.map((model) => (
                <Button
                  key={model.key}
                  size="sm"
                  className={cn(
                    "rounded-xl font-semibold",
                    selectedModel.key === model.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  )}
                  onClick={() => setSelectedModel(model)}
                >
                  {model.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <Button
                  key={ratio.key}
                  size="sm"
                  className={cn(
                    "min-w-[60px] rounded-lg font-semibold",
                    aspectRatio.key === ratio.key
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  )}
                  onClick={() => setAspectRatio(ratio)}
                >
                  {ratio.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Seed</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={seed.toString()}
                  onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                  placeholder="-1"
                  size="sm"
                />
                <Button size="sm" variant="bordered" onClick={generateRandomSeed} isIconOnly>
                  <Icon icon="solar:refresh-line-duotone" width={16} />
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Format</label>
              <Select size="sm" selectedKeys={[outputFormat]} onChange={(e) => setOutputFormat(e.target.value)}>
                <SelectItem key="jpeg" value="jpeg">JPEG</SelectItem>
                <SelectItem key="png" value="png">PNG</SelectItem>
                <SelectItem key="webp" value="webp">WebP</SelectItem>
              </Select>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleGenerate}
            isLoading={generating}
            disabled={!user || generating}
            className="mt-8 h-14 w-full rounded-2xl bg-slate-900 text-base font-bold text-white"
          >
            {generating ? "Generating..." : "Generate Image"}
          </Button>

          {!user && (
            <Button
              size="lg"
              onClick={() => router.push("/api/auth/signin")}
              className="mt-3 h-14 w-full rounded-2xl bg-cyan-600 text-base font-bold text-white"
            >
              Sign In to Generate
            </Button>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-lg">
          <Output prediction={prediction} error={error} defaultImage="/resources/text-to-image.jpg" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
            <Icon icon="solar:lightbulb-line-duotone" width={18} />
          </span>
          <h3 className="text-xl font-bold text-slate-900">Prompt Inspirations</h3>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {PROMPT_CATEGORIES.map((category) => (
            <Button
              key={category.key}
              size="sm"
              className={cn(
                "rounded-full px-4 font-semibold",
                activeCategory === category.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              )}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {PROMPT_INSPIRATIONS[activeCategory]?.map((promptText, index) => (
            <button
              key={index}
              onClick={() => setPrompt(promptText)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm leading-6 text-slate-700 transition hover:-translate-y-1 hover:shadow-md"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
