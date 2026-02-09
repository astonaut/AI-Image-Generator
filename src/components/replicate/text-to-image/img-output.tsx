import { Button, CircularProgress } from "@nextui-org/react";
import { useTranslations } from "next-intl";

export default function Output({
  error,
  prediction,
  defaultImage,
  showImage,
}: {
  error: string | null;
  prediction: any;
  defaultImage: string;
  showImage?: string | null;
}) {
  const t = useTranslations("PhotoToCartoon.generator");

  const finalImage =
    showImage ||
    (Array.isArray(prediction?.output) && prediction.output.length > 1
      ? prediction.output[1]
      : prediction?.output);

  return (
    <div className="flex min-h-[420px] w-full flex-col">
      {error && error !== "" && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        {prediction ? (
          finalImage ? (
            <div className="group relative w-full overflow-hidden rounded-2xl">
              <img src={finalImage} alt="Result" className="max-h-[420px] w-full rounded-2xl object-contain" />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  className="bg-white text-slate-900"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = finalImage;
                    link.setAttribute("download", "");
                    link.setAttribute("target", "_blank");
                    link.click();
                  }}
                >
                  {t("output.downloadButton")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-600">
              <CircularProgress color="primary" aria-label="Loading..." />
              <span className="text-sm font-semibold uppercase tracking-wide">{prediction.status}</span>
            </div>
          )
        ) : (
          <img src={defaultImage} className="max-h-[420px] w-full rounded-2xl object-cover" alt="Default" />
        )}
      </div>
    </div>
  );
}
