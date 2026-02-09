export default function CreditInfo({ credit }: { credit: string }) {
  const hasCredit = credit && credit !== "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      {hasCredit ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-700 md:text-sm">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">C</span>
          Credits remaining:
          <span className="rounded-md bg-slate-900 px-2 py-1 text-white">{credit}</span>
        </p>
      ) : (
        <p className="text-xs font-semibold text-amber-700 md:text-sm">Please sign in to use this feature.</p>
      )}
    </div>
  );
}
