import type { SessionMessage, ScenarioType } from "./session";

export type ReportListItem = {
  id: string;
  scenario_type: ScenarioType;
  job?: string | null;
  title?: string | null;
  summary?: string | null;
  total_score?: number | null;
  created_at: string;
};

export type ReportDetail = {
  id: string;
  scenario_type: ScenarioType;
  job?: string | null;
  title?: string | null;
  summary?: string | null;
  total_score?: number | null;
  report_json: Record<string, unknown> & {
    title?: string;
    total_score?: number;
    summary?: string;
    scores?: Record<string, number>;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    next_practice?: string;
  };
  messages: SessionMessage[];
  created_at: string;
};
