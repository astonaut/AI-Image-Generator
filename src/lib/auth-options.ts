import { AuthOptions } from "next-auth";
import { Provider } from "next-auth/providers/index";
import GoogleProvider from "next-auth/providers/google";
import { genUniSeq, getIsoTimestr } from "@/backend/utils";
import { saveUser } from "@/backend/service/user";
import { User } from "@/backend/type/type";
import {
  createCreditUsage,
  getCreditUsageByUserId,
} from "@/backend/service/credit_usage";

const providers: Provider[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/`;
    },
    async session({ session, token }) {
      if (token && (token as any).user) {
        session.user = (token as any).user;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user && user.email && account) {
        const dbUser: User = {
          uuid: genUniSeq(),
          email: user.email,
          nickname: user.name || "",
          avatar_url: user.image || "",
          signin_type: account.type,
          signin_provider: account.provider,
          signin_openid: account.providerAccountId,
          created_at: getIsoTimestr(),
          signin_ip: "",
        };

        await saveUser(dbUser);

        const creditUsage = await getCreditUsageByUserId(dbUser.uuid);
        if (!creditUsage) {
          await createCreditUsage({
            user_id: dbUser.uuid,
            user_subscriptions_id: -1,
            is_subscription_active: false,
            used_count: 0,
            period_remain_count: 20,
            period_start: new Date(),
            period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            created_at: new Date(),
          });
        }

        (token as any).user = {
          uuid: dbUser.uuid,
          nickname: dbUser.nickname,
          email: dbUser.email,
          avatar_url: dbUser.avatar_url,
          created_at: dbUser.created_at,
        };
      }
      return token;
    },
  },
};
