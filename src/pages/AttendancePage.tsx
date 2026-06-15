import { useEffect, useState } from "react";
import { AttendanceAPI } from "@/services/api";
import type { AttendanceRecord } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ClipboardList, AlertTriangle, CheckCircle2, Loader2, ShieldAlert, Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn }    from "@/lib/utils";

const STATUS_META: Record<string, {
  label: string; textCls: string; bgCls: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  nominal: {
    label: "Good",
    textCls: "text-success",
    bgCls: "status-nominal-bg",
    icon: CheckCircle2,
  },
  warning: {
    label: "Warning",
    textCls: "text-warning",
    bgCls: "status-shortage-bg",
    icon: AlertTriangle,
  },
  high_warning: {
    label: "High Warning",
    textCls: "text-orange-500",
    bgCls: "bg-orange-500/15 border-orange-500/35",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical",
    textCls: "text-danger",
    bgCls: "status-critical-bg",
    icon: ShieldAlert,
  },
};

function AttendanceIntelligenceBanner({ records }: { records: AttendanceRecord[] }) {
  const critical     = records.filter((r) => r.status === "critical");
  const high_warning = records.filter((r) => r.status === "high_warning");
  const warning      = records.filter((r) => r.status === "warning");

  if (!critical.length && !high_warning.length && !warning.length) return null;

  return (
    <div className="space-y-2">
      {critical.map((r) => (
        <div key={r.id} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-danger/40 bg-danger/10">
          <ShieldAlert className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-danger">Critical: {r.subject_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {r.percentage}% attendance —{" "}
              {r.recovery_analysis?.classes_needed ?? "?"} consecutive classes needed to reach 75%.
              Recovery probability: {r.recovery_analysis?.recovery_probability ?? "?"}%.
            </p>
          </div>
        </div>
      ))}
      {high_warning.map((r) => (
        <div key={r.id} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-orange-500/40 bg-orange-500/10">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-orange-500">High Warning: {r.subject_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {r.percentage}% attendance — approaching the critical 75% threshold.
            </p>
          </div>
        </div>
      ))}
      {warning.map((r) => (
        <div key={r.id} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-warning/40 bg-warning/10">
          <Info className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warning">Warning: {r.subject_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {r.percentage}% attendance — recommended minimum is 85%.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SimulatorDialog({ record }: { record: AttendanceRecord }) {
  const [extra,   setExtra]   = useState("5");
  const [result,  setResult]  = useState<{ new_percentage: number; new_status: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const n = parseInt(extra, 10);
    if (isNaN(n) || n < 0) { toast.error("Enter a valid number of classes."); return; }
    setLoading(true);
    try {
      const res = await AttendanceAPI.simulate(record.id, n);
      setResult(res);
    } catch {
      toast.error("Simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const sm = result ? STATUS_META[result.new_status] ?? STATUS_META.nominal : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"
          className="text-primary hover:text-primary border border-primary/30 hover:bg-primary/10 h-8 text-xs">
          Simulate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-playfair text-balance">Attendance Simulator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground text-pretty">
            See how attending additional consecutive classes changes your status for{" "}
            <span className="text-foreground font-medium">{record.subject_name}</span>.
          </p>
          {/* Threshold legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { range: "≥ 85%",  label: "Good",         cls: "text-success"     },
              { range: "80–85%", label: "Warning",       cls: "text-warning"     },
              { range: "75–80%", label: "High Warning",  cls: "text-orange-500"  },
              { range: "< 75%",  label: "Critical",      cls: "text-danger"      },
            ].map((t) => (
              <div key={t.range} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border bg-secondary/30">
                <span className={cn("font-bold", t.cls)}>{t.range}</span>
                <span className="text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-normal">Additional classes to attend</Label>
            <Input
              type="number" min="0" max="100"
              value={extra}
              onChange={(e) => { setExtra(e.target.value); setResult(null); }}
              className="px-3 text-base"
            />
          </div>
          <Button onClick={run} disabled={loading} className="w-full h-9">
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Simulating…</>
              : "Run Simulation"
            }
          </Button>
          {result && sm && (
            <div className={cn("rounded-xl border p-4 space-y-2", sm.bgCls)}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Projected Attendance</span>
                <span className="font-bold text-foreground">{result.new_percentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Projected Status</span>
                <Badge className={cn("text-xs border", sm.bgCls, sm.textCls)}>{sm.label}</Badge>
              </div>
              <Progress value={result.new_percentage} className="h-2 mt-1" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AttendanceAPI.getLedger()
      .then((d) => setRecords(d.records))
      .catch(() => toast.error("Failed to load attendance."))
      .finally(() => setLoading(false));
  }, []);

  const nominal      = records.filter((r) => r.status === "nominal").length;
  const warning      = records.filter((r) => r.status === "warning").length;
  const high_warning = records.filter((r) => r.status === "high_warning").length;
  const critical     = records.filter((r) => r.status === "critical").length;

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 bg-muted" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map((i) => <Skeleton key={i} className="h-24 bg-muted rounded-2xl" />)}
      </div>
      {[0,1,2,3,4].map((i) => <Skeleton key={i} className="h-32 bg-muted rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair text-2xl md:text-3xl font-bold gold-text text-balance">
          Attendance Ledger
        </h1>
        <p className="text-muted-foreground text-sm mt-1 text-pretty">
          Track attendance, recovery requirements and simulate future scenarios.
          Warning ≥80% · Good ≥85%.
        </p>
      </div>

      {/* Intelligence banners */}
      <AttendanceIntelligenceBanner records={records} />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Good",         count: nominal,      icon: CheckCircle2, cls: "text-success"     },
          { label: "Warning",      count: warning,      icon: AlertTriangle, cls: "text-warning"    },
          { label: "High Warning", count: high_warning, icon: AlertTriangle, cls: "text-orange-500" },
          { label: "Critical",     count: critical,     icon: ShieldAlert,  cls: "text-danger"      },
        ].map(({ label, count, icon: Icon, cls }) => (
          <Card key={label} className="palace-card h-full">
            <CardContent className="pt-4 flex flex-col items-center text-center">
              <Icon className={cn("w-5 h-5 mb-1.5", cls)} />
              <p className={cn("text-2xl font-bold font-playfair", cls)}>{count}</p>
              <p className="text-muted-foreground text-xs">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-4">
        {records.map((r) => {
          const sm   = STATUS_META[r.status] ?? STATUS_META.nominal;
          const rec  = r.recovery_analysis;
          const Icon = sm.icon;
          return (
            <Card key={r.id} className="palace-card">
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-balance">{r.subject_name}</p>
                    <p className="text-muted-foreground text-xs">{r.subject_code}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn("text-xs border flex items-center gap-1", sm.bgCls, sm.textCls)}>
                      <Icon className="w-3 h-3" />{sm.label}
                    </Badge>
                    <SimulatorDialog record={r} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{r.attended} / {r.conducted} classes attended</span>
                    <span className="font-semibold text-foreground">{r.percentage}%</span>
                  </div>
                  <Progress value={r.percentage} className="h-2.5" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span className="text-danger">75% min</span>
                    <span className="text-orange-500">80%</span>
                    <span className="text-success">85% target</span>
                    <span>100%</span>
                  </div>
                </div>

                {rec && r.status !== "nominal" && (
                  <div className="rounded-xl border border-border bg-muted/40 p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Classes Needed</p>
                      <p className={cn("font-bold text-sm",
                        rec.classes_needed > 0 ? "text-warning" : "text-success")}>
                        {rec.classes_needed === 0 ? "None" : rec.classes_needed}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recovery Window</p>
                      <p className="font-bold text-sm text-foreground">{rec.milestone_window} classes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recovery Probability</p>
                      <p className={cn("font-bold text-sm",
                        rec.recovery_probability >= 70 ? "text-success" :
                        rec.recovery_probability >= 40 ? "text-warning" : "text-danger")}>
                        {rec.recovery_probability}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-bold text-sm text-foreground">{rec.target_attendance}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {records.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mb-3" />
          <p className="text-sm">No attendance records found.</p>
        </div>
      )}
    </div>
  );
}
