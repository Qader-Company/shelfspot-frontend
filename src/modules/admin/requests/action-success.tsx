"use client";

import { toast } from "sonner";
import { CheckIcon, CloseIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";
import styles from "./request-motion.module.css";

export function showRequestActionSuccess(message: string, requestId: string, closeLabel: string) {
  toast.custom((id) => (
    <div role="status" className={`${styles.success} flex w-full items-center gap-3 rounded-xl border border-success/20 bg-card p-4 text-card-foreground shadow-lg`}>
      <span className={`${styles.successIcon} flex size-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success`}><CheckIcon aria-hidden="true" className="size-5" /></span>
      <div className="min-w-0 flex-1"><p className="text-xs font-medium text-muted-foreground">REQ-{requestId}</p><p className="mt-1 text-sm font-semibold">{message}</p></div>
      <Button variant="ghost" size="icon-xs" aria-label={closeLabel} onClick={() => toast.dismiss(id)}><CloseIcon className="size-4" /></Button>
    </div>
  ), { duration: 4000 });
}
