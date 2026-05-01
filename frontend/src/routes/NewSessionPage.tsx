import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "@/lib/api";
import type { ScenarioType } from "@/types/session";

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<ScenarioType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(scenario: ScenarioType) {
    setError(null);
    setSubmitting(scenario);
    try {
      const res = await createSession(scenario);
      navigate(`/session/${res.session_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "세션 생성 실패");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">어떤 상황을 연습하시겠어요?</h1>
      <p className="mt-2 text-sm text-slate-500">상황을 선택하면 AI가 첫 질문을 시작합니다.</p>

      {error && (
        <div className="mt-4 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => start("interview")}
          disabled={submitting !== null}
          className="rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:border-brand-500 hover:shadow disabled:opacity-60"
        >
          <h2 className="text-lg font-semibold">면접 상황</h2>
          <p className="mt-2 text-sm text-slate-500">
            취업 면접에서 자기소개, 지원동기, 강점, 협업 경험 등을 연습합니다.
          </p>
          <span className="mt-4 inline-block rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {submitting === "interview" ? "준비 중..." : "선택"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => start("work")}
          disabled={submitting !== null}
          className="rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:border-brand-500 hover:shadow disabled:opacity-60"
        >
          <h2 className="text-lg font-semibold">발표 / 회의 발언</h2>
          <p className="mt-2 text-sm text-slate-500">
            발표 오프닝, 회의에서 의견 꺼내기, 핵심 메시지 정리 등 사람 앞에서 말하는 기본기를 연습합니다.
          </p>
          <span className="mt-4 inline-block rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {submitting === "work" ? "준비 중..." : "선택"}
          </span>
        </button>
      </div>
    </div>
  );
}
