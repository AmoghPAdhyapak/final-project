import { useEffect, useState } from "react";
import { StudentAPI } from "@/services/api";
import type { TimetableEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, MapPin, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const DAY_CLS = [
  { text:"text-primary", border:"border-primary/30", badge:"bg-primary/15 text-primary border border-primary/30", dot:"bg-primary" },
  { text:"text-success",  border:"border-success/30",  badge:"bg-success/15 text-success border border-success/30",   dot:"bg-success" },
  { text:"text-info",    border:"border-info/30",    badge:"bg-info/15 text-info border border-info/30",        dot:"bg-info" },
  { text:"text-warning",  border:"border-warning/30",  badge:"bg-warning/15 text-warning border border-warning/30",   dot:"bg-warning" },
  { text:"text-danger",   border:"border-danger/30",   badge:"bg-danger/15 text-danger border border-danger/30",      dot:"bg-danger" },
];

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(() => new Date().toLocaleDateString("en-US", { weekday: "long" }));

  useEffect(() => {
    StudentAPI.getProfile()
      .then((d) => setEntries(d.timetable))
      .catch(() => toast.error("Failed to load timetable."))
      .finally(() => setLoading(false));
  }, []);

  const grouped = DAYS.reduce<Record<string, TimetableEntry[]>>((acc, day) => {
    acc[day] = entries.filter((e) => e.day === day);
    return acc;
  }, {});

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40 bg-muted" />
      {[0,1,2].map(i => <Skeleton key={i} className="h-48 bg-muted rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair text-2xl md:text-3xl font-bold gold-text">Class Timetable</h1>
        <p className="text-muted-foreground text-sm mt-1">Weekly schedule with room assignments and instructor details.</p>
      </div>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <AlertTriangle className="w-10 h-10 mb-3 text-warning" />
          <p className="text-sm">No timetable data available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day, di) => {
            const slots = grouped[day];
            const isToday = day === today;
            const cls = DAY_CLS[di];
            return (
              <Card key={day} className={cn("palace-card", isToday && "shadow-gold", isToday && cls.border)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-playfair text-base">
                    <CalendarDays className={cn("w-4 h-4 shrink-0", cls.text)} />
                    <span className={cls.text}>{day}</span>
                    {isToday && <Badge className={cn("text-xs ml-1", cls.badge)}>Today</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {slots.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No classes scheduled.</p>
                  ) : (
                    <div className="space-y-3">
                      {slots.map((slot, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-secondary/30">
                          <div className={cn("w-1.5 h-full min-h-12 rounded-full shrink-0 mt-1", cls.dot)} />
                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="min-w-0"><p className="font-medium text-foreground text-sm">{slot.subject}</p></div>
                            <div className="flex items-center gap-1.5 min-w-0"><Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="text-muted-foreground text-xs truncate">{slot.slot}</span></div>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0"><MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="text-muted-foreground text-xs truncate">{slot.room}</span></div>
                              <div className="flex items-center gap-1.5 min-w-0"><User className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="text-muted-foreground text-xs truncate">{slot.instructor}</span></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
