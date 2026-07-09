import { NotificationIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

interface NotificationButtonProps {
  label: string;
}

export function NotificationButton({ label }: NotificationButtonProps) {
  return (
    <Button
      aria-label={label}
      className="size-10 rounded-full text-foreground hover:bg-muted"
      type="button"
      variant="ghost"
      size="icon"
    >
      <NotificationIcon className="size-5 stroke-[1.8]" />
    </Button>
  );
}
