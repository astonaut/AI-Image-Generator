import { countEffectResultsByUserId } from "@/backend/service/effect_result";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: NextRequest) {
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

  const count = await countEffectResultsByUserId(userId);
  if (count > 100) {
    return NextResponse.json({ count: 100 });
  }
  return NextResponse.json({ count });
}
