/** Lightweight wrapper around the Web Speech API. */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: () => void;
};

export function speak(text: string, opts: SpeakOptions = {}): () => void {
  if (!isSpeechSupported()) {
    opts.onStart?.();
    setTimeout(() => opts.onEnd?.(), 600);
    return () => undefined;
  }
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = opts.lang ?? "ko-KR";
  utt.rate = opts.rate ?? 1;
  utt.pitch = opts.pitch ?? 1;
  utt.onstart = () => opts.onStart?.();
  utt.onend = () => opts.onEnd?.();
  utt.onerror = () => opts.onEnd?.();
  utt.onboundary = () => opts.onBoundary?.();

  // Cancel ongoing speech for clean re-trigger
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);

  return () => {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // no-op
    }
  };
}
