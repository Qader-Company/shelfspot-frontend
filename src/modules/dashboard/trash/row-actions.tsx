import {
  RestoreIcon,
  TrashIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

interface RowActionsProps {
  deleteLabel: string;
  restoreLabel: string;
  onDelete: () => void;
  onRestore: () => void;
}

export function RowActions({
  deleteLabel,
  restoreLabel,
  onDelete,
  onRestore,
}: RowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={deleteLabel}
        className="text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <TrashIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={restoreLabel}
        className="text-muted-foreground hover:text-foreground"
        onClick={onRestore}
      >
        <RestoreIcon className="size-4" />
      </Button>
    </div>
  );
}
