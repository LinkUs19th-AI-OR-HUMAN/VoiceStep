import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AvatarSpeaker from "@/components/AvatarSpeaker";
import AudioRecorder from "@/components/AudioRecorder";
import ChatMessageList from "@/components/ChatMessageList";
import LoadingState from "@/components/LoadingState";
import { getSession, postReply } from "@/lib/api";
import type { SessionDetail } from "@/types/session";
import type { ChatMessage } from "@/types/message";

const MAX_TURNS = 5;

export default function ConversationPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReply, setPendingReply] = useState<{ original: string; corrected: string } | null>(
    null
  );
  const [submittingReply, setSubmittingReply] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    setLoading(true);
    getSession(sessionId)
      .then((s) => {
        if (!cancelled) {
          setSession(s);
          setCompleted(s.status === "completed");
        }
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const chatMessages: ChatMessage[] = useMemo(() => {
    if (!session) return [];
    return session.messages
      .filter((m) => m.role === "ai" || m.role === "user")
      .map((m) => ({
        id: m.id,
        role: m.role as "ai" | "user",
        content: m.content,
        originalSttText: m.original_stt_text ?? undefined,
        correctedText: m.corrected_text ?? undefined,
        turnIndex: m.turn_index,
      }));
  }, [session]);

  const lastAiMessage = useMemo(
    () => [...chatMessages].reverse().find((m) => m.role === "ai") ?? null,
    [chatMessages]
  );

  async function submitReply() {
    if (!session || !sessionId || !pendingReply) return;
    setSubmittingReply(true);
    setError(null);
    try {
      const res = await postReply(sessionId, {
        original_stt_text: pendingReply.original,
        corrected_text: pendingReply.corrected,
      });
      // Refresh session
      const fresh = await getSession(sessionId);
      setSession(fresh);
      setPendingReply(null);
      setAiSpeaking(true);
      if (res.is_completed) {
        setCompleted(true);
        if (res.report_id) {
          // Small delay so user sees closing message + speech end
          window.setTimeout(() => {
            navigate(`/reports/${res.report_id}`);
          }, 4000);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmittingReply(false);
    }
  }

  if (loading) return <LoadingState label="대화를 준비하는 중..." />;
  if (error)
    return (
      <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        {error}
      </div>
    );
  if (!session)
    return <div className="text-sm text-slate-500">세션을 찾을 수 없습니다.</div>;

  const avatarType = session.scenario_type === "interview" ? "interview" : "work";
  const turn = session.turn_count;
  const remaining = Math.max(0, MAX_TURNS - turn);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm">
        <AvatarSpeaker
          key={lastAiMessage?.id ?? "first"}
          text={lastAiMessage?.content ?? ""}
          avatarType={avatarType}
          autoSpeak
          onSpeakEnd={() => setAiSpeaking(false)}
        />
        <div className="w-full rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-medium">현재 턴</div>
          <div className="mt-1">
            {turn} / {MAX_TURNS} (남은 답변 {remaining}회)
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">현재 질문</div>
          <p className="mt-1 text-base font-medium text-slate-900">
            {lastAiMessage?.content || "(질문 준비 중...)"}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-medium text-slate-700">대화 기록</div>
          <ChatMessageList messages={chatMessages} showOriginalStt />
        </div>

        {!completed && (
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-medium text-slate-700">답변 녹음</div>
            <AudioRecorder
              sessionId={session.id}
              disabled={aiSpeaking || submittingReply}
              onTranscribed={({ originalText, correctedText }) => {
                setPendingReply({ original: originalText, corrected: correctedText });
              }}
            />
            {aiSpeaking && (
              <p className="mt-2 text-xs text-slate-400">
                AI가 말하는 중입니다. 잠시 후에 녹음 버튼이 활성화됩니다.
              </p>
            )}

            {pendingReply && (
              <div className="mt-4 space-y-2 rounded-md border bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  변환된 답변 (제출 전 확인)
                </div>
                <textarea
                  className="w-full rounded-md border bg-white p-2 text-sm"
                  value={pendingReply.corrected}
                  onChange={(e) =>
                    setPendingReply((p) => (p ? { ...p, corrected: e.target.value } : p))
                  }
                  rows={3}
                />
                <div className="text-xs text-slate-400">원문: {pendingReply.original}</div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingReply(null)}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-slate-100"
                  >
                    다시 녹음
                  </button>
                  <button
                    type="button"
                    onClick={submitReply}
                    disabled={submittingReply}
                    className="rounded-md bg-brand-500 px-3 py-1 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
                  >
                    {submittingReply ? "전송 중..." : "답변 제출"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {completed && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
            <div className="font-medium">대화가 종료되었습니다.</div>
            <div className="mt-1">보고서 페이지로 곧 이동합니다.</div>
          </div>
        )}
      </section>
    </div>
  );
}
