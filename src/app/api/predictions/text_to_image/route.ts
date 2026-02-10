import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createEffectResult } from "@/backend/service/effect_result";
import { genEffectResultId } from "@/backend/utils/genId";
import { generateCheck } from "@/backend/service/generate-_check";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ResponseCodeEnum } from "@/backend/type/enum/response_code_enum";
import { restoreCreditByUserId } from "@/backend/service/credit_usage";

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
 
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser?.uuid || !sessionUser?.email) {
    return NextResponse.json({ detail: "Please login first" }, { status: ResponseCodeEnum.UNAUTHORIZED });
  }

  const requestBody = await request.json();
  const {
    model,
    prompt,
    width,
    height,
    output_format,
    aspect_ratio,
    user_id,
    user_email,
    effect_link_name,
    version,
    credit,
  } = requestBody;

  if (sessionUser.uuid !== user_id || sessionUser.email !== user_email) {
    return NextResponse.json({ detail: "User identity mismatch" }, { status: ResponseCodeEnum.FORBIDDEN });
  }

  const checkResult = await generateCheck(user_id, user_email, Number(credit) || 0);
  if (!checkResult.ok) {
    return NextResponse.json({ detail: checkResult.detail }, { status: checkResult.status });
  }

  const options = {
    version: version,
    model: model,
    input: { prompt, width, height, output_format, aspect_ratio, },
    webhook: "",
    webhook_events_filter: [] as string[],
  };

  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhook/replicate`;
    options.webhook_events_filter = ["start", "completed"];
  }

  const prediction = await replicate.predictions.create(options as any);
  if (prediction?.error) {
    await restoreCreditByUserId(user_id, Number(credit) || 0);
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }

  const resultId = genEffectResultId();
  try {
    await createEffectResult({
      result_id: resultId,
      user_id: user_id,
      original_id: prediction.id,
      effect_id: 0,
      effect_name: effect_link_name,
      prompt: prompt,
      url: "",
      status: "pending",
      original_url: "",
      storage_type: "S3",
      running_time: -1,
      credit: Number(credit) || 0,
      request_params: JSON.stringify(requestBody),
      created_at: new Date(),
    });
  } catch (error) {
    await restoreCreditByUserId(user_id, Number(credit) || 0);
    console.error("Failed to create effect result:", error);
    return NextResponse.json({ detail: "Failed to create effect result" }, { status: 500 });
  }

  return NextResponse.json(prediction, { status: 201 });
}
