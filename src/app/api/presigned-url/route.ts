import { NextRequest, NextResponse } from "next/server";
import { getPresignedR2Url } from "@/backend/lib/r2";

export async function GET(request: NextRequest) {
  const fileKey = request.nextUrl.searchParams.get("fileKey");
  const expiresInParam = request.nextUrl.searchParams.get("expiresIn");

  if (!fileKey) {
    return NextResponse.json({ error: "Missing fileKey parameter" }, { status: 400 });
  }

  const expiresInRaw = Number.parseInt(expiresInParam || "900", 10);
  const expiresIn = Number.isNaN(expiresInRaw) ? 900 : Math.min(3600, Math.max(60, expiresInRaw));

  try {
    const signedUrl = await getPresignedR2Url(fileKey, expiresIn);
    return NextResponse.json({ signedUrl, expiresIn });
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
