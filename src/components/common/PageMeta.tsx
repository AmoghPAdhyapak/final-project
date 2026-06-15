import { TooltipProvider } from "@/components/ui/tooltip";
export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>{children}</TooltipProvider>
);
export default function PageMeta() { return null; }
