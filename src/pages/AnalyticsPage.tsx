import { useEffect, useState } from "react";
import { StudentAPI } from "@/services/api";
import type { DashboardResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { BarChart2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const GOLD = "hsl(43 54% 54%)";
const GOLD_SOFT = "hsl(43 54% 78%)";
const GREEN = "hsl(142 69% 45%)";
const BLUE = "hsl(210 100% 56%)";
const TT = { contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }, labelStyle: { color: "hsl(var(--foreground))" }, itemStyle: { color: "hsl(var(--muted-foreground))" } };
const LINE_COLORS = [GOLD, GREEN, BLUE, "hsl(280 65% 60%)", "hsl(0 72% 51%)"];

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.getDashboard()
      .then(setData)
      .catch(() => toast.error("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40 bg-muted" />
      {[0,1,2].map(i => <Skeleton key={i} className="h-72 bg-muted rounded-2xl" />)}
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      <AlertTriangle className="w-10 h-10 mb-3 text-warning" />
      <p className="text-sm">Could not load analytics data.</p>
    </div>
  );

  const { analytics_charts } = data;
  const weeklyData = [1,2,3,4].map(w => {
    const point: Record<string, number|string> = { week: `Week ${w}` };
    data.subjects.forEach(s => { point[s.subject_name.split(" ")[0]] = s.trend[w-1] ?? 0; });
    return point;
  });
  const subjectKeys = data.subjects.map(s => s.subject_name.split(" ")[0]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair text-2xl md:text-3xl font-bold gold-text">Academic Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Deep-dive charts across attendance, internal marks and weekly trajectory.</p>
      </div>
      <Card className="palace-card">
        <CardHeader><CardTitle className="font-playfair text-base flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" />Internal Marks Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="w-full min-w-0 overflow-hidden h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics_charts.internals_comparison} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis domain={[0, 20]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                <Bar dataKey="ia1" name="IA-1" fill={GOLD} radius={[4,4,0,0]} />
                <Bar dataKey="ia2" name="IA-2" fill={GOLD_SOFT} radius={[4,4,0,0]} />
                <Bar dataKey="ia3" name="IA-3" fill={GREEN} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="palace-card">
        <CardHeader><CardTitle className="font-playfair text-base">Weekly Attendance Trajectory</CardTitle></CardHeader>
        <CardContent>
          <div className="w-full min-w-0 overflow-hidden h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip {...TT} formatter={(v: number) => [`${v}%`]} />
                <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                {subjectKeys.map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="palace-card">
          <CardHeader><CardTitle className="font-playfair text-base">Performance Radar</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full min-w-0 overflow-hidden h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics_charts.radar_data}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Radar name="Score" dataKey="score" stroke={GOLD} fill={GOLD} fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="palace-card">
          <CardHeader><CardTitle className="font-playfair text-base">Risk Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full min-w-0 overflow-hidden h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics_charts.risk_data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <XAxis type="number" domain={[0,50]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={64} />
                  <Tooltip {...TT} formatter={(v: number) => [`${v}`, "Risk Score"]} />
                  <Bar dataKey="risk" fill="hsl(0 72% 51%)" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
