export type ImportanceLevel = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "completed";
export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type BurnoutRiskLevel = "low" | "moderate" | "high" | "extreme";
export type CoachPersona = "gentle" | "drill-sergeant" | "analytical" | "stoic";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  deadline: string; // ISO String
  estimatedHours: number;
  importanceLevel: ImportanceLevel;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;

  // AI-generated metrics
  failureProbability?: number; // 0-100
  riskLevel?: RiskLevel;
  failureReasons?: string[];
  panicScore?: number; // 0-100
  rescuePlan?: string; // Markdown
  consequences?: string; // Markdown
  futureCompleted?: string;
  futureIgnored?: string;
  lastAnalyzedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  coachPersona: CoachPersona;
  burnoutRisk?: BurnoutRiskLevel;
  burnoutAdvice?: string;
}
