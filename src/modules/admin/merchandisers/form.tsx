"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Eye, Mail, Phone, UserRound } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { useCreateMerchandiser, useMerchandiser, useUpdateMerchandiser } from "./hooks";
import type { MerchandiserPayload } from "./types";

interface MerchandiserFormProps { merchandiserId?: string }
type MerchandiserFormValues = MerchandiserPayload & { confirmPassword: string };
type CreatedCredentials = { email: string; password: string };

export function MerchandiserForm({ merchandiserId }: MerchandiserFormProps) {
  const t = useTranslations("adminDashboard.merchandisers.form");
  const adminT = useTranslations("adminAdmins");
  const authT = useTranslations("auth.register");
  const locale = useLocale();
  const router = useRouter();
  const details = useMerchandiser(merchandiserId ?? "");
  const createMutation = useCreateMerchandiser();
  const updateMutation = useUpdateMerchandiser();
  const [submitError, setSubmitError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [copiedCredential, setCopiedCredential] = useState<keyof CreatedCredentials | null>(null);
  const schema = useMemo(() => z.object({
    fullName: z.string().trim().min(2, t("validation.name")),
    email: z.email(t("validation.email")),
    phone: z.string().trim().min(8, t("validation.phone")),
    loginEnabled: z.boolean(),
    temporaryPassword: z.string().min(8, t("validation.password")),
    confirmPassword: z.string().min(1, adminT("validation.required")),
  }).refine((values) => values.temporaryPassword === values.confirmPassword, {
    message: adminT("validation.match"),
    path: ["confirmPassword"],
  }), [adminT, t]);
  const form = useForm<MerchandiserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", loginEnabled: true, temporaryPassword: "$@cejf#aqmJP", confirmPassword: "$@cejf#aqmJP" },
  });

  useEffect(() => {
    if (!details.data) return;
    form.reset({
      fullName: editableValue(details.data.fullName),
      email: editableValue(details.data.email),
      phone: editableValue(details.data.phone),
      loginEnabled: details.data.loginEnabled,
      temporaryPassword: details.data.temporaryPassword,
      confirmPassword: details.data.temporaryPassword,
    });
  }, [details.data, form]);

  async function submit({ confirmPassword: _confirmPassword, ...payload }: MerchandiserFormValues) {
    void _confirmPassword;
    setSubmitError("");
    try {
      if (merchandiserId) {
        await updateMutation.mutateAsync({ id: merchandiserId, payload });
        router.push("/admin/merchandisers");
      } else {
        const created = await createMutation.mutateAsync(payload);
        setCreatedCredentials({
          email: editableValue(created.email) || payload.email,
          password: payload.temporaryPassword,
        });
      }
    } catch (error) { setSubmitError(error instanceof Error ? error.message : t("saveError")); }
  }

  const fieldClass = "h-12 w-full rounded-lg border border-transparent bg-muted px-11 text-sm outline-none placeholder:text-muted-foreground focus:border-primary";
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start gap-4"><Link href="/admin/merchandisers" className="rounded-full p-3 hover:bg-muted" aria-label={t("back")}>←</Link><div><h1 className="text-3xl font-bold">{t(merchandiserId ? "editTitle" : "createTitle")}</h1><p className="mt-1 text-muted-foreground">{t(merchandiserId ? "editSubtitle" : "createSubtitle")}</p></div></div>
        <form onSubmit={form.handleSubmit(submit)} className="mt-8 space-y-8">
          <section className="border-s-2 border-primary ps-8">
            <h2 className="font-semibold text-primary">1. {t("personalInfo")}</h2>
            <div className="mt-6 space-y-4 lg:ms-48">
              <Field label={t("fullName")} required error={form.formState.errors.fullName?.message}><UserRound className="absolute start-3 top-3.5 size-5 text-muted-foreground" /><input {...form.register("fullName")} className={fieldClass} placeholder="Omnia Arafat" /></Field>
              <Field label={t("email")} required error={form.formState.errors.email?.message}><Mail className="absolute start-3 top-3.5 size-5 text-muted-foreground" /><input {...form.register("email")} type="email" className={fieldClass} placeholder="ex@gmail.com" /></Field>
              <Field label={t("phone")} error={form.formState.errors.phone?.message}><Phone className="absolute start-3 top-3.5 size-5 text-muted-foreground" /><input {...form.register("phone")} className={fieldClass} placeholder="+966434**" dir="ltr" /></Field>
            </div>
          </section>
          <section className="border-s-2 border-border ps-8"><h2 className="font-semibold text-muted-foreground">2. {t("systemPermissions")}</h2><div className="mt-6 space-y-4 lg:ms-48"><div className="flex items-center justify-between"><div><h3 className="font-semibold">{t("credentials")}</h3><p className="text-sm text-muted-foreground">{t("credentialsDescription")}</p></div><label className="flex items-center gap-2"><input type="checkbox" {...form.register("loginEnabled")} className="size-5 accent-primary" />{t("enabled")}</label></div><Field label={t("temporaryPassword")} error={form.formState.errors.temporaryPassword?.message}><input {...form.register("temporaryPassword")} type={isPasswordVisible ? "text" : "password"} className="h-12 w-full rounded-lg bg-muted px-3 pe-12" placeholder={t("temporaryPassword")} dir="ltr" /><PasswordVisibilityButton visible={isPasswordVisible} onToggle={() => setIsPasswordVisible((value) => !value)} showLabel={authT("actions.showPassword")} hideLabel={authT("actions.hidePassword")} /></Field><Field label={adminT("adminForm.confirmPassword")} error={form.formState.errors.confirmPassword?.message}><input {...form.register("confirmPassword")} type={isConfirmPasswordVisible ? "text" : "password"} className="h-12 w-full rounded-lg bg-muted px-3 pe-12" placeholder={adminT("adminForm.confirmPassword")} dir="ltr" /><PasswordVisibilityButton visible={isConfirmPasswordVisible} onToggle={() => setIsConfirmPasswordVisible((value) => !value)} showLabel={authT("actions.showPassword")} hideLabel={authT("actions.hidePassword")} /></Field><p className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">ⓘ {t("credentialsNotice")}</p></div></section>
          {submitError ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">{submitError}</p> : null}
          <div className="flex justify-end gap-3"><Button asChild variant="outline" className="min-w-32"><Link href="/admin/merchandisers">{t("cancel")}</Link></Button><Button type="submit" className="min-w-32" disabled={pending}>{pending ? t("saving") : t("save")}</Button></div>
        </form>
      </div>
      {createdCredentials ? <CredentialsDialog credentials={createdCredentials} copiedCredential={copiedCredential} onCopy={async (field) => { await navigator.clipboard.writeText(createdCredentials[field]); setCopiedCredential(field); window.setTimeout(() => setCopiedCredential(null), 1500); }} onDone={() => router.push("/admin/merchandisers")} emailLabel={t("email")} passwordLabel={t("temporaryPassword")} title={locale === "ar" ? "تم إنشاء مسؤول العرض بنجاح" : "Worker created successfully"} description={t("credentialsNotice")} doneLabel={adminT("actions.confirm")} /> : null}
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block font-semibold">{label}{required ? <span className="text-destructive">*</span> : null}</span><span className="relative block">{children}</span>{error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}</label>;
}

