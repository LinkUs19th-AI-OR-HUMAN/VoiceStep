import { useEffect, useRef, useState } from "react";
import { speak } from "@/lib/speech";

type Props = {
  text: string;
  avatarType: "interview" | "work";
  autoSpeak?: boolean;
  onSpeakEnd?: () => void;
};

export default function AvatarSpeaker({ text, avatarType, autoSpeak = true, onSpeakEnd }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);
  const cancelRef = useRef<() => void>(() => undefined);
  const animTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!text || !autoSpeak) return;
    cancelRef.current = speak(text, {
      onStart: () => setIsSpeaking(true),
      onBoundary: () => setMouthPhase((p) => (p + 1) % 3),
      onEnd: () => {
        setIsSpeaking(false);
        setMouthPhase(0);
        onSpeakEnd?.();
      },
    });
    return () => cancelRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Continuous mouth animation while speaking even without boundary events.
  useEffect(() => {
    if (!isSpeaking) {
      if (animTimerRef.current) {
        window.clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
      return;
    }
    animTimerRef.current = window.setInterval(() => {
      setMouthPhase((p) => (p + 1) % 3);
    }, 160);
    return () => {
      if (animTimerRef.current) window.clearInterval(animTimerRef.current);
    };
  }, [isSpeaking]);

  function replay() {
    cancelRef.current?.();
    cancelRef.current = speak(text, {
      onStart: () => setIsSpeaking(true),
      onBoundary: () => setMouthPhase((p) => (p + 1) % 3),
      onEnd: () => {
        setIsSpeaking(false);
        setMouthPhase(0);
        onSpeakEnd?.();
      },
    });
  }

  const label = avatarType === "interview" ? "면접관" : "회의 동료";
  const headColor = avatarType === "interview" ? "#3b6df5" : "#10b981";

  // Mouth heights for 3-phase animation
  const mouthHeights = [4, 14, 8];
  const mouthH = mouthHeights[mouthPhase];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-48 w-48 rounded-full bg-white shadow-lg ring-1 ring-slate-200">
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {/* Head */}
          <circle cx="100" cy="100" r="78" fill="#fde2c4" />
          {/* Hair */}
          <path d="M30 95 Q100 10 170 95 Q150 60 100 50 Q50 60 30 95 Z" fill={headColor} opacity="0.85" />
          {/* Eyes */}
          <circle cx="78" cy="100" r="5" fill="#1f2937" />
          <circle cx="122" cy="100" r="5" fill="#1f2937" />
          {/* Eyebrows */}
          <rect x="68" y="86" width="20" height="3" rx="1" fill="#374151" />
          <rect x="112" y="86" width="20" height="3" rx="1" fill="#374151" />
          {/* Mouth (animated) */}
          <rect
            x={88}
            y={130 - mouthH / 2}
            width="24"
            height={mouthH}
            rx={mouthH / 2}
            fill="#9b1c1c"
          />
          {/* Avatar specific accents */}
          {avatarType === "interview" ? (
            <rect x="60" y="160" width="80" height="20" rx="4" fill="#1f2937" />
          ) : (
            <rect x="55" y="160" width="90" height="20" rx="4" fill="#0f766e" />
          )}
        </svg>
        {isSpeaking && (
          <span className="absolute -right-1 -top-1 inline-flex items-center rounded-full bg-brand-500 px-2 py-0.5 text-xs text-white">
            말하는 중
          </span>
        )}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
      <button
        type="button"
        onClick={replay}
        className="text-xs text-brand-600 hover:underline"
      >
        다시 듣기
      </button>
    </div>
  );
}
