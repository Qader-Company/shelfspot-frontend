"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon } from "@/shared/components/dashboard/dashboard-icons";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface Props { isOpen: boolean; onClose: () => void; onRecharge: (amount: number) => Promise<unknown>; }
export function AddFundDialog({ isOpen, onClose, onRecharge }: Props) {
  const t = useTranslations("dashboard"); const [amount, setAmount] = useState(""); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (isOpen) { setAmount(""); setError(""); } }, [isOpen]);
  if (!isOpen) return null;
  const submit = async () => { setPending(true); setError(""); try { await onRecharge(Number(amount)); onClose(); } catch(e) { setError(normalizeApiError(e).message); } finally { setPending(false); } };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t("paymentPage.addFundDialog.title")}</h2><Button variant="ghost" size="icon-sm" onClick={onClose}><CloseIcon className="size-4"/></Button></div>
    <label className="mt-6 block space-y-2 text-sm font-semibold"><span>Amount</span><Input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="h-11"/></label>
    {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <div className="mt-6 flex gap-3"><Button variant="outline" className="h-11 flex-1" onClick={onClose} disabled={pending}>Cancel</Button><Button className="h-11 flex-1 text-white" onClick={submit} disabled={pending || !amount || Number(amount) <= 0}>{t("paymentPage.actions.addFund")}</Button></div>
  </section></div>;
}