function PasswordVisibilityButton({ visible, onToggle, showLabel, hideLabel }: { visible: boolean; onToggle: () => void; showLabel: string; hideLabel: string }) {
  return <button type="button" onClick={onToggle} className="absolute end-3 top-3.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none" aria-label={visible ? hideLabel : showLabel}>{visible ? <Image src="/auth/icons/view-off.svg" alt="" aria-hidden="true" width={20} height={20} className="size-5" /> : <Eye className="size-5" />}</button>;
}

function editableValue(value: string) {
  return value === "—" || value === "_" ? "" : value;
}

function CredentialsDialog({ credentials, copiedCredential, onCopy, onDone, emailLabel, passwordLabel, title, description, doneLabel }: { credentials: CreatedCredentials; copiedCredential: keyof CreatedCredentials | null; onCopy: (field: keyof CreatedCredentials) => Promise<void>; onDone: () => void; emailLabel: string; passwordLabel: string; title: string; description: string; doneLabel: string }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="created-worker-title" className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"><div className="flex flex-col items-center text-center"><span className="flex size-16 items-center justify-center rounded-full bg-primary/10"><CheckCircle2 className="size-9 text-primary" /></span><h2 id="created-worker-title" className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p></div><div className="mt-6 space-y-3"><CredentialRow label={emailLabel} value={credentials.email} copied={copiedCredential === "email"} onCopy={() => onCopy("email")} /><CredentialRow label={passwordLabel} value={credentials.password} copied={copiedCredential === "password"} onCopy={() => onCopy("password")} /></div><Button type="button" className="mt-6 w-full" onClick={onDone}>{doneLabel}</Button></div></div>;
}

function CredentialRow({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return <div className="rounded-lg bg-muted p-3"><span className="text-xs font-medium text-muted-foreground">{label}</span><div className="mt-1 flex items-center gap-2"><code className="min-w-0 flex-1 truncate text-sm" dir="ltr">{value}</code><button type="button" onClick={onCopy} className="rounded-md p-2 text-muted-foreground hover:bg-background hover:text-foreground" aria-label={`${label} copy`}>{copied ? <CheckCircle2 className="size-4 text-primary" /> : <Copy className="size-4" />}</button></div></div>;
}
