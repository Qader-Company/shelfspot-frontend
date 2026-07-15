"use client";

import { useState } from "react";
import { Building2, CreditCard, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { CloseIcon } from "@/shared/components/dashboard/dashboard-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import {
  availablePromoCodes,
  paymentMethodKeys,
} from "./payments.seed";
import type { PaymentMethodKey } from "./payments.seed";

const methodIcons: Record<PaymentMethodKey, ReactNode> = {
  promoCode:    <Tag className="size-5" />,
  creditCard:   <CreditCard className="size-5" />,
  bankTransfer: <Building2 className="size-5" />,
};

interface AddFundDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFundDialog({ isOpen, onClose }: AddFundDialogProps) {
  const t = useTranslations("dashboard");
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodKey>("promoCode");

  if (!isOpen) return null;

  const isPromoSelected = selectedMethod === "promoCode";

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={t("paymentPage.addFundDialog.title")}
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">
            {t("paymentPage.addFundDialog.title")}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground"
            aria-label={t("paymentPage.addFundDialog.close")}
            onClick={onClose}
          >
            <CloseIcon className="size-4" />
          </Button>
        </div>

        {/* Payment method selection */}
        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          {paymentMethodKeys.map((key, index) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedMethod(key)}
              className={cn(
                "flex w-full items-center gap-4 px-4 py-4 text-start transition-colors hover:bg-muted/50",
                index > 0 && "border-t border-border",
              )}
            >
              {/* Method icon */}
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {methodIcons[key]}
              </span>

              {/* Method label & description */}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {t(`paymentPage.addFundDialog.methods.${key}.label` as Parameters<typeof t>[0])}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t(`paymentPage.addFundDialog.methods.${key}.description` as Parameters<typeof t>[0])}
                </span>
              </span>

              {/* Radio indicator */}
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  selectedMethod === key
                    ? "border-primary"
                    : "border-muted-foreground/40",
                )}
              >
                {selectedMethod === key && (
                  <span className="size-2.5 rounded-full bg-primary" />
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Promo code section – shown only when promoCode method is selected */}
        {isPromoSelected && (
          <div className="mt-5 space-y-4">
            {/* Enter promo code input */}
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                {t("paymentPage.addFundDialog.promoCodeSection.title")}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={t(
                    "paymentPage.addFundDialog.promoCodeSection.placeholder",
                  )}
                  className="h-10 flex-1 rounded-lg border-border bg-background text-sm shadow-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 rounded-lg border-border px-4 text-sm font-medium shadow-none"
                >
                  {t("paymentPage.addFundDialog.promoCodeSection.validate")}
                </Button>
              </div>
            </div>

            {/* Available promo codes */}
            <div>
              <p className="mb-3 border-b border-primary pb-2 text-sm font-semibold text-foreground">
                {t(
                  "paymentPage.addFundDialog.promoCodeSection.availableTitle",
                )}
              </p>
              <div className="space-y-2">
                {availablePromoCodes.map((promo, index) => (
                  <div
                    key={promo.id}
                    className={cn(
                      "flex items-center justify-between gap-4 rounded-lg border border-border p-3",
                      index === 0 && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {t(
                          `paymentPage.addFundDialog.promoCodes.${promo.id}.title` as Parameters<typeof t>[0],
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          `paymentPage.addFundDialog.promoCodes.${promo.id}.description` as Parameters<typeof t>[0],
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-1 text-xs font-bold text-white",
                        promo.variant === "brand"
                          ? "bg-primary"
                          : "bg-destructive",
                      )}
                    >
                      {t(
                        `paymentPage.addFundDialog.promoCodes.${promo.id}.code` as Parameters<typeof t>[0],
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer action */}
        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-border px-5 text-sm font-medium shadow-none"
          >
            {t("paymentPage.addFundDialog.promoCodeSection.apply")}
          </Button>
        </div>
      </section>
    </div>
  );
}
