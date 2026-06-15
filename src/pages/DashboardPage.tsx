import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StudentAPI, InsightsAPI } from "@/services/api";
import type { DashboardResponse, SmartInsights } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import {
  Activity, AlertTriangle, CheckCircle2, Info, TrendingUp, TrendingDown,
  BookOpen, Zap, Target, ShieldAlert, Bot, Sparkles, ArrowRight,
  Award, BarChart2, Minus,
} from "lucide-react";
import { toast } from "sonner";
import { cn }    from "@/lib/utils";

const STATUS_CLASS: Record<string, { badge: string; text: string }> = {
  nominal:      { badge: "status-nominal-bg text-success border",          text: "text-success"     },
  warning:      { badge: "status-shortage-bg text-warning border",         text: "text-warning"     },
  high_warning: { badge: "bg-orange-500/15 text-orange-500 border",        text: "text-orange-500"  },
  critical:     { badge: "status-critical-bg text-danger border",          text: "text-danger"      },
};

function ReactorOrb({ score }: { score: number }) {
  const color = score >= 75 ? "text-success" : score >= 55 ? "text-warning" : "text-danger";
  const ring  = score >= 75 ? "border-success/40" : score >= 55 ? "border-warning/40" : "border-danger/40";
  const glow  = score >= 75
    ? "shadow-[0_0_32px_hsl(142_69%_45%/0.3)]"
    : score >= 55
    ? "shadow-[0_0_32px_hsl(38_92%_50%/0.3)]"
    : "shadow-[0_0_32px_hsl(0_72%_51%/0.3)]";
  return (
    <div className={cn("relative flex items-center justify-center w-36 h-36 rounded-full border-4 bg-card", ring, glow)}>
      <div className="absolute inset-2 rounded-full border border-border animate-orb-spin opacity-30" style={{ borderStyle: "dashed" }} />
      <div className="text-center z-10">
        <span className={cn("font-playfair text-4xl font-bold", color)}>{score}</span>
        <p className="text-muted-foreground text-xs mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

function NotifIcon({ priority }: { priority: string }) {
  if (priority === "critical") return <ShieldAlert  className="w-4 h-4 text-danger  shrink-0 mt-0.5" />;
  if (priority === "warning")  return <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />;
  if (priority === "success")  return <CheckCircle2  className="w-4 h-4 text-success shrink-0 mt-0.5" />;
  return <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />;
}

function SmartInsightCards({ insights }: { insights: SmartInsights }) {
  const TrendIcon =
    insights.attendance_trend === "improving" ? TrendingUp :
    insights.attendance_trend === "declining" ? TrendingDown : Minus;

  const trendCls =
    insights.attendance_trend === "improving" ? "text-success" :
    insights.attendance_trend === "declining" ? "text-danger"  : "text-muted-foreground";

  const healthCls =
    insights.semester_health === "Strong"   ? "text-success" :
    insights.semester_health === "Moderate" ? "text-warning"  : "text-danger";

  return (
    <div>
      <h2 className="font-playfair text-lg font-semibold text-foreground mb-3 flex items-center gap-2 text-balance">
        <Sparkles className="w-4 h-4 text-primary" />
        Smart Academic Insights
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="palace-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-success shrink-0" />
              <p className="text-xs text-muted-foreground">Best Attendance</p>
            </div>
            <p className="font-semibold text-sm text-foreground text-balance truncate">
              {insights.strongest_subject_attendance.name}
            </p>
            <p className="text-success font-bold text-lg">{insights.strongest_subject_attendance.value}%</p>
          </CardContent>
        </Card>

        <Card className="palace-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-danger shrink-0" />
              <p className="text-xs text-muted-foreground">Needs Attention</p>
            </div>
            <p className="font-semibold text-sm text-foreground text-balance truncate">
              {insights.weakest_subject_attendance.name}
            </p>
            <p className="text-danger font-bold text-lg">{insights.weakest_subject_attendance.value}%</p>
          </CardContent>
        </Card>

        <Card className="palace-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendIcon className={cn("w-4 h-4 shrink-0", trendCls)} />
              <p className="text-xs text-muted-foreground">Trend</p>
            </div>
            <p className={cn("font-semibold text-sm capitalize", trendCls)}>
              {insights.attendance_trend}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {insights.subjects_above_85}/{insights.total_subjects} above 85%
            </p>
          </CardContent>
        </Card>

        <Card className="palace-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">Semester Health</p>
            </div>
            <p className={cn("font-bold text-lg", healthCls)}>{insights.semester_health}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Best marks: {insights.strongest_subject_marks.name}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { studentMeta }                 = useAuth();
  const [data,     setData]             = useState<DashboardResponse | null>(null);
  const [insights, setInsights]         = useState<SmartInsights | null>(null);
  const [loading,  setLoading]          = useState(true);

  useEffect(() => {
    Promise.all([
      StudentAPI.getDashboard(),
      InsightsAPI.getSmart().catch(() => null),
    ])
      .then(([dash, smart]) => {
        setData(dash);
        if (smart) setInsights(smart);
      })
      .catch(() => toast.error("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-56 bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 bg-muted rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 bg-muted rounded-2xl" />
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      <AlertTriangle className="w-10 h-10 mb-3 text-warning" />
      <p className="text-sm">Could not load dashboard. Ensure the Flask backend is running.</p>
    </div>
  );

  const { reactor_core, subjects, analytics_charts, notifications } = data;
  const riskCls =
    reactor_core.risk_level === "low"    ? "text-success" :
    reactor_core.risk_level === "medium" || reactor_core.risk_level === "moderate" ? "text-warning" :
    "text-danger";

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair text-2xl md:text-3xl font-bold gold-text text-balance">
          Academic Intelligence Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1 text-pretty">
          Welcome back, {studentMeta?.name ?? "Student"}. Your academic reactor status is live.
        </p>
      </div>

      {/* AI Chat banner */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border border-primary/30 bg-primary/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-primary" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-success flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-success-foreground" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground text-balance">
              AI Academic Mentor is active
              <Badge className="ml-2 text-[10px] bg-primary/20 text-primary border-primary/30">
                Gemini 1.5 Flash
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground text-pretty">
              Personalised recovery plans, weakness analysis & live chat — powered by AI.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="ghost"
          className="border border-primary/30 text-primary hover:bg-primary/10 shrink-0">
          <Link to="/chat">Chat <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
        </Button>
      </div>

      {/* Smart Insights */}
      {insights && <SmartInsightCards insights={insights} />}

      {/* Reactor Core */}
      <Card className="palace-card shadow-royal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair text-lg text-balance">
            <Zap className="w-5 h-5 text-primary" />
            Academic Reactor Core
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ReactorOrb score={reactor_core.score} />
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Attendance",       value: `${reactor_core.overall_attendance_pct}%`, icon: Activity,    cls: "text-primary" },
                  { label: "Internals",        value: `${reactor_core.overall_internals_pct}%`,  icon: BookOpen,    cls: "text-primary" },
                  { label: "Pass Probability", value: `${reactor_core.pass_probability}%`,        icon: Target,      cls: "text-primary" },
                  { label: "Risk Level",       value: reactor_core.risk_level,                   icon: ShieldAlert, cls: riskCls        },
                ].map(({ label, value, icon: Icon, cls }) => (
                  <div key={label} className="rounded-xl border border-border bg-secondary/40 p-3">
                    <Icon className={`w-4 h-4 mb-1.5 ${cls}`} />
                    <p className={`font-semibold text-sm capitalize ${cls}`}>{value}</p>
                    <p className="text-muted-foreground text-xs">{label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Attendance</span><span>{reactor_core.overall_attendance_pct}%</span>
                </div>
                <Progress value={reactor_core.overall_attendance_pct} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Internal Performance</span><span>{reactor_core.overall_internals_pct}%</span>
                </div>
                <Progress value={reactor_core.overall_internals_pct} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="palace-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-playfair text-base text-balance">Performance Radar</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="w-full min-w-0 overflow-hidden h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics_charts.radar_data}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="palace-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-playfair text-base text-balance">Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="w-full min-w-0 overflow-hidden h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics_charts.attendance_trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <XAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--primary))" }}
                    formatter={(v: number) => [`${v}%`, "Attendance"]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {analytics_charts.attendance_trend.map((entry, i) => (
                      <Cell key={i} fill={
                        entry.value >= 85 ? "hsl(142 69% 45%)" :
                        entry.value >= 80 ? "hsl(38 92% 50%)"  :
                        entry.value >= 75 ? "hsl(25 95% 53%)"  :
                        "hsl(0 72% 51%)"
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects */}
      <div>
        <h2 className="font-playfair text-lg font-semibold text-foreground mb-3 text-balance">
          Subject Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <Card key={s.id} className="palace-card h-full flex flex-col">
              <CardContent className="pt-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-foreground font-semibold text-sm text-balance">{s.subject_name}</p>
                    <p className="text-muted-foreground text-xs">{s.subject_code}</p>
                  </div>
                  <Badge className={`shrink-0 text-xs ${STATUS_CLASS[s.status]?.badge ?? ""}`}>
                    {s.status === "high_warning" ? "High Warning" :
                     s.status === "nominal" ? "Good" : s.status}
                  </Badge>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Attendance</span>
                    <span className="font-medium text-foreground">{s.attendance}%</span>
                  </div>
                  <Progress value={s.attendance} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Predicted Marks</span>
                    <span className="font-medium text-foreground">{s.predicted}/50</span>
                  </div>
                  <Progress value={(s.predicted / 50) * 100} className="h-1.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {s.attended}/{s.conducted} classes attended
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <Card className="palace-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair text-base text-balance">
            <TrendingUp className="w-4 h-4 text-primary" />
            Academic Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-secondary/30">
              <NotifIcon priority={n.priority} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground text-balance">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{n.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
