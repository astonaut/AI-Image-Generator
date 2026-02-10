import { pageListEffectResultsByUserId } from "@/backend/service/effect_result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const maxDuration = 60; // Set max duration to 60 seconds (1 minute)

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser?.uuid) {
    return Response.json({ detail: "Please login first" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  if (!userId) {
    return Response.json({ detail: "User ID is required" }, { status: 400 });
  }

  if (userId !== sessionUser.uuid) {
    return Response.json({ detail: "Forbidden" }, { status: 403 });
  }

  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("page_size") || "10";
  const results = await pageListEffectResultsByUserId(
    userId,
    parseInt(page),
    parseInt(pageSize)
  );
  return Response.json(results);
}
