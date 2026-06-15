export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface StudentMeta { name: string; srn: string; initials: string; }
export interface LoginResponse { status: string; access_token: string; student_meta: StudentMeta; }

// ── Profile ───────────────────────────────────────────────────────────────────
export interface StudentProfile {
  srn: string; name: string; department: string; specialization: string;
  semester: string; email: string; phone: string; initials: string;
}
export interface TimetableEntry { day: string; slot: string; subject: string; room: string; instructor: string; }

// ── Attendance ────────────────────────────────────────────────────────────────
export interface RecoveryAnalysis {
  current_attendance: number; target_attendance: number;
  classes_needed: number; milestone_window: number; recovery_probability: number;
}
export type AttendanceStatus = "nominal" | "warning" | "high_warning" | "critical";
export interface AttendanceRecord {
  id: number; subject_code: string; subject_name: string;
  conducted: number; attended: number; percentage: number;
  status: AttendanceStatus;
  recovery_analysis?: RecoveryAnalysis;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface ReactorCore {
  score: number; overall_attendance_pct: number; overall_internals_pct: number;
  risk_level: string; pass_probability: number;
}
export interface SubjectData {
  id: number; subject_code: string; subject_name: string;
  attendance: number; conducted: number; attended: number;
  status: string; trend: number[];
  ia1: number; ia2: number; ia3: number; assignments: number; predicted: number;
}
export interface AttendanceTrendPoint  { subject: string; value: number; }
export interface InternalsComparisonPoint {
  subject: string; ia1: number; ia2: number; ia3: number;
  predicted: number; attendance: number;
}
export interface RadarDataPoint { subject: string; score: number; }
export interface RiskDataPoint  { name: string; risk: number; }
export interface AnalyticsCharts {
  attendance_trend: AttendanceTrendPoint[];
  internals_comparison: InternalsComparisonPoint[];
  radar_data: RadarDataPoint[];
  risk_data: RiskDataPoint[];
}
export interface DashboardResponse {
  reactor_core: ReactorCore;
  subjects: SubjectData[];
  analytics_charts: AnalyticsCharts;
  notifications: AppNotification[];
}

// ── Notifications ─────────────────────────────────────────────────────────────
export type NotificationPriority = "critical" | "warning" | "info" | "success";
export interface AppNotification {
  id?: number; priority: NotificationPriority;
  title: string; message: string;
  is_read?: boolean; timestamp?: string;
}

// ── AI Mentor Insights ────────────────────────────────────────────────────────
export interface MentorInsights {
  weakness_analysis: string; four_week_recovery_plan: string;
  study_directives: string; action_plan: string; _note?: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id?: number;
  role: "user" | "model";
  message: string;
  timestamp?: string;
}
export interface ChatResponse { reply: string; role: "model"; }

// ── Risk ──────────────────────────────────────────────────────────────────────
export type RiskLevel = "low" | "medium" | "high";
export interface AcademicRisk {
  risk_level: RiskLevel;
  core_score: number;
  attendance_avg: number;
  critical_subjects: string[];
  warning_subjects: string[];
  low_mark_subjects: string[];
  recommendations: string[];
}

// ── Weakness ──────────────────────────────────────────────────────────────────
export interface WeakSubject {
  subject: string; code: string;
  attendance: number; predicted_marks: number | null;
  risk_factors: string[];
}
export interface WeaknessReport {
  weak_subjects: WeakSubject[];
  attendance_issues: Array<{
    subject: string; code: string; percentage: number;
    status: string; recovery: RecoveryAnalysis;
  }>;
  performance_gaps: Array<{
    subject: string; code: string; predicted: number; max: number; gap: number;
  }>;
  suggestions: string[];
}

// ── Smart Insights ────────────────────────────────────────────────────────────
export interface SmartInsights {
  strongest_subject_attendance: { name: string; value: number };
  weakest_subject_attendance:   { name: string; value: number };
  strongest_subject_marks:      { name: string; value: number };
  weakest_subject_marks:        { name: string; value: number };
  attendance_trend: "improving" | "declining" | "stable";
  subjects_above_85: number;
  total_subjects: number;
  semester_health: "Strong" | "Moderate" | "Weak";
}

// ── Study Planner ─────────────────────────────────────────────────────────────
export interface DayPlan { classes: string[]; study_tasks: string[]; }
export interface StudyPlan { plan: Record<string, DayPlan>; narrative: string; }

// ── Marks Simulator ───────────────────────────────────────────────────────────
export interface SimulatorScenario { target: number; ia3_required: number; achievable: boolean; }
export interface SimulatorResult {
  current_predicted: number;
  improvement_scenarios: SimulatorScenario[];
  improvement_potential: number;
}

// ── Testing ───────────────────────────────────────────────────────────────────
export interface TestingStatus { test_mode: boolean; }
