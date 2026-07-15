import { UploadIcon } from "@/shared/components/dashboard/dashboard-icons";

interface CatalogUploadAreaProps {
  label: string;
  hint: string;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
}

export function CatalogUploadArea({
  label,
  hint,
  file,
  onFileChange,
}: CatalogUploadAreaProps) {
  return (
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 transition-colors hover:border-primary/60">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onFileChange?.(event.target.files?.[0] ?? null)}
      />
      <UploadIcon className="size-7 text-primary" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-primary">{file?.name ?? hint}</p>
    </label>
  );
}
