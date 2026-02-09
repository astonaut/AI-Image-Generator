"use client";

import React from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Link,
  Spacer,
  Tab,
  Tabs,
} from "@heroui/react";
import { cn } from "@heroui/react";

import { FrequencyEnum } from "@/components/price/pricing-types";
import { frequencies, tiers } from "@/components/price/pricing-tiers";
import { useAppContext } from "@/contexts/app";
import { useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Pricing() {
  const [selectedFrequency, setSelectedFrequency] = React.useState(
    frequencies.find((f) => f.key === FrequencyEnum.Yearly) || frequencies[0]
  );
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const { onOpen } = useDisclosure();
  const router = useRouter();

  const onFrequencyChange = (selectedKey: React.Key) => {
    const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey);
    setSelectedFrequency(frequencies[frequencyIndex]);
  };

  const handleCheckout = async (
    plan_id: number,
    amount: number,
    interval: string
  ) => {
    try {
      setLoading(true);

      const params = {
        plan_id,
        amount,
        interval,
        user_uuid: user?.uuid,
        user_email: user?.email,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (response.status === 401) {
        onOpen();
        return;
      }

      if (response.status === 500) {
        const errorMessage = data.error || "Checkout failed. Please try again.";
        toast.error(errorMessage);
        return;
      }

      if (!data?.session?.url) {
        toast.error("Invalid response from server");
        return;
      }

      router.push(data.session.url);
    } catch (e) {
      console.error("Checkout failed:", e);
      toast.error("Checkout failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex max-w-6xl flex-col items-center">
      <div className="pointer-events-none absolute -top-10 left-10 h-44 w-44 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-6 h-60 w-60 rounded-full bg-blue-300/30 blur-3xl" />

      <div className="flex max-w-3xl flex-col text-center">
        <span className="mx-auto rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
          Flexible billing
        </span>
        <h2 className="mt-5 text-4xl font-extrabold text-slate-900 md:text-5xl">
          Pick the plan that matches your creative velocity
        </h2>
        <p className="mt-4 text-slate-600">
          Transparent pricing, instant credit allocation, and secure checkout via Stripe.
        </p>
        <Spacer y={4} />
      </div>

      <Spacer y={6} />
      <Tabs
        classNames={{
          tabList: "border border-slate-200 bg-white/75 p-1",
          cursor: "bg-slate-900",
          tab: "px-3 sm:px-5",
          tabContent:
            "group-data-[selected=true]:text-white group-data-[selected=false]:text-slate-700 text-sm font-semibold",
        }}
        radius="full"
        color="secondary"
        onSelectionChange={onFrequencyChange}
        defaultSelectedKey={FrequencyEnum.Yearly}
      >
        <Tab
          key={FrequencyEnum.Yearly}
          aria-label="Pay Yearly"
          className="pr-0.5"
          title={
            <div className="flex items-center gap-1 sm:gap-2">
              <p>Pay Yearly</p>
              <Chip color="secondary" variant="flat" className="bg-cyan-100 text-cyan-700 text-xs">
                Save 30%
              </Chip>
            </div>
          }
        />
        <Tab key={FrequencyEnum.Monthly} title="Pay Monthly" />
        <Tab key={FrequencyEnum.OneTime} title="Pay as you go" />
      </Tabs>

      <Spacer y={8} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.key}
            isBlurred
            className={cn("border border-slate-200 bg-white/80 p-3 shadow-sm", {
              "border-slate-900 shadow-xl": tier.mostPopular,
            })}
            shadow="md"
          >
            {tier.mostPopular ? (
              <Chip className="absolute right-4 top-4 bg-slate-900 text-white" color="secondary" variant="flat">
                Most Popular
              </Chip>
            ) : null}
            <CardHeader className="flex flex-col items-start gap-2 pb-6">
              <h3 className="text-2xl font-bold text-slate-900">{tier.title}</h3>
            </CardHeader>
            <Divider />
            <CardBody className="gap-8">
              <p className="flex items-baseline gap-1 pt-2">
                {typeof tier.price !== "string" && tier.previousPrice?.[selectedFrequency.key] && (
                  <span className="text-lg line-through text-slate-400">
                    {tier.previousPrice[selectedFrequency.key]}
                  </span>
                )}
                <span className="text-4xl font-extrabold text-slate-900">
                  {typeof tier.price === "string" ? tier.price : tier.price[selectedFrequency.key]}
                </span>
                {typeof tier.price !== "string" ? (
                  <span className="text-small font-medium text-slate-500">
                    {tier.priceSuffix
                      ? `/${tier.priceSuffix}/${selectedFrequency.priceSuffix}`
                      : `/${selectedFrequency.priceSuffix}`}
                  </span>
                ) : null}
              </p>
              <ul className="flex flex-col gap-2">
                {tier.features?.[selectedFrequency.key].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-slate-700">
                    <Icon className="text-cyan-600" icon="ci:check" width={24} />
                    <p>{feature}</p>
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter>
              {loading ? (
                <Button fullWidth isLoading>
                  Loading...
                </Button>
              ) : (
                <Button
                  fullWidth
                  as={Link}
                  className={`${
                    tier.buttonText === "Coming Soon"
                      ? "bg-slate-400 opacity-50 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800"
                  } text-white rounded-xl font-semibold`}
                  href={tier.href}
                  variant={tier.buttonVariant}
                  isDisabled={tier.buttonText === "Coming Soon"}
                  onPress={() =>
                    tier.buttonText !== "Coming Soon" &&
                    handleCheckout(
                      tier.id[selectedFrequency.key],
                      tier.amount[selectedFrequency.key],
                      tier.interval[selectedFrequency.key]
                    )
                  }
                >
                  {tier.buttonText}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
