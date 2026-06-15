import axios from "axios";
import type {
  LoginResponse, DashboardResponse, AttendanceRecord,
  StudentProfile, TimetableEntry, AppNotification, MentorInsights,
  ChatMessage, ChatResponse, AcademicRisk, WeaknessReport,
  SmartInsights, StudyPlan, SimulatorResult, TestingStatus,
} from "@/types";
import {
  DEMO_SRN, DEMO_PASSWORD, DEMO_LOGIN,
  DEMO_DASHBOARD, DEMO_ATTENDANCE, DEMO_PROFILE,
  DEMO_NOTIFICATIONS,
} from "@/services/mockData";

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? "/api";
const http = axios.create({ baseURL: BASE_URL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("snpsu_token");
  if (token && token !== "demo-token-snpsu-local") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("snpsu_token");
      localStorage.removeItem("snpsu_meta");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

const isDemoToken = () => localStorage.getItem("snpsu_token") === "demo-token-snpsu-local";
function demodelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export const AuthAPI = {
  login: async (srn: string, password: string): Promise<LoginResponse> => {
    if (srn.trim().toUpperCase() === DEMO_SRN && password.trim() === DEMO_PASSWORD) {
      return demodelay(DEMO_LOGIN, 600);
    }
    return http.post<LoginResponse>("/auth/login", { srn, password }).then((r) => r.data);
  },
};

export const StudentAPI = {
  getDashboard: async (): Promise<DashboardResponse> => {
    if (isDemoToken()) return demodelay(DEMO_DASHBOARD);
    return http.get<DashboardResponse>("/student/dashboard").then((r) => r.data);
  },
  getProfile: async (): Promise<{ profile: StudentProfile; timetable: TimetableEntry[] }> => {
    if (isDemoToken()) return demodelay(DEMO_PROFILE);
    return http.get<{ profile: StudentProfile; timetable: TimetableEntry[] }>("/student/profile").then((r) => r.data);
  },
};

export const AttendanceAPI = {
  getLedger: async (): Promise<{ records: AttendanceRecord[] }> => {
    if (isDemoToken()) return demodelay(DEMO_ATTENDANCE);
    return http.get<{ records: AttendanceRecord[] }>("/attendance/ledger").then((r) => r.data);
  },
  simulate: async (subject_id: number, additional_classes: number): Promise<{ new_percentage: number; new_status: string }> => {
    if (isDemoToken()) {
      const rec = DEMO_ATTENDANCE.records.find((r) => r.id === subject_id);
      if (rec) {
        const newAtt = rec.attended + additional_classes;
        const newCond = rec.conducted + additional_classes;
        const newPct = parseFloat(((newAtt / newCond) * 100).toFixed(2));
        const newStatus = newPct >= 85 ? "nominal" : newPct >= 80 ? "warning" : newPct >= 75 ? "high_warning" : "critical";
        return demodelay({ new_percentage: newPct, new_status: newStatus });
      }
    }
    return http.post<{ new_percentage: number; new_status: string }>("/attendance/simulate", { subject_id, additional_classes }).then((r) => r.data);
  },
};

const demoNotifications = [...DEMO_NOTIFICATIONS.notifications];
export const NotificationsAPI = {
  getAll: async (): Promise<{ notifications: AppNotification[] }> => {
    if (isDemoToken()) return demodelay({ notifications: demoNotifications });
    return http.get<{ notifications: AppNotification[] }>("/notifications").then((r) => r.data);
  },
  markRead: async (id: number): Promise<void> => {
    if (isDemoToken()) {
      const n = demoNotifications.find((x) => x.id === id);
      if (n) n.is_read = true;
      return demodelay(undefined);
    }
    return http.patch(`/notifications/${id}/read`).then((r) => r.data);
  },
};

export const MentorAPI = {
  getInsights: async (): Promise<{ insights: MentorInsights }> =>
    http.get<{ insights: MentorInsights }>("/ai-mentor/insights").then((r) => r.data),
};

export const ChatAPI = {
  send: async (message: string): Promise<ChatResponse> => {
    if (isDemoToken()) {
      return demodelay({ reply: "I am the SNPSU Academic Mentor AI. Connect the backend for live AI responses. (Demo mode)", role: "model" as const }, 800);
    }
    return http.post<ChatResponse>("/chat/send", { message }).then((r) => r.data);
  },
  getHistory: async (): Promise<{ history: ChatMessage[] }> => {
    if (isDemoToken()) return demodelay({ history: [] });
    return http.get<{ history: ChatMessage[] }>("/chat/history").then((r) => r.data);
  },
  clearHistory: async (): Promise<void> => {
    if (isDemoToken()) return demodelay(undefined);
    return http.delete("/chat/history").then((r) => r.data);
  },
};

export const InsightsAPI = {
  getRisk: async (): Promise<AcademicRisk> => {
    if (isDemoToken()) return demodelay({ risk_level: "medium" as const, core_score: 72, attendance_avg: 78.4, critical_subjects: ["Renewable Energy Sources"], warning_subjects: [], low_mark_subjects: ["Renewable Energy Sources"], recommendations: ["Increase attendance in warning subjects.", "Focus revision on upcoming IA sessions."] });
    return http.get<AcademicRisk>("/insights/risk").then((r) => r.data);
  },
  getWeakness: async (): Promise<WeaknessReport> => {
    if (isDemoToken()) return demodelay({ weak_subjects: [{ subject: "Renewable Energy Sources", code: "25CSE205", attendance: 61.1, predicted_marks: 22, risk_factors: ["low_attendance", "low_marks"] }], attendance_issues: [], performance_gaps: [], suggestions: ["Renewable Energy Sources: Critical — attend all classes immediately."] });
    return http.get<WeaknessReport>("/insights/weakness").then((r) => r.data);
  },
  getSmart: async (): Promise<SmartInsights> => {
    if (isDemoToken()) return demodelay({ strongest_subject_attendance: { name: "Mathematics", value: 87.5 }, weakest_subject_attendance: { name: "Renewable Energy Sources", value: 61.1 }, strongest_subject_marks: { name: "Mathematics", value: 38 }, weakest_subject_marks: { name: "Renewable Energy Sources", value: 22 }, attendance_trend: "stable" as const, subjects_above_85: 1, total_subjects: 5, semester_health: "Moderate" as const });
    return http.get<SmartInsights>("/insights/smart").then((r) => r.data);
  },
  getPlanner: async (): Promise<StudyPlan> => {
    if (isDemoToken()) return demodelay({ plan: { Monday: { classes: ["Mathematics", "PSC", "Renewable Energy"], study_tasks: ["Dedicate 1.5h to Renewable Energy revision."] }, Tuesday: { classes: ["Basic Electronics", "Mathematics"], study_tasks: ["Dedicate 1.5h to Renewable Energy revision."] }, Wednesday: { classes: ["Mech Engineering", "PSC"], study_tasks: ["Dedicate 1.5h to Renewable Energy revision."] }, Thursday: { classes: ["Renewable Energy", "Basic Electronics"], study_tasks: ["Pre-read Renewable Energy before class."] }, Friday: { classes: ["Mathematics", "Mech Engineering", "Renewable Energy"], study_tasks: ["Review Renewable Energy notes after class."] }, Saturday: { classes: [], study_tasks: ["Revise pending assignments."] }, Sunday: { classes: [], study_tasks: ["Practise past papers."] } }, narrative: "Focus heavily on Renewable Energy Sources this week." });
    return http.get<StudyPlan>("/insights/planner").then((r) => r.data);
  },
  simulateMarks: async (ia1: number, ia2: number, ia3: number, assignments: number): Promise<SimulatorResult> => {
    if (isDemoToken()) {
      const best2 = [ia1, ia2, ia3].sort((a, b) => b - a).slice(0, 2);
      const current = Math.min(50, best2[0] + best2[1] + assignments);
      return demodelay({ current_predicted: current, improvement_scenarios: [30, 35, 40, 45, 50].map((t) => ({ target: t, ia3_required: Math.max(0, Math.min(20, t - (best2[0] + best2[1] + assignments))), achievable: t - (best2[0] + best2[1] + assignments) <= 20 })), improvement_potential: 50 - current });
    }
    return http.post<SimulatorResult>("/insights/simulator", { ia1, ia2, ia3, assignments }).then((r) => r.data);
  },
};

export const TestingAPI = {
  getStatus: async (): Promise<TestingStatus> =>
    http.get<TestingStatus>("/testing/status").then((r) => r.data).catch(() => ({ test_mode: false })),
};
