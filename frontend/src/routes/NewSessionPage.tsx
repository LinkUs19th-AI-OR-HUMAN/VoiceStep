import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "@/lib/api";
import type { ScenarioType } from "@/types/session";

const JOBS = [
  "반도체",
  "IT",
  "AI",
  "빅데이터",
  "HRD",
  "HRM",
  "배터리",
  "무역",
  "패션",
  "전략 기획",
  "컨텐츠 마케팅",
  "영업",
];

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!selectedScenario || !selectedJob) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await createSession(selectedScenario, selectedJob);
      navigate(`/session/${res.session_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "세션 생성 실패");
      setSubmitting(false);
    }
  }

  // 시나리오 선택 화면
  if (!selectedScenario) {
    return (
      <div>
        <h1 className="text-2xl font-bold">어떤 상황을 연습하시겠어요?</h1>
        <p className="mt-2 text-sm text-slate-500">상황을 선택하면 다음 단계로 진행합니다.</p>

        {error && (
          <div className="mt-4 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedScenario("interview")}
            disabled={submitting}
            className="rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:border-brand-500 hover:shadow disabled:opacity-60"
          >
            <h2 className="text-lg font-semibold">면접 상황</h2>
            <p className="mt-2 text-sm text-slate-500">
              취업 면접에서 자기소개, 지원동기, 강점, 협업 경험 등을 연습합니다.
            </p>
            <span className="mt-4 inline-block rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              선택
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedScenario("work")}
            disabled={submitting}
            className="rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:border-brand-500 hover:shadow disabled:opacity-60"
          >
            <h2 className="text-lg font-semibold">발표 / 회의 발언</h2>
            <p className="mt-2 text-sm text-slate-500">
              발표 오프닝, 회의에서 의견 꺼내기, 핵심 메시지 정리 등 사람 앞에서 말하는 기본기를 연습합니다.
            </p>
            <span className="mt-4 inline-block rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              선택
            </span>
          </button>
        </div>
      </div>
    );
  }

  // 직무 선택 화면
  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {
            setSelectedScenario(null);
            setSelectedJob(null);
          }}
          className="text-sm text-brand-600 hover:underline"
        >
          ← 상황 다시 선택
        </button>
      </div>

      <h1 className="text-2xl font-bold">지원 직무를 선택하세요</h1>
      <p className="mt-2 text-sm text-slate-500">
        {selectedScenario === "interview"
          ? "면접 상황에서 지원 직무를 기반으로 질문받게 됩니다."
          : "발표/회의 발언 시 직무 관련 주제로 진행됩니다."}
      </p>

      {error && (
        <div className="mt-4 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {JOBS.map((job) => (
          <button
            key={job}
            type="button"
            onClick={() => setSelectedJob(job)}
            disabled={submitting}
            className={`rounded-lg border-2 p-4 text-center transition disabled:opacity-60 ${
              selectedJob === job
                ? "border-brand-500 bg-brand-50"
                : "border-slate-200 bg-white hover:border-brand-300"
            }`}
          >
            <span className="font-medium text-slate-900">{job}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={start}
          disabled={!selectedJob || submitting}
          className="w-full rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "준비 중..." : "시작하기"}
        </button>
      </div>
    </div>
  );
}
