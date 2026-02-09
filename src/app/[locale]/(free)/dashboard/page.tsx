"use client";

import { useAppContext } from "@/contexts/app";
import { useEffect, useMemo, useState } from "react";
import { EffectResultInfo } from "@/backend/type/domain/effect_result_info";
import {
  Pagination,
  Modal,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  ModalContent,
  ModalBody,
} from "@nextui-org/react";
import { EyeIcon } from "@nextui-org/shared-icons";
import { UserSubscriptionInfo } from "@/backend/type/domain/user_subscription_info";
import { useTranslations } from "next-intl";

export default function Dashboard() {
  const { user } = useAppContext();
  const [effectResults, setEffectResults] = useState<EffectResultInfo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedResult, setSelectedResult] = useState<EffectResultInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSubscriptionInfo, setUserSubscriptionInfo] = useState<UserSubscriptionInfo | null>(null);

  const pageSize = 10;
  const t = useTranslations("dashboard");

  const fetchUserSubscriptionInfo = async () => {
    if (!user?.uuid) return;
    const info = await fetch("/api/user/get_user_subscription_info", {
      method: "POST",
      body: JSON.stringify({ user_id: user.uuid }),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch user subscription info");
      return res.json();
    });
    setUserSubscriptionInfo(info);
  };

  const fetchResults = async (pageNum: number) => {
    if (!user?.uuid) return;
    setIsLoading(true);
    try {
      const results = await fetch(
        `/api/effect_result/list_by_user_id?user_id=${user.uuid}&page=${pageNum}&page_size=${pageSize}`
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        return res.json();
      });
      setEffectResults(results);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCount = async () => {
    if (!user?.uuid) return;
    try {
      const response = await fetch(`/api/effect_result/count_all?user_id=${user.uuid}`);
      if (!response.ok) throw new Error("Failed to fetch count");

      const data = await response.json();
      const count = parseInt(data.count);
      setTotalCount(count);
      const pages = Math.max(1, Math.ceil(count / pageSize));
      setTotalPages(pages);
      if (page > pages) setPage(1);
    } catch (error) {
      console.error("Failed to fetch count:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserSubscriptionInfo();
      await fetchCount();
      await fetchResults(page);
    };
    if (user?.uuid) init();
  }, [user?.uuid]);

  useEffect(() => {
    if (user?.uuid) {
      fetchResults(page);
      fetchUserSubscriptionInfo();
    }
  }, [page]);

  const planBadge = useMemo(() => {
    if (!userSubscriptionInfo) return "Free";
    return userSubscriptionInfo.subscription_status === "active" ? "Pro" : "Free";
  }, [userSubscriptionInfo]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-600">Track credits, generation history and outputs in one place.</p>
        </div>
        <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
          {planBadge}
        </span>
      </div>

      {userSubscriptionInfo && (
        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label={t("subscription.remainingCredits")} value={String(userSubscriptionInfo.remain_count)} />
          <StatCard label={t("subscription.planName")} value={userSubscriptionInfo.plan_name} />
          <StatCard
            label={t("subscription.periodStart")}
            value={new Date(userSubscriptionInfo.current_period_start).toLocaleDateString()}
          />
          <StatCard
            label={t("subscription.periodEnd")}
            value={
              userSubscriptionInfo.current_period_end
                ? new Date(userSubscriptionInfo.current_period_end).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white/75">
          <Spinner size="lg" label={t("loading")} color="primary" />
        </div>
      ) : effectResults.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <Table
              aria-label="Results table"
              classNames={{
                wrapper: "bg-transparent shadow-none",
                th: "bg-slate-100 text-slate-700 text-xs uppercase tracking-wide",
                td: "text-slate-700",
              }}
            >
              <TableHeader>
                <TableColumn className="text-center">#</TableColumn>
                <TableColumn className="text-center">{t("table.function")}</TableColumn>
                <TableColumn className="text-center">{t("table.processTime")}</TableColumn>
                <TableColumn className="text-center">{t("table.status")}</TableColumn>
                <TableColumn className="text-center">{t("table.credit")}</TableColumn>
                <TableColumn className="text-center">{t("table.created")}</TableColumn>
                <TableColumn className="text-center">{t("table.view")}</TableColumn>
              </TableHeader>
              <TableBody>
                {effectResults.map((result, index) => {
                  const ok = result.status === "succeeded";
                  return (
                    <TableRow key={result.result_id} className="hover:bg-slate-50">
                      <TableCell className="text-center font-semibold">{(page - 1) * pageSize + index + 1}</TableCell>
                      <TableCell className="text-center">{result.effect_name}</TableCell>
                      <TableCell className="text-center">
                        {result.running_time === -1 ? "N/A" : `${result.running_time}s`}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {result.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{ok ? result.credit : "N/A"}</TableCell>
                      <TableCell className="text-center">{new Date(result.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          isIconOnly
                          variant="flat"
                          className="bg-slate-100 text-slate-700"
                          onPress={() => {
                            setSelectedResult(result);
                            setIsModalOpen(true);
                          }}
                          isDisabled={!result.url || !ok}
                          size="sm"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalCount > 0 && (
            <div className="mt-6 flex justify-center">
              <Pagination total={totalPages} page={page} onChange={setPage} showControls color="primary" variant="flat" />
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white/75 p-12 text-center">
          <p className="text-lg font-semibold text-slate-700">{t("noResults")}</p>
          <p className="mt-2 text-sm text-slate-500">Create your first AI output to populate this dashboard.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResult(null);
        }}
        size="2xl"
        backdrop="blur"
      >
        <ModalContent className="bg-white/95">
          {selectedResult && (
            <ModalBody className="p-4 md:p-6">
              {!selectedResult.url ? (
                <div className="text-center text-slate-500">{t("modal.noContent")}</div>
              ) : selectedResult.effect_name === "chat-with-images" ? (
                <div className="whitespace-pre-wrap text-sm text-slate-700">{selectedResult.url}</div>
              ) : selectedResult.url.endsWith(".mp4") ||
                selectedResult.url.endsWith(".webm") ||
                selectedResult.url.endsWith(".mov") ||
                selectedResult.effect_name.includes("video") ? (
                <video src={selectedResult.url} className="w-full rounded-xl" controls />
              ) : (
                <img src={selectedResult.url} alt="Result" className="w-full rounded-xl" loading="lazy" />
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
