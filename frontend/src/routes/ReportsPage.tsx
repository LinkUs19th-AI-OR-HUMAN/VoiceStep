import { useEffect, useState } from "react";
import LoadingState from "@/components/LoadingState";
import ReportCard from "@/components/ReportCard";
import { listReports } from "@/lib/api";
import type { ReportListItem } from "@/types/report";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listReports()
      .then((r) => !cancelled && setReports(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">이전 결과 보기</h1>
      <p className="mt-2 text-sm text-slate-500">
        저장된 대화 보고서를 다시 확인할 수 있습니다.
      </p>

      <div className="mt-6 space-y-3">
        {error && (
          <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {!reports && !error && <LoadingState />}
        {reports && reports.length === 0 && (
          <div className="rounded-md border bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            아직 저장된 보고서가 없습니다. 새 대화를 시작해보세요.
          </div>
        )}
        {reports?.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}
