import { NextRequest, NextResponse } from "next/server";
import { generatePresignedUrl } from "@/backend/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucketFolder = (formData.get("bucketFolder") as string) || "uploads";
    const customFileName = formData.get("fileName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const safeName = (customFileName || file.name).replace(/\s+/g, "_");
    const fileName = `${Date.now()}-${safeName}`;

    const { presignedUrl, objectKey } = await generatePresignedUrl(
      file.type || "application/octet-stream",
      bucketFolder,
      fileName
    );

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (!uploadResponse.ok) {
      return NextResponse.json({ error: "Failed to upload file to R2" }, { status: 500 });
    }

    const uploadedFileUrl = `${process.env.R2_ENDPOINT}/${objectKey}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      fileKey: objectKey,
      uploadedFileUrl,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
