import { checkUserHasSuccessfulPayment } from "@/backend/service/payment_history";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;
    if (!sessionUser?.uuid) {
      return Response.json({ error: "Please login first" }, { status: 401 });
    }

    const { user_id } = await request.json();

    if (!user_id) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }
    if (user_id !== sessionUser.uuid) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const hasSuccessfulPayment = await checkUserHasSuccessfulPayment(user_id);

    return Response.json({
      isPro: hasSuccessfulPayment,
      user_id,
    });
  } catch (error) {
    console.error("Error checking pro status:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
