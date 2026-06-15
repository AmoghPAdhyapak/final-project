import { useEffect, useState } from "react";
import { StudentAPI } from "@/services/api";
import type { StudentProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Building2, BookOpen, GraduationCap, Hash, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const FIELDS = [
  { label: "Student Registration Number", icon: Hash, key: "srn" },
  { label: "Email Address", icon: Mail, key: "email" },
  { label: "Phone Number", icon: Phone, key: "phone" },
  { label: "Department", icon: Building2, key: "department" },
  { label: "Specialization", icon: BookOpen, key: "specialization" },
  { label: "Current Semester", icon: GraduationCap, key: "semester" },
] as const;

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.getProfile()
      .then((d) => setProfile(d.profile))
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-36 bg-muted" />
      <Skeleton className="h-40 bg-muted rounded-2xl" />
      <Skeleton className="h-64 bg-muted rounded-2xl" />
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      <AlertTriangle className="w-10 h-10 mb-3 text-warning" />
      <p className="text-sm">Profile data unavailable.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl mx-auto">
      <div>
        <h1 className="font-playfair text-2xl md:text-3xl font-bold gold-text">Student Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Your academic registration and personal information.</p>
      </div>
      <Card className="palace-card shadow-royal">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-gold">
              <span className="font-playfair text-3xl font-bold text-primary-foreground">{profile.initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-playfair text-xl font-semibold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground text-sm mt-0.5">{profile.specialization}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">Semester {profile.semester}</Badge>
                <Badge className="bg-secondary text-secondary-foreground border-border text-xs">{profile.srn}</Badge>
              </div>
            </div>
          </div>
          <div className="gold-divider mt-5" />
          <p className="text-muted-foreground text-xs mt-3">{profile.department} · Sapthagiri NPS University</p>
        </CardContent>
      </Card>
      <Card className="palace-card">
        <CardHeader>
          <CardTitle className="font-playfair text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Registration Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map(({ label, icon: Icon, key }) => (
            <div key={key} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="text-foreground text-sm font-medium truncate">{profile[key]}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="palace-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-5 h-5 text-primary shrink-0" />
            <p className="font-playfair font-semibold text-foreground">Sapthagiri NPS University</p>
          </div>
          <div className="gold-divider mb-3" />
          <div className="grid grid-cols-2 gap-4 text-xs">
            {[["Programme","Bachelor of Engineering"],["Academic Year","2025–2026"],["Institution","SNPSU, Bengaluru"],["Portal Version","v2.0 AI-Enhanced"]].map(([k,v]) => (
              <div key={k}><p className="text-muted-foreground">{k}</p><p className="text-foreground font-medium mt-0.5">{v}</p></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
