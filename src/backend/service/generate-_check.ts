import { ResponseCodeEnum } from "@/backend/type/enum/response_code_enum";
import { getUserByUuidAndEmail } from "@/backend/service/user";
import {
  consumeCreditByUserId,
  getCreditUsageByUserId,
} from "@/backend/service/credit_usage";

export type GenerateCheckResult =
  | { ok: true }
  | { ok: false; status: number; detail: string };

export async function generateCheck(
  user_id: string,
  user_email: string,
  credit: number
): Promise<GenerateCheckResult> {
  if (user_id === undefined || user_email === undefined) {
    return { ok: false, status: ResponseCodeEnum.UNAUTHORIZED, detail: "Please login first" };
  }

  const user = await getUserByUuidAndEmail(user_id, user_email);
  if (!user || user.uuid !== user_id) {
    return { ok: false, status: ResponseCodeEnum.UNAUTHORIZED, detail: "Please login first" };
  }

  const creditUsage = await getCreditUsageByUserId(user_id);
  if (!creditUsage) {
    return { ok: false, status: ResponseCodeEnum.CREDIT_NOT_INITED, detail: "try again" };
  }

  if (creditUsage.period_remain_count <= 0 || creditUsage.period_remain_count < credit) {
    if (creditUsage.is_subscription_active !== true) {
      return {
        ok: false,
        status: ResponseCodeEnum.NONE_SUBSCRIBED,
        detail: "You are not subscribed or your credit is not enough, please purchase credits or subscribe.",
      };
    }
    return {
      ok: false,
      status: ResponseCodeEnum.FORBIDDEN,
      detail: "Your current monthly credit usage is exceeded",
    };
  }

  const consumed = await consumeCreditByUserId(user_id, credit);
  if (!consumed) {
    return {
      ok: false,
      status: ResponseCodeEnum.NONE_SUBSCRIBED,
      detail: "Credit changed during request. Please try again.",
    };
  }

  return { ok: true };
}
