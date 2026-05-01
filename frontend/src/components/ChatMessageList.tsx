import type { ChatMessage } from "@/types/message";

type Props = {
  messages: ChatMessage[];
  showOriginalStt?: boolean;
};

export default function ChatMessageList({ messages, showOriginalStt = false }: Props) {
  return (
    <ol className="space-y-3">
      {messages.map((m, idx) => {
        const isAi = m.role === "ai";
        return (
          <li
            key={m.id ?? idx}
            className={`flex ${isAi ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isAi
                  ? "bg-white text-slate-900 ring-1 ring-slate-200"
                  : "bg-brand-500 text-white"
              }`}
            >
              <div className="text-[11px] uppercase tracking-wide opacity-70">
                {isAi ? "AI" : "나"}
              </div>
              <div className="mt-1 whitespace-pre-wrap">{m.content}</div>
              {showOriginalStt && !isAi && m.originalSttText && m.originalSttText !== m.content && (
                <div className="mt-1 border-t border-white/30 pt-1 text-[11px] opacity-80">
                  원문: {m.originalSttText}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
