import Stripe from "stripe";
import { getDb } from "@/backend/config/db";
import {
  createUserSubscription,
  updateUserSubscription,
  getUserSubscriptionByUserId,
} from "@/backend/service/user_subscription";
import {
  createCreditUsage,
  getCreditUsageByUserId,
  updateCreditUsage,
} from "@/backend/service/credit_usage";
import { CreditUsage, PaymentHistory, UserSubscription } from "@/backend/type/type";
import {
  getPaymentHistoryById,
  markPaymentHistorySuccessIfNotYet,
} from "@/backend/service/payment_history";
import { UserSubscriptionStatusEnum } from "@/backend/type/enum/user_subscription_enum";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function acquireStripeEventLock(eventId: string, eventType: string): Promise<boolean> {
  const db = getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS stripe_event_log (
      id SERIAL PRIMARY KEY,
      event_id TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const res = await db.query(
    `INSERT INTO stripe_event_log (event_id, event_type)
     VALUES ($1, $2)
     ON CONFLICT (event_id) DO NOTHING
     RETURNING id`,
    [eventId, eventType]
  );

  return Array.isArray(res.rows) && res.rows.length > 0;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    const locked = await acquireStripeEventLock(event.id, event.type);
    if (!locked) {
      return Response.json({ received: true, duplicated: true });
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        console.log("payment_intent.succeeded:", paymentIntentSucceeded.id);
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("customer.subscription.created:", subscription.id);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.project !== "ai-video-generator") {
          return Response.json({ received: true });
        }

        if (
          session.metadata?.subscriptionPlanId !== "1" &&
          session.metadata?.subscriptionPlanId !== "9" &&
          session.metadata?.subscriptionPlanId !== "11"
        ) {
          return Response.json({ received: true });
        }

        const currentDate = new Date();
        let newPeriodEnd = new Date(currentDate);
        newPeriodEnd.setMonth(currentDate.getMonth() + 1);

        let creditUsage: CreditUsage = await getCreditUsageByUserId(session.metadata.userId);
        if (creditUsage?.period_end && creditUsage.period_end > newPeriodEnd) {
          newPeriodEnd = new Date(creditUsage.period_end);
        }

        if (!creditUsage) {
          await createCreditUsage({
            user_id: session.metadata.userId,
            user_subscriptions_id: -1,
            is_subscription_active: false,
            used_count: 0,
            period_remain_count: parseInt(session.metadata.credit),
            period_start: currentDate,
            period_end: newPeriodEnd,
            created_at: new Date(),
          });
        } else {
          creditUsage.period_remain_count += parseInt(session.metadata.credit);
          creditUsage.period_end = newPeriodEnd;
          creditUsage.updated_at = new Date();
          await updateCreditUsage(creditUsage);
        }

        const paymentHistory: PaymentHistory = await getPaymentHistoryById(session.metadata.paymentHistoryId);
        if (paymentHistory) {
          await markPaymentHistorySuccessIfNotYet({
            ...paymentHistory,
            stripe_subscription_id: session.id,
            stripe_customer_id: session.customer?.toString() || "",
            stripe_price_id: paymentHistory.stripe_price_id || session.metadata.priceId,
            status: "success",
          });
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.metadata?.project !== "ai-video-generator") {
          return Response.json({ received: true });
        }

        if (subscription.cancel_at_period_end) {
          return Response.json({ received: true });
        }

        const currentDate = new Date();
        const currentPeriodEnd = new Date(currentDate);
        if (subscription.metadata.interval === "year") {
          currentPeriodEnd.setFullYear(currentDate.getFullYear() + 1);
        } else {
          currentPeriodEnd.setMonth(currentDate.getMonth() + 1);
        }

        const userSubscription = await getUserSubscriptionByUserId(subscription.metadata.userId);

        const params: UserSubscription = {
          user_id: subscription.metadata.userId,
          subscription_plans_id: parseInt(subscription.metadata.subscriptionPlanId),
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer.toString(),
          status: UserSubscriptionStatusEnum.ACTIVE,
          current_period_start: currentDate,
          current_period_end: currentPeriodEnd,
          created_at: new Date(),
        };

        let userSubscriptions: UserSubscription;
        if (userSubscription) {
          userSubscriptions = await updateUserSubscription(params);
        } else {
          userSubscriptions = await createUserSubscription(params);
          if (!userSubscriptions.id) {
            throw new Error("create user_subscriptions failed");
          }
        }

        let creditUsage: CreditUsage = await getCreditUsageByUserId(subscription.metadata.userId);
        if (!creditUsage) {
          await createCreditUsage({
            user_id: subscription.metadata.userId,
            user_subscriptions_id: userSubscriptions.id!,
            is_subscription_active: true,
            used_count: 0,
            period_remain_count: parseInt(subscription.metadata.credit),
            period_start: currentDate,
            period_end: currentPeriodEnd,
            created_at: new Date(),
          });
        } else {
          if (
            creditUsage.period_remain_count > 0 &&
            creditUsage.period_end &&
            creditUsage.period_end >= currentDate &&
            creditUsage.is_subscription_active === false
          ) {
            creditUsage.period_remain_count += parseInt(subscription.metadata.credit);
          } else {
            creditUsage.period_remain_count = parseInt(subscription.metadata.credit);
          }

          creditUsage.is_subscription_active = true;
          creditUsage.period_start = currentDate;
          creditUsage.period_end = currentPeriodEnd;
          creditUsage.user_subscriptions_id = userSubscriptions.id!;
          creditUsage.updated_at = new Date();
          await updateCreditUsage(creditUsage);
        }

        const paymentHistory: PaymentHistory = await getPaymentHistoryById(subscription.metadata.paymentHistoryId);
        if (paymentHistory) {
          await markPaymentHistorySuccessIfNotYet({
            ...paymentHistory,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer.toString(),
            stripe_price_id: subscription.items.data[0].price.id,
            status: "success",
          });
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        console.log("customer.subscription.deleted:", subscriptionDeleted.id);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return Response.json({ error: "Error processing Stripe webhook" }, { status: 500 });
  }

  return Response.json({ received: true });
}
