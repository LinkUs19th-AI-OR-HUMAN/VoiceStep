import { Link } from "react-router-dom";
import type { ReportListItem } from "@/types/report";

type Props = { report: ReportListItem };

const SCENARIO_LABEL: Record<string, string> = {
  interview: "면접 상황 연습",
  work: "발표/회의 발언 연습",
};

export default function ReportCard({ report }: Props) {
  const date = new Date(report.created_at).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (
    <Link
      to={`/reports/${report.id}`}
      className="block rounded-lg border bg-white p-4 shadow-sm transition hover:border-brand-500 hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{date}</div>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            {SCENARIO_LABEL[report.scenario_type] || report.scenario_type}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
            {report.summary || "요약 정보가 없습니다."}
          </p>
        </div>
        <div className="rounded-md bg-brand-50 px-3 py-2 text-center">
          <div className="text-xs text-brand-700">총점</div>
          <div className="text-2xl font-bold text-brand-700">{report.total_score ?? "-"}</div>
        </div>
      </div>
      <div className="mt-3 text-right text-sm text-brand-600">자세히 보기 →</div>
    </Link>
  );
}
