export type ChatMessage = {
  id?: string;
  role: "ai" | "user";
  content: string;
  originalSttText?: string;
  correctedText?: string;
  turnIndex: number;
};
