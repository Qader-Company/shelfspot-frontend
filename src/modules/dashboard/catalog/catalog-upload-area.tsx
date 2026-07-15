import { UploadIcon } from "@/shared/components/dashboard/dashboard-icons";

interface CatalogUploadAreaProps {
  label: string;
  hint: string;
}

export function CatalogUploadArea({ label, hint }: CatalogUploadAreaProps) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6">
      <UploadIcon className="size-7 text-primary" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-primary">{hint}</p>
    </div>
  );
}
