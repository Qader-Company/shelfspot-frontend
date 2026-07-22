import { UploadIcon } from "@/shared/components/dashboard/dashboard-icons";

interface CatalogUploadAreaProps {
  label: string;
  hint: string;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  existingImageUrl?: string | null;
}

export function CatalogUploadArea({
  label,
  hint,
  file,
  onFileChange,
  existingImageUrl,
}: CatalogUploadAreaProps) {
  const previewUrl = file ? null : existingImageUrl;

  return (
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 transition-colors hover:border-primary/60">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onClick={(event) => { event.currentTarget.value = ""; }}
        onChange={(event) => {
          const selected = event.currentTarget.files?.[0] ?? null;
          onFileChange?.(selected && selected.size <= 10 * 1024 * 1024 ? selected : null);
        }}
      />
      {previewUrl ? (
        // Catalog image hosts are supplied by the API at runtime.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt=""
          className="size-16 rounded-lg object-contain"
        />
      ) : (
        <UploadIcon className="size-7 text-primary" />
      )}
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-primary">{file?.name ?? hint}</p>
    </label>
  );
}
