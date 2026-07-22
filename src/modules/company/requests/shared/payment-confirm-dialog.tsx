"use client";

import { useTranslations } from "next-intl";

import { FlowDialog } from "@/modules/company/requests/create/flow-dialog";
import { useWallet } from "@/modules/company/payment/use-wallet";
import { Button } from "@/shared/ui/button";
import { ClockIcon, CostIcon } from "@/shared/components/dashboard/dashboard-icons";

// ─── Helper ───────────────────────────────────────────────────────────────────

function parseBalance(raw: string | number | undefined): number {
  return Number(raw ?? 0) || 0;
}

function PaymentRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger" | "success";
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span
        className={
          tone === "danger"
            ? "text-sm font-bold text-destructive"
            : tone === "success"
              ? "text-sm font-bold text-success"
              : "text-sm font-bold text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface PaymentConfirmDialogProps {
  isOpen: boolean;
  isPending: boolean;
  /** The amount that will be held / charged */
  totalPrice: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentConfirmDialog({
  isOpen,
  isPending,
  totalPrice,
  onClose,
  onConfirm,
}: PaymentConfirmDialogProps) {
  const t = useTranslations("dashboard");
  const walletQuery = useWallet({});

  const balance = parseBalance(
    walletQuery.data?.balance ?? walletQuery.data?.current_balance,
  );
  const remaining = balance - totalPrice;

  const fmtSAR = (n: number) => `${n.toLocaleString()} SAR`;

  return (
    <FlowDialog
      title={t("createRequest.paymentDialog.title")}
      closeLabel={t("createRequest.actions.closeDialog")}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-lg border-border bg-card text-sm font-semibold shadow-none"
            disabled={isPending}
            onClick={onClose}
          >
            {t("createRequest.actions.cancelPayment")}
          </Button>
          <Button
            type="button"
            className="h-12 rounded-lg text-sm font-semibold"
            disabled={isPending || remaining < 0}
            onClick={onConfirm}
          >
            {isPending
              ? t("createRequest.actions.submitting")
              : t("createRequest.actions.confirm")}
          </Button>
        </div>
      }
    >
      <p className="text-sm font-bold text-foreground">
        {t("createRequest.paymentDialog.reviewTitle")}
      </p>

      {/* Balance summary */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/20">
        <PaymentRow
          label={t("createRequest.paymentDialog.currentBalance")}
          value={walletQuery.isPending ? "…" : fmtSAR(balance)}
        />
        <PaymentRow
          label={t("createRequest.paymentDialog.amountToHold")}
          value={fmtSAR(totalPrice)}
          tone="danger"
        />
        <PaymentRow
          label={t("createRequest.paymentDialog.remainingBalance")}
          value={walletQuery.isPending ? "…" : fmtSAR(remaining)}
          tone={remaining >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Insufficient balance warning */}
      {!walletQuery.isPending && remaining < 0 && (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">
          {t("createRequest.paymentDialog.insufficientBalance")}
        </p>
      )}

      {/* How it works */}
      <div className="mt-4 rounded-lg border border-success bg-success/10 p-4">
        <div className="flex items-center gap-2">
          <CostIcon className="size-4 text-success" />
          <h3 className="font-bold text-foreground">
            {t("createRequest.paymentDialog.howItWorks.title")}
          </h3>
        </div>
        <ol className="mt-2 list-decimal space-y-1 ps-5 text-xs font-medium leading-5 text-muted-foreground">
          <li>{t("createRequest.paymentDialog.howItWorks.hold")}</li>
          <li>{t("createRequest.paymentDialog.howItWorks.completed")}</li>
          <li>{t("createRequest.paymentDialog.howItWorks.refund")}</li>
        </ol>
      </div>

      {/* Pending status info */}
      <div className="mt-4 rounded-lg border border-warning bg-warning/10 p-4">
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4 text-warning" />
          <h3 className="font-bold text-foreground">
            {t("createRequest.paymentDialog.pendingStatus.title")}
          </h3>
        </div>
        <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
          {t("createRequest.paymentDialog.pendingStatus.description")}
        </p>
      </div>
    </FlowDialog>
  );
}
