"use client";
import Image from "next/image";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { Package, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
export interface SelectedProduct { id: number; name: string; sku: string; imageUrl?: string | null }
export function SelectedProductsDialog({ ids, products, onClose, onConfirm }: { ids: number[]; products: Record<number, SelectedProduct>; onClose: () => void; onConfirm: (ids: number[]) => void }) {
  const t = useTranslations("dashboard.stores");
  const [selected, setSelected] = useState(ids);
  const remove = (id: number) => setSelected(current => current.filter(value => value !== id));
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/25" /><Dialog.Content aria-describedby={undefined} className="fixed start-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-card p-5 shadow-xl rtl:translate-x-1/2"><div className="flex items-center justify-between"><Dialog.Title className="text-xl font-bold">{t("selectedProducts")}</Dialog.Title><Dialog.Close asChild><Button size="icon-sm" variant="ghost" aria-label={t("close")}><X className="size-4" /></Button></Dialog.Close></div><p className="my-3 text-sm text-muted-foreground">{t("productsCount", { count: selected.length })}</p><div className="min-h-0 space-y-2 overflow-y-auto">{selected.map(id => { const product = products[id]; const name = product?.name ?? `#${id}`; return <div key={id} className="flex items-center gap-3 rounded-xl border p-3"><input type="checkbox" checked aria-label={t("removeProduct", { name })} onChange={() => remove(id)} className="accent-primary" />{product?.imageUrl ? <Image unoptimized width={36} height={36} src={product.imageUrl} alt="" className="size-9 rounded object-contain" /> : <Package className="size-9 text-muted-foreground" />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">SKU: {product?.sku ?? "—"}</p></div><Button size="icon-sm" variant="ghost" aria-label={t("removeProduct", { name })} onClick={() => remove(id)}><Trash2 className="size-4 text-muted-foreground" /></Button></div>; })}{!selected.length ? <p className="py-8 text-center text-muted-foreground">{t("noProducts")}</p> : null}</div><Button className="mt-4 w-full shrink-0" onClick={() => onConfirm(selected)}>{t("confirm")}</Button></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
