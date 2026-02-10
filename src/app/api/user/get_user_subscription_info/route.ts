import { getUserSubscriptionInfoByUserId } from "@/backend/service/user_subscription";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser?.uuid) {
    return Response.json({ detail: "Please login first" }, { status: 401 });
  }

  const { user_id } = await request.json();
  if (user_id !== sessionUser.uuid) {
    return Response.json({ detail: "Forbidden" }, { status: 403 });
  }

  const userSubscriptionInfo = await getUserSubscriptionInfoByUserId(user_id);
  return Response.json(userSubscriptionInfo);
}
