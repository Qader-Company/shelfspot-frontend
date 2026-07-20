import { useEffect, useMemo } from "react";

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
  const localPreview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  const previewUrl = localPreview ?? existingImageUrl;

  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    },
    [localPreview],
  );

  return (
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 transition-colors hover:border-primary/60">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onFileChange?.(event.target.files?.[0] ?? null)}
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
