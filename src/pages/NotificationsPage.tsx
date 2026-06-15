import { useEffect, useState } from "react";
import { NotificationsAPI } from "@/services/api";
import type { AppNotification } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PRIORITY_META = {
  critical: { label: "Critical", icon: ShieldAlert, color: "text-danger", bgCls: "status-critical-bg" },
  warning:  { label: "Warning",  icon: AlertTriangle, color: "text-warning", bgCls: "status-shortage-bg" },
  info:     { label: "Info",     icon: Info,          color: "text-info",    bgCls: "bg-info/10 border-info/30" },
  success:  { label: "Success",  icon: CheckCircle2,  color: "text-success", bgCls: "status-nominal-bg" },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<Set<number>>(new Set());

  useEffect(() => {
    NotificationsAPI.getAll()
      .then((d) => setNotifs(d.notifications))
      .catch(() => toast.error("Failed to load notifications."))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    setMarking((prev) => new Set(prev).add(id));
    try {
      await NotificationsAPI.markRead(id);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch { toast.error("Failed to mark as read."); }
    finally { setMarking((prev) => { const s = new Set(prev); s.delete(id); return s; }); }
  };

  const markAllRead = async () => {
    const unread = notifs.filter((n) => !n.is_read && n.id != null);
    await Promise.all(unread.map((n) => markRead(n.id!)));
    toast.success("All notifications marked as read.");
  };

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 bg-muted" />
      {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 bg-muted rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold gold-text">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All notifications read"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="border border-primary/30 text-primary hover:bg-primary/10 shrink-0">
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>
      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Bell className="w-10 h-10 mb-3" />
          <p className="text-sm">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n, i) => {
            const meta = PRIORITY_META[n.priority] ?? PRIORITY_META.info;
            const Icon = meta.icon;
            return (
              <Card key={n.id ?? i} className={cn("palace-card transition-all border", n.is_read ? "opacity-60" : meta.bgCls)}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", meta.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-foreground font-medium text-sm">{n.title}</span>
                        <Badge className={cn("text-xs border", meta.bgCls, meta.color)}>{meta.label}</Badge>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-muted-foreground text-xs">{n.message}</p>
                      {n.timestamp && (
                        <p className="text-muted-foreground text-xs mt-1.5">
                          {new Date(n.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      )}
                    </div>
                    {!n.is_read && n.id != null && (
                      <Button variant="ghost" size="sm" disabled={marking.has(n.id)} onClick={() => markRead(n.id!)} className="shrink-0 h-7 text-xs text-muted-foreground hover:text-foreground">
                        {marking.has(n.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                        Done
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
