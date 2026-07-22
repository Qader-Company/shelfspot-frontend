"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Clipboard, Mail, Phone, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { useCreateMerchandiser, useMerchandiser, useUpdateMerchandiser } from "./hooks";
import type { MerchandiserPayload } from "./types";

interface MerchandiserFormProps { merchandiserId?: string }

export function MerchandiserForm({ merchandiserId }: MerchandiserFormProps) {
  const t = useTranslations("adminDashboard.merchandisers.form");
  const router = useRouter();
  const details = useMerchandiser(merchandiserId ?? "");
  const createMutation = useCreateMerchandiser();
  const updateMutation = useUpdateMerchandiser();
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitError, setSubmitError] = useState("");
  const schema = useMemo(() => z.object({
    fullName: z.string().trim().min(2, t("validation.name")),
    email: z.email(t("validation.email")),
    phone: z.string().trim().min(8, t("validation.phone")),
    photoUrl: z.string().optional(),
    jobTitle: z.literal("merchandiser"),
    startDate: z.string().min(1, t("validation.startDate")),
    loginEnabled: z.boolean(),
    temporaryPassword: z.string().min(8, t("validation.password")),
  }), [t]);
  const form = useForm<MerchandiserPayload>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", photoUrl: "", jobTitle: "merchandiser", startDate: "", loginEnabled: true, temporaryPassword: "$@cejf#aqmJP" },
  });

  useEffect(() => {
    if (!details.data) return;
    form.reset({ fullName: details.data.fullName, email: details.data.email, phone: details.data.phone, photoUrl: details.data.photoUrl ?? "", jobTitle: details.data.jobTitle, startDate: details.data.startDate, loginEnabled: details.data.loginEnabled, temporaryPassword: details.data.temporaryPassword });
  }, [details.data, form]);

  async function submit(payload: MerchandiserPayload) {
    setSubmitError("");
    try {
      if (merchandiserId) await updateMutation.mutateAsync({ id: merchandiserId, payload });
      else await createMutation.mutateAsync(payload);
      router.push("/admin/merchandisers");
    } catch (error) { setSubmitError(error instanceof Error ? error.message : t("saveError")); }
  }

  const fieldClass = "h-12 w-full rounded-lg border border-transparent bg-muted px-11 text-sm outline-none focus:border-primary";
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start gap-4"><Link href="/admin/merchandisers" className="rounded-full p-3 hover:bg-muted" aria-label={t("back")}>←</Link><div><h1 className="text-3xl font-bold">{t(merchandiserId ? "editTitle" : "createTitle")}</h1><p className="mt-1 text-muted-foreground">{t(merchandiserId ? "editSubtitle" : "createSubtitle")}</p></div></div>
        <form onSubmit={form.handleSubmit(submit)} className="mt-8 space-y-8">
          <section className="grid gap-8 border-s-2 border-primary ps-8 lg:grid-cols-[190px_1fr]">
            <div><h2 className="font-semibold text-primary">1. {t("personalInfo")}</h2><label className="mt-6 flex cursor-pointer flex-col items-center text-center"><span className="relative flex size-40 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-primary/10 shadow"><UserRound className="size-20 text-primary" />{photoPreview ? <img src={photoPreview} alt="" className="absolute inset-0 size-full object-cover" /> : null}<Camera className="absolute bottom-2 end-2 size-8 rounded-full bg-card p-1.5 text-muted-foreground" /></span><span className="mt-3 text-muted-foreground">{t("uploadPhoto")}</span><span className="text-muted-foreground">{t("optional")}</span><input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const value = String(reader.result); setPhotoPreview(value); form.setValue("photoUrl", value); }; reader.readAsDataURL(file); }} /></label></div>
            <div className="space-y-4 pt-12">
              <Field label={t("fullName")} required error={form.formState.errors.fullName?.message}><UserRound className="absolute start-3 top-3.5 size-5 text-muted-foreground" /><input {...form.register("fullName")} className={fieldClass} placeholder={t("fullNamePlaceholder")} /></Field>
              <Field label={t("email")} required error={form.formState.errors.email?.message}><Mail className="absolute start-3 top-3.5 size-5 text-muted-foreground" /><input {...form.register("email")} type="email" className={fieldClass} placeholder={t("emailPlaceholder")} /></Field>
              <Field label={t("phone")} error={form.formState.errors.phone?.message}><Phone className="absolute start-3 top-3.5 size-5 text-muted-foreground" /><input {...form.register("phone")} className={fieldClass} placeholder={t("phonePlaceholder")} dir="ltr" /></Field>
            </div>
          </section>
          <section className="border-s-2 border-border ps-8"><h2 className="font-semibold text-muted-foreground">2. {t("jobDetails")}</h2><div className="mt-6 space-y-4 lg:ms-48"><Field label={t("jobTitle")}><select {...form.register("jobTitle")} className="h-12 w-full rounded-lg bg-muted px-3"><option value="merchandiser">{t("merchandiser")}</option></select></Field><Field label={t("startDate")} required error={form.formState.errors.startDate?.message}><input {...form.register("startDate")} type="date" className="h-12 w-full rounded-lg bg-muted px-3" /></Field></div></section>
          <section className="border-s-2 border-border ps-8"><h2 className="font-semibold text-muted-foreground">3. {t("systemPermissions")}</h2><div className="mt-6 space-y-4 lg:ms-48"><div className="flex items-center justify-between"><div><h3 className="font-semibold">{t("credentials")}</h3><p className="text-sm text-muted-foreground">{t("credentialsDescription")}</p></div><label className="flex items-center gap-2"><input type="checkbox" {...form.register("loginEnabled")} className="size-5 accent-primary" />{t("enabled")}</label></div><Field label={t("temporaryPassword")} error={form.formState.errors.temporaryPassword?.message}><input {...form.register("temporaryPassword")} className="h-12 w-full rounded-lg bg-muted px-3 pe-12" dir="ltr" /><button type="button" className="absolute end-3 top-3" aria-label={t("copyPassword")} onClick={() => navigator.clipboard.writeText(form.getValues("temporaryPassword"))}><Clipboard className="size-5" /></button></Field><p className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">ⓘ {t("credentialsNotice")}</p></div></section>
          {submitError ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">{submitError}</p> : null}
          <div className="flex justify-end gap-3"><Button asChild variant="outline" className="min-w-32"><Link href="/admin/merchandisers">{t("cancel")}</Link></Button><Button type="submit" className="min-w-32" disabled={pending}>{pending ? t("saving") : t("save")}</Button></div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block font-semibold">{label}{required ? <span className="text-destructive">*</span> : null}</span><span className="relative block">{children}</span>{error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}</label>;
}
