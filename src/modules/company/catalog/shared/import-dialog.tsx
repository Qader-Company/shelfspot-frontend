import {
  CloseIcon,
  DownloadIcon,
  UploadIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

interface CatalogImportDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  downloadLabel: string;
  uploadLabel: string;
  uploadHint: string;
  uploadFormat: string;
  cancelLabel: string;
  saveLabel: string;
  closeLabel: string;
  onClose: () => void;
  onDownload?: () => void;
  isDownloading?: boolean;
  downloadError?: string;
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
  onImport?: () => void;
  isImporting?: boolean;
  importError?: string;
  showDownload?: boolean;
}

export function CatalogImportDialog({
  isOpen,
  title,
  description,
  downloadLabel,
  uploadLabel,
  uploadHint,
  uploadFormat,
  cancelLabel,
  saveLabel,
  closeLabel,
  onClose,
  onDownload,
  isDownloading = false,
  downloadError,
  selectedFile,
  onFileChange,
  onImport,
  isImporting = false,
  importError,
  showDownload = true,
}: CatalogImportDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={closeLabel}
            className="rounded-full text-muted-foreground"
            onClick={onClose}
          >
            <CloseIcon className="size-4" />
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Download template */}
          {showDownload ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2 rounded-lg border-border text-sm font-medium shadow-none"
            onClick={onDownload}
            disabled={isDownloading}
          >
            {downloadLabel}
            <DownloadIcon className="size-4" />
          </Button>
          ) : null}

          {downloadError ? (
            <p
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {downloadError}
            </p>
          ) : null}

          {/* Upload area */}
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 transition-colors hover:border-primary/60">
            <input
              type="file"
              accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="sr-only"
              onClick={(event) => { event.currentTarget.value = ""; }}
              onChange={(event) => {
                const selected = event.currentTarget.files?.[0] ?? null;
                onFileChange?.(selected && selected.size <= 10 * 1024 * 1024 ? selected : null);
              }}
            />
            <UploadIcon className="size-7 text-primary" />
            <p className="text-sm font-medium text-foreground">{uploadLabel}</p>
            <p className="max-w-full truncate text-xs text-muted-foreground">
              {selectedFile?.name ?? uploadHint}
            </p>
            <p className="text-xs text-primary">{uploadFormat}</p>
          </label>

          {importError ? (
            <p
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {importError}
            </p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border text-sm font-semibold text-primary shadow-none"
            onClick={onClose}
            disabled={isImporting}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl text-sm font-semibold text-white hover:text-white"
            onClick={onImport ?? onClose}
            disabled={isImporting}
          >
            {saveLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
