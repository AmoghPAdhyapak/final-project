import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, Loader2, Shield, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [srn, setSrn] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srn.trim() || !password.trim()) { toast.error("Please enter both SRN and password."); return; }
    setLoading(true);
    try {
      await login(srn.trim(), password.trim());
      toast.success("Welcome back to SNPSU Portal");
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Invalid SRN or password.";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 palace-pattern">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary opacity-5 blur-3xl animate-orb-pulse" />
      </div>
      <button onClick={toggleTheme} aria-label="Toggle theme" className="fixed top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-sm">
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border shadow-gold mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-playfair text-3xl font-bold gold-text mb-1">SNPSU</h1>
          <p className="text-muted-foreground text-sm">Academic Intelligence Portal</p>
          <div className="gold-divider mt-3 mx-auto max-w-48" />
        </div>
        <div className="palace-card p-6 shadow-royal">
          <div className="mb-6">
            <h2 className="font-playfair text-xl font-semibold text-foreground">Student Sign In</h2>
            <p className="text-muted-foreground text-sm mt-1">Enter your SRN and portal password to access your academic dashboard.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="srn" className="text-sm font-normal text-foreground">Student Registration Number (SRN)</Label>
              <Input id="srn" placeholder="e.g. 25SUUBEAML045" value={srn} onChange={(e) => setSrn(e.target.value.toUpperCase())} className="px-3 text-base uppercase" autoComplete="username" disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-normal text-foreground">Password</Label>
              <div className="relative">
                <Input id="password" type={showPwd ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="px-3 pr-10 text-base" autoComplete="current-password" disabled={loading} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Authenticating…</> : "Access Portal"}
            </Button>
          </form>
          <div className="mt-5 p-3 rounded-lg border border-border bg-muted">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground">Demo Credentials</span>
            </div>
            <p className="text-xs text-muted-foreground">SRN: <span className="text-foreground font-mono">25SUUBEAML045</span></p>
            <p className="text-xs text-muted-foreground">Password: <span className="text-foreground font-mono">apa@123</span></p>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">Sapthagiri NPS University · Academic Intelligence System</p>
      </div>
    </div>
  );
}
