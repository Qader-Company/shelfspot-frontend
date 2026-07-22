"use client";

import { useEffect, useState } from "react";
import { CreditCardIcon, LandmarkIcon, TicketPercentIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { CloseIcon } from "@/shared/components/dashboard/dashboard-icons";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (code: string) => Promise<unknown>;
}

type PaymentMethod = "promo" | "card" | "bank";

export function AddFundDialog({ isOpen, onClose, onRedeem }: Props) {
  const t = useTranslations("dashboard");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedMethod(null);
    setCode("");
    setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    const normalizedCode = code.trim();
    if (!normalizedCode) return;
    setPending(true);
    setError("");
    try {
      await onRedeem(normalizedCode);
      onClose();
    } catch (redeemError) {
      const apiError = normalizeApiError(redeemError);
      const message = apiError.message.toLowerCase();
      if (apiError.status === 0) {
        setError(t("paymentPage.addFundDialog.errors.network"));
      } else if (apiError.status === 429) {
        setError(t("paymentPage.addFundDialog.errors.tooManyAttempts"));
      } else if (message.includes("expired")) {
        setError(t("paymentPage.addFundDialog.errors.expired"));
      } else if (message.includes("already") || message.includes("used") || message.includes("redeemed")) {
        setError(t("paymentPage.addFundDialog.errors.alreadyUsed"));
      } else if (apiError.status === 404 || message.includes("invalid") || message.includes("not found")) {
        setError(t("paymentPage.addFundDialog.errors.invalid"));
      } else if (apiError.status >= 500 || message.includes("sqlstate") || message.includes("exception")) {
        setError(t("paymentPage.addFundDialog.errors.server"));
      } else {
        setError(t("paymentPage.addFundDialog.errors.invalid"));
      }
    } finally {
      setPending(false);
    }
  };

  const methods: Array<{
    id: PaymentMethod;
    enabled: boolean;
    icon: typeof TicketPercentIcon;
    label: string;
    description: string;
  }> = [
    { id: "promo", enabled: true, icon: TicketPercentIcon, label: t("paymentPage.addFundDialog.methods.promoCode.label"), description: t("paymentPage.addFundDialog.methods.promoCode.description") },
    { id: "card", enabled: false, icon: CreditCardIcon, label: t("paymentPage.addFundDialog.methods.creditCard.label"), description: t("paymentPage.addFundDialog.methods.creditCard.description") },
    { id: "bank", enabled: false, icon: LandmarkIcon, label: t("paymentPage.addFundDialog.methods.bankTransfer.label"), description: t("paymentPage.addFundDialog.methods.bankTransfer.description") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[1px]" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="add-fund-title" className="w-full max-w-xl rounded-2xl border bg-card p-6 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h2 id="add-fund-title" className="text-xl font-bold">{t("paymentPage.addFundDialog.title")}</h2>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("paymentPage.addFundDialog.close")} onClick={onClose} disabled={pending}>
            <CloseIcon className="size-4" />
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {methods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                disabled={!method.enabled || pending}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-start transition duration-200",
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card",
                  method.enabled ? "hover:border-primary/50 hover:bg-primary/[0.03]" : "cursor-not-allowed opacity-45",
                )}
                onClick={() => {
                  if (!method.enabled) return;
                  setSelectedMethod(method.id);
                  setError("");
                }}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500 dark:bg-sky-950/50">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-foreground">{method.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{method.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className={cn("grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out", selectedMethod === "promo" ? "mt-6 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0")} aria-hidden={selectedMethod !== "promo"}>
          <div className="min-h-0 overflow-hidden">
            <label className="block space-y-2 text-sm font-semibold">
              <span>{t("paymentPage.addFundDialog.promoCodeSection.title")}</span>
              <Input
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => { if (event.key === "Enter") void submit(); }}
                placeholder={t("paymentPage.addFundDialog.promoCodeSection.placeholder")}
                className="h-11"
                autoComplete="off"
                disabled={pending}
              />
            </label>
            {error ? <p role="alert" className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          </div>
        </div>

        <Button type="button" className="mt-6 h-12 w-full text-white" onClick={submit} disabled={selectedMethod !== "promo" || !code.trim() || pending}>
          {pending ? t("createRequest.actions.submitting") : t("paymentPage.addFundDialog.promoCodeSection.apply")}
        </Button>
      </section>
    </div>
  );
}
