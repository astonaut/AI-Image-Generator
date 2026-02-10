import { ResponseCodeEnum } from "@/backend/type/enum/response_code_enum";
import { getUserByUuidAndEmail } from "@/backend/service/user";
import { checkCreditUsageByUserId } from "@/backend/service/credit_usage";

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

  const result = await checkCreditUsageByUserId(user_id, credit);
  if (result !== 1) {
    if (result === -1) {
      return { ok: false, status: ResponseCodeEnum.CREDIT_NOT_INITED, detail: "try again" };
    }
    if (result === -2) {
      return {
        ok: false,
        status: ResponseCodeEnum.NONE_SUBSCRIBED,
        detail: "You are not subscribed or your credit is not enough, please purchase credits or subscribe.",
      };
    }
    if (result === -3) {
      return { ok: false, status: ResponseCodeEnum.FORBIDDEN, detail: "Your current monthly credit usage is exceeded" };
    }
  }
  return { ok: true };
}
