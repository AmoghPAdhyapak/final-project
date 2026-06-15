import type {
  LoginResponse, DashboardResponse, AttendanceRecord,
  StudentProfile, TimetableEntry, AppNotification,
} from "@/types";

export const DEMO_SRN = "25SUUBEAML045";
export const DEMO_PASSWORD = "apa@123";

export const DEMO_LOGIN: LoginResponse = {
  status: "success",
  access_token: "demo-token-snpsu-local",
  student_meta: { srn: "25SUUBEAML045", name: "Amogh P Adhyapak", initials: "AP" },
};

const DEMO_NOTIFICATIONS_LIST: AppNotification[] = [
  { id: 1, priority: "critical", is_read: false,
    title: "Critical Attendance Warning",
    message: "Your attendance in Renewable Energy Sources has dropped to 61.1%. Immediate attendance required.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 2, priority: "warning", is_read: false,
    title: "IA-2 Schedule Released",
    message: "Internal Assessment 2 is scheduled from 25th June to 28th June. Review your syllabus coverage.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, priority: "info", is_read: false,
    title: "Assignment Submission Reminder",
    message: "Problem Solving with C Assignment 3 is due on 17th June. Submit before 11:59 PM.",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
  { id: 4, priority: "info", is_read: true,
    title: "Portal Updated",
    message: "SNPSU Academic Intelligence Portal has been updated with AI Mentor Chat features.",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
];

export const DEMO_DASHBOARD: DashboardResponse = {
  reactor_core: { score: 72, risk_level: "medium", overall_attendance_pct: 78.4, overall_internals_pct: 68.0, pass_probability: 74 },
  subjects: [
    { id: 1, subject_code: "25CSE201", subject_name: "Mathematics", attendance: 87.5, conducted: 40, attended: 35, status: "nominal", trend: [80, 82, 84, 86, 87.5], ia1: 18, ia2: 19, ia3: 20, assignments: 5, predicted: 38 },
    { id: 2, subject_code: "25CSE202", subject_name: "Problem Solving with C", attendance: 81.0, conducted: 42, attended: 34, status: "warning", trend: [75, 77, 79, 80, 81], ia1: 15, ia2: 16, ia3: 14, assignments: 4.5, predicted: 34 },
    { id: 3, subject_code: "25CSE203", subject_name: "Basic Electronics", attendance: 84.2, conducted: 38, attended: 32, status: "warning", trend: [78, 80, 82, 83, 84.2], ia1: 17, ia2: 15, ia3: 18, assignments: 4, predicted: 36 },
    { id: 4, subject_code: "25CSE204", subject_name: "Mechanical Engineering Systems", attendance: 82.5, conducted: 40, attended: 33, status: "warning", trend: [76, 78, 80, 81, 82.5], ia1: 14, ia2: 15, ia3: 16, assignments: 4.8, predicted: 30 },
    { id: 5, subject_code: "25CSE205", subject_name: "Renewable Energy Sources", attendance: 61.1, conducted: 36, attended: 22, status: "critical", trend: [70, 68, 65, 63, 61.1], ia1: 11, ia2: 12, ia3: 10, assignments: 4, predicted: 22 },
  ],
  analytics_charts: {
    attendance_trend: [
      { subject: "Mathematics", value: 87.5 }, { subject: "Problem Solving with C", value: 81.0 },
      { subject: "Basic Electronics", value: 84.2 }, { subject: "Mechanical Engg", value: 82.5 },
      { subject: "Renewable Energy", value: 61.1 },
    ],
    internals_comparison: [
      { subject: "Mathematics", ia1: 18, ia2: 19, ia3: 20, predicted: 38, attendance: 87.5 },
      { subject: "PSC", ia1: 15, ia2: 16, ia3: 14, predicted: 34, attendance: 81.0 },
      { subject: "Basic Electronics", ia1: 17, ia2: 15, ia3: 18, predicted: 36, attendance: 84.2 },
      { subject: "Mech Engg", ia1: 14, ia2: 15, ia3: 16, predicted: 30, attendance: 82.5 },
      { subject: "Renewable Energy", ia1: 11, ia2: 12, ia3: 10, predicted: 22, attendance: 61.1 },
    ],
    radar_data: [
      { subject: "Mathematics", score: 76 }, { subject: "PSC", score: 68 },
      { subject: "Basic Electronics", score: 72 }, { subject: "Mech Engg", score: 60 },
      { subject: "Renewable Energy", score: 44 },
    ],
    risk_data: [
      { name: "Mathematics", risk: 12.5 }, { name: "PSC", risk: 19 },
      { name: "Basic Electronics", risk: 15.8 }, { name: "Mech Engg", risk: 17.5 },
      { name: "Renewable Energy", risk: 38.9 },
    ],
  },
  notifications: DEMO_NOTIFICATIONS_LIST,
};

export const DEMO_ATTENDANCE: { records: AttendanceRecord[] } = {
  records: [
    { id: 1, subject_code: "25CSE201", subject_name: "Mathematics", conducted: 40, attended: 35, percentage: 87.5, status: "nominal", recovery_analysis: { current_attendance: 87.5, target_attendance: 75, classes_needed: 0, milestone_window: 14, recovery_probability: 100 } },
    { id: 2, subject_code: "25CSE202", subject_name: "Problem Solving with C", conducted: 42, attended: 34, percentage: 81.0, status: "warning", recovery_analysis: { current_attendance: 81.0, target_attendance: 75, classes_needed: 0, milestone_window: 14, recovery_probability: 100 } },
    { id: 3, subject_code: "25CSE203", subject_name: "Basic Electronics", conducted: 38, attended: 32, percentage: 84.2, status: "warning", recovery_analysis: { current_attendance: 84.2, target_attendance: 75, classes_needed: 0, milestone_window: 14, recovery_probability: 100 } },
    { id: 4, subject_code: "25CSE204", subject_name: "Mechanical Engineering Systems", conducted: 40, attended: 33, percentage: 82.5, status: "warning", recovery_analysis: { current_attendance: 82.5, target_attendance: 75, classes_needed: 0, milestone_window: 14, recovery_probability: 100 } },
    { id: 5, subject_code: "25CSE205", subject_name: "Renewable Energy Sources", conducted: 36, attended: 22, percentage: 61.1, status: "critical", recovery_analysis: { current_attendance: 61.1, target_attendance: 75, classes_needed: 14, milestone_window: 14, recovery_probability: 34 } },
  ],
};

export const DEMO_NOTIFICATIONS: { notifications: AppNotification[] } = { notifications: DEMO_NOTIFICATIONS_LIST };

export const DEMO_PROFILE: { profile: StudentProfile; timetable: TimetableEntry[] } = {
  profile: {
    srn: "25SUUBEAML045", name: "Amogh P Adhyapak", initials: "AP",
    department: "Computer Science Engineering",
    specialization: "Artificial Intelligence and Machine Learning",
    semester: "2", email: "amogh.adhyapak@snpsu.edu.in", phone: "+91 98765 43210",
  },
  timetable: [
    { day: "Monday",    slot: "09:00–10:00", subject: "Mathematics",                    room: "CSE-101", instructor: "Dr. R. Sharma" },
    { day: "Monday",    slot: "10:00–11:00", subject: "Problem Solving with C",         room: "CSELab1", instructor: "Prof. S. Kumar" },
    { day: "Monday",    slot: "11:15–12:15", subject: "Renewable Energy Sources",       room: "CSE-203", instructor: "Dr. K. Nair" },
    { day: "Tuesday",   slot: "09:00–10:00", subject: "Basic Electronics",              room: "ECE-201", instructor: "Dr. P. Reddy" },
    { day: "Tuesday",   slot: "10:00–11:00", subject: "Mathematics",                    room: "CSE-101", instructor: "Dr. R. Sharma" },
    { day: "Wednesday", slot: "09:00–10:00", subject: "Mechanical Engineering Systems", room: "MEC-102", instructor: "Prof. A. Singh" },
    { day: "Wednesday", slot: "11:15–12:15", subject: "Problem Solving with C",         room: "CSELab1", instructor: "Prof. S. Kumar" },
    { day: "Thursday",  slot: "09:00–10:00", subject: "Renewable Energy Sources",       room: "CSE-203", instructor: "Dr. K. Nair" },
    { day: "Thursday",  slot: "10:00–11:00", subject: "Basic Electronics",              room: "ECE-201", instructor: "Dr. P. Reddy" },
    { day: "Friday",    slot: "09:00–10:00", subject: "Mathematics",                    room: "CSE-101", instructor: "Dr. R. Sharma" },
    { day: "Friday",    slot: "10:00–11:00", subject: "Mechanical Engineering Systems", room: "MEC-102", instructor: "Prof. A. Singh" },
    { day: "Friday",    slot: "11:15–12:15", subject: "Renewable Energy Sources",       room: "CSE-203", instructor: "Dr. K. Nair" },
  ],
};
