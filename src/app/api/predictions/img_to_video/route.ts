import { NextResponse } from "next/server";
import Replicate from "replicate";
import { ResponseCodeEnum } from "@/backend/type/enum/response_code_enum";
import { createEffectResult } from "@/backend/service/effect_result";
import { genEffectResultId } from "@/backend/utils/genId";
import { generateCheck } from "@/backend/service/generate-_check";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
const WEBHOOK_HOST = process.env.REPLICATE_URL

export async function POST(request: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const user_id = formData.get("user_id") as string;
  const model = formData.get("model") as string;
  const version = formData.get("version") as string;
  const user_email = formData.get("user_email") as string;
  const effect_link_name = formData.get("effect_link_name") as string;
  const credit = Number(formData.get("credit")) || 0;

  if (!model && !version) {
    return NextResponse.json({ detail: "Either model or version must be specified" }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser?.uuid || !sessionUser?.email) {
    return Response.json({ error: "Please login first" }, { status: ResponseCodeEnum.UNAUTHORIZED });
  }

  if (sessionUser.uuid !== user_id || sessionUser.email !== user_email) {
    return Response.json({ detail: "User identity mismatch" }, { status: ResponseCodeEnum.FORBIDDEN });
  }

  const checkResult = await generateCheck(user_id, user_email, credit);
  if (!checkResult.ok) {
    return Response.json({ detail: checkResult.detail }, { status: checkResult.status });
  }

  // 创建replicate 请求参数
  const options = await createOptions(formData);

  // 发送replicate请求
  const prediction = await replicate.predictions.create(options as any);
  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }

  // 创建effect_result初始信息
  const resultId = genEffectResultId();
  createEffectResult({
    result_id: resultId,
    user_id: user_id,
    original_id: prediction.id,
    effect_id: 0,
    effect_name: effect_link_name,
    prompt: prompt,
    url: "",
    status: "pending",
    original_url: "",
    storage_type: "R2",
    running_time: -1,
    credit: credit,
    request_params: JSON.stringify(options),
    created_at: new Date()
  }).catch(error => {
    console.error("Failed to create effect result:", error);
  });

  return NextResponse.json(prediction, { status: 201 });
}


const createOptions = async (formData: FormData) => { 
  let input;
  const model = formData.get("model") as string;
  if (formData.get("effect_link_name") === "ai-dancing" || formData.get("effect_link_name") === "kling-v12") {
    const start_image = formData.get("image");
    const base64_image = await imageToBase64(start_image as File);
    input = {
      prompt: formData.get("prompt") as string,
      start_image: base64_image,
    };
  } else if (formData.get("effect_link_name") === "text-to-video") {
    const first_frame_image = formData.get("image");
    if (first_frame_image) {
      const base64_image = await imageToBase64(first_frame_image as File);
      input = {
        prompt: formData.get("prompt") as string,
        first_frame_image: base64_image,
      };
    } else {
      input = {
        prompt: formData.get("prompt") as string,
      };
    }
  } else {
    const first_frame_image = formData.get("image");
    const base64_image = await imageToBase64(first_frame_image as File);
    input = {
      prompt: formData.get("prompt") as string,
      first_frame_image: base64_image,
    };
  }

  let options = {
    model: model,
    input: input,
    webhook: "",
    webhook_events_filter: [] as string[],
  };

  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhook/replicate`;
    options.webhook_events_filter = ["start", "completed"];
  }
  return options;
}

async function imageToBase64(image: File): Promise<string> {
  const buffer = await image.arrayBuffer();
  const base64Image = Buffer.from(buffer).toString("base64");
  const mimeType = image.type || "image/jpeg";
  return `data:${mimeType};base64,${base64Image}`;
}
