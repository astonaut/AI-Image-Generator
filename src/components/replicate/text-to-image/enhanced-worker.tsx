"use client";

import React, { useState, useEffect } from "react";
import { Button, Textarea, Select, SelectItem, Input } from "@nextui-org/react";
import Prediction from "@/backend/type/domain/replicate";
import { useAppContext } from "@/contexts/app";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { handleApiErrors } from "@/components/replicate/common-logic/response";
import Output from "@/components/replicate/text-to-image/img-output";
import { UserSubscriptionInfo } from "@/backend/type/domain/user_subscription_info";
import CreditInfo from "@/components/landingpage/credit-info";
import { useTranslations } from "next-intl";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 宽高比配置
const ASPECT_RATIOS = [
  { key: "1:1", label: "1:1", width: 1024, height: 1024 },
  { key: "16:9", label: "16:9", width: 1024, height: 576 },
  { key: "3:2", label: "3:2", width: 1024, height: 683 },
  { key: "2:3", label: "2:3", width: 683, height: 1024 },
  { key: "3:4", label: "3:4", width: 768, height: 1024 },
  { key: "4:3", label: "4:3", width: 1024, height: 768 },
  { key: "9:16", label: "9:16", width: 576, height: 1024 },
];

// AI 模型配置
const AI_MODELS = [
  {
    key: "flux-schnell",
    label: "Flux Schnell",
    model: "black-forest-labs/flux-schnell",
    version: null,
    credit: 1,
  },
  {
    key: "flux-dev",
    label: "Flux Dev",
    model: "black-forest-labs/flux-dev",
    version: null,
    credit: 2,
  },
  {
    key: "sdxl",
    label: "SDXL",
    model: "stability-ai/sdxl",
    version: null,
    credit: 1,
  },
];

// 提示词灵感分类
const PROMPT_CATEGORIES = [
  { key: "hot", label: "🔥 HOT", icon: "🔥" },
  { key: "portrait", label: "Portrait", icon: "👤" },
  { key: "landscape", label: "Landscape", icon: "🏞️" },
  { key: "architecture", label: "Architecture", icon: "🏛️" },
  { key: "creative", label: "Creative Art", icon: "🎨" },
  { key: "animals", label: "Animals", icon: "🦁" },
  { key: "food", label: "Food", icon: "🍕" },
  { key: "scifi", label: "Sci-Fi", icon: "🚀" },
];

// 提示词示例
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
  const [userSubscriptionInfo, setUserSubscriptionInfo] =
    useState<UserSubscriptionInfo | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState("hot");
  const { user } = useAppContext();
  const router = useRouter();
  const t = useTranslations("TextToImage");

  useEffect(() => {
    if (user?.uuid) {
      fetchUserSubscriptionInfo();
    }
  }, [user?.uuid]);

  const fetchUserSubscriptionInfo = async () => {
    if (!user?.uuid) return;
    try {
      const userSubscriptionInfo = await fetch(
        "/api/user/get_user_subscription_info",
        {
          method: "POST",
          body: JSON.stringify({ user_id: user.uuid }),
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user subscription info");
        return res.json();
      });
      setUserSubscriptionInfo(userSubscriptionInfo);
      setIsSubscribed(userSubscriptionInfo.subscription_status === "active");
    } catch (error) {
      console.error("Failed to fetch subscription info:", error);
    }
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const handlePromptClick = (promptText: string) => {
    setPrompt(promptText);
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.warning("Please sign in to generate images");
      router.push("/api/auth/signin");
      return;
    }

    if (selectedModel.credit > 0) {
      if (
        typeof userSubscriptionInfo?.remain_count === "number" &&
        userSubscriptionInfo.remain_count < selectedModel.credit
      ) {
        toast.warning("No credit left");
        return;
      }
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
        handleApiErrors(newPrediction, router);
        setError(newPrediction.detail);
        return;
      }

      setPrediction(newPrediction);

      // Poll for results
      while (
        newPrediction.status !== "succeeded" &&
        newPrediction.status !== "failed"
      ) {
        await sleep(1000);
        const response = await fetch("/api/predictions/" + newPrediction.id);
        newPrediction = await response.json();
        if (response.status !== 200) {
          handleApiErrors(newPrediction, router);
          setError(newPrediction.detail);
          return;
        }
        setPrediction(newPrediction);
      }

      if (newPrediction.status === "succeeded") {
        toast.success("Image generated successfully!");
        fetchUserSubscriptionInfo();
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl gap-8">
      {/* Credit Info */}
      {user && userSubscriptionInfo && (
        <CreditInfo
          userSubscriptionInfo={userSubscriptionInfo}
          isSubscribed={isSubscribed}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Input Controls */}
        <div className="flex flex-col gap-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Prompt</h3>
            <Textarea
              placeholder="Describe the image you want to generate... e.g., Wong Kar-wai film style, a lonely man smoking a cigarette in a narrow Hong Kong hallway, 1990s..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              minRows={4}
              className="w-full"
            />
          </div>

          {/* Model Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-2">AI Model</h3>
            <div className="flex flex-wrap gap-2">
              {AI_MODELS.map((model) => (
                <Button
                  key={model.key}
                  size="sm"
                  variant={selectedModel.key === model.key ? "solid" : "bordered"}
                  color={selectedModel.key === model.key ? "primary" : "default"}
                  onClick={() => setSelectedModel(model)}
                >
                  {model.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Aspect Ratio</h3>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <Button
                  key={ratio.key}
                  size="sm"
                  variant={aspectRatio.key === ratio.key ? "solid" : "bordered"}
                  color={aspectRatio.key === ratio.key ? "primary" : "default"}
                  onClick={() => setAspectRatio(ratio)}
                >
                  {ratio.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Seed</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={seed.toString()}
                  onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                  placeholder="-1"
                  size="sm"
                />
                <Button
                  size="sm"
                  variant="bordered"
                  onClick={generateRandomSeed}
                  isIconOnly
                >
                  🎲
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Output Format</label>
              <Select
                size="sm"
                selectedKeys={[outputFormat]}
                onChange={(e) => setOutputFormat(e.target.value)}
              >
                <SelectItem key="jpeg" value="jpeg">JPEG</SelectItem>
                <SelectItem key="png" value="png">PNG</SelectItem>
                <SelectItem key="webp" value="webp">WebP</SelectItem>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            color="primary"
            size="lg"
            onClick={handleGenerate}
            isLoading={generating}
            disabled={!user || generating}
            className="w-full font-semibold"
          >
            {generating ? "Generating..." : "🎨 Generate Image"}
          </Button>

          {!user && (
            <Button
              color="warning"
              size="lg"
              onClick={() => router.push("/api/auth/signin")}
              className="w-full font-semibold"
            >
              💳 Sign In to Generate
            </Button>
          )}
        </div>

        {/* Right Panel - Output */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <Output
              prediction={prediction}
              error={error}
              defaultImage="/resources/text-to-image.jpg"
            />
          </div>
        </div>
      </div>

      {/* Prompt Inspirations */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">✨ Prompt Inspirations</h3>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PROMPT_CATEGORIES.map((category) => (
            <Button
              key={category.key}
              size="sm"
              variant={activeCategory === category.key ? "solid" : "bordered"}
              color={activeCategory === category.key ? "primary" : "default"}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Prompt Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROMPT_INSPIRATIONS[activeCategory]?.map((promptText, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(promptText)}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-sm"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
