import { Label } from "@/components/ui/label";

export function Field({ label, children, className }: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 w-full ${className || ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
