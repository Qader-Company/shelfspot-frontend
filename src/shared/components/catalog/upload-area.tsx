import { UploadIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

export const CATALOG_IMAGE_REMOVE_FILE_NAME = "__catalog_image_remove__";

interface CatalogUploadAreaProps {
  label: string;
  hint: string;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  existingImageUrl?: string | null;
  onRemove?: () => void;
  removeLabel?: string;
}

export function CatalogUploadArea({
  label,
  hint,
  file,
  onFileChange,
  existingImageUrl,
  onRemove,
  removeLabel = "Remove image",
}: CatalogUploadAreaProps) {
  const previewUrl = file ? null : existingImageUrl;

  return (
    <div className="relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 transition-colors hover:border-primary/60">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
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
      {(file || existingImageUrl) ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => {
          if (onRemove) onRemove();
          else onFileChange?.(new File([], CATALOG_IMAGE_REMOVE_FILE_NAME));
        }} className="text-destructive hover:text-destructive">
          {removeLabel}
        </Button>
      ) : null}
    </div>
  );
}
