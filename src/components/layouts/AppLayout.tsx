import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth }  from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button }   from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard, ClipboardList, BarChart2, MessageSquare,
  Bell, CalendarDays, User, LogOut, Menu, GraduationCap,
  Sun, Moon, AlertTriangle,
} from "lucide-react";
import { cn }         from "@/lib/utils";
import { TestingAPI } from "@/services/api";

const NAV_ITEMS = [
  { to: "/dashboard",     icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/attendance",    icon: ClipboardList,   label: "Attendance"   },
  { to: "/analytics",     icon: BarChart2,       label: "Analytics"    },
  { to: "/chat",          icon: MessageSquare,   label: "AI Mentor",   ai: true },
  { to: "/notifications", icon: Bell,            label: "Notifications" },
  { to: "/timetable",     icon: CalendarDays,    label: "Timetable"    },
  { to: "/profile",       icon: User,            label: "Profile"      },
];

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg border border-sidebar-border",
        "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
        className
      )}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { studentMeta, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-sidebar py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-gold">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sidebar-foreground font-playfair font-semibold text-sm leading-tight truncate">
            SNPSU
          </p>
          <p className="text-muted-foreground text-xs truncate">Academic Portal</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Student badge */}
      {studentMeta && (
        <div className="mx-3 mb-6 p-3 rounded-xl border border-sidebar-border bg-sidebar-accent">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground text-xs font-bold">
              {studentMeta.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sidebar-foreground text-xs font-medium truncate">{studentMeta.name}</p>
              <p className="text-muted-foreground text-xs truncate">{studentMeta.srn}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, ai }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {ai && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                AI
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-4 px-3">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme }      = useTheme();
  const [testMode,   setTestMode]   = useState(false);

  useEffect(() => {
    TestingAPI.getStatus()
      .then((s) => setTestMode(s.test_mode))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Testing mode banner */}
      {testMode && (
        <div className="w-full bg-warning/20 border-b border-warning/40 px-4 py-1.5 flex items-center justify-center gap-2 shrink-0 z-50">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <span className="text-xs font-medium text-warning">
            TESTING MODE ACTIVE — Changes do not affect production data.
          </span>
        </div>
      )}

      <div className="flex flex-1 min-h-0 w-full">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-sidebar-border">
          <SidebarContent />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
          {/* Mobile header */}
          <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar">
                <SidebarContent onNavClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GraduationCap className="w-5 h-5 text-primary shrink-0" />
              <span className="font-playfair font-semibold text-foreground text-sm truncate">
                SNPSU Portal
              </span>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
