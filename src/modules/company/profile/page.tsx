"use client";

import { useState } from "react";
import { Building2, CheckCircle2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { normalizeApiError } from "@/shared/lib/api/errors";
import { PageLoadingSkeleton } from "@/shared/components/feedback";
import { Button } from "@/shared/ui/button";
import { PermissionGate } from "@/shared/components/auth/permission-provider";
import { Input } from "@/shared/ui/input";

import { useCompanyProfile, useUpdateCompanyProfile } from "./use-profile";
import type { CompanyProfile } from "./service";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CP";
}

export function CompanyProfilePage() {
  const profileQuery = useCompanyProfile();

  if (profileQuery.isPending) {
    return <PageLoadingSkeleton actionCount={1} cardCount={1} tableRows={4} tableColumns={2} />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <div className="m-8 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{normalizeApiError(profileQuery.error).message}</div>;
  }

  return <CompanyProfileForm key={profileQuery.data.id} profile={profileQuery.data} />;
}

function CompanyProfileForm({ profile }: { profile: CompanyProfile }) {
  const t = useTranslations("dashboard");
  const updateProfile = useUpdateCompanyProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [success, setSuccess] = useState(false);

  const mutationError = updateProfile.isError ? normalizeApiError(updateProfile.error).message : "";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(false);
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password: password || undefined,
        password_confirmation: passwordConfirmation || undefined,
      });
      setPassword("");
      setPasswordConfirmation("");
      setSuccess(true);
    } catch {
      // The mutation state renders the normalized API error below the form.
    }
  };

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("profilePage.title")}</h1>
        <p className="mt-2 text-lg font-medium text-muted-foreground">{t("profilePage.subtitle")}</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-[var(--brand-700)] to-[var(--brand-900)] px-6 py-8 text-white md:px-8">
          <div className="absolute -end-12 -top-20 size-56 rounded-full bg-white/10" aria-hidden="true" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-bold shadow-lg backdrop-blur">
              {initials(profile.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-bold">{profile.name}</h2>
                {profile.is_owner ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
                    <ShieldCheck className="size-3.5" />{t("profilePage.owner")}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-white/75">{profile.email}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
                <Building2 className="size-3.5" />
                {t("profilePage.companyId", { id: profile.company_id })}
              </p>
              <span className={profile.is_active ? "mt-3 inline-flex items-center gap-2 rounded-full bg-success/20 px-2.5 py-1 text-xs font-semibold text-white" : "mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70"}>
                <span className={profile.is_active ? "size-2 rounded-full bg-emerald-300" : "size-2 rounded-full bg-white/50"} />
                {profile.is_active ? t("profilePage.active") : t("profilePage.inactive")}
              </span>
            </div>
          </div>
        </div>

        <form className="space-y-6 p-6 md:p-8" onSubmit={(event) => void submit(event)}>
          <div>
            <h3 className="text-lg font-bold text-foreground">{t("profilePage.personalInfo")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("profilePage.personalInfoDescription")}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileField icon={UserRound} label={t("profilePage.fields.name")} htmlFor="profile-name">
              <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} className="h-12 ps-11" />
            </ProfileField>
            <ProfileField icon={Mail} label={t("profilePage.fields.email")} htmlFor="profile-email">
              <Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 ps-11" />
            </ProfileField>
            <ProfileField icon={LockKeyhole} label={t("profilePage.fields.password")} htmlFor="profile-password" hint={t("profilePage.fields.passwordHint")}>
              <Input id="profile-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder={t("profilePage.fields.passwordPlaceholder")} className="h-12 ps-11" autoComplete="new-password" />
            </ProfileField>
            <ProfileField icon={LockKeyhole} label={t("profilePage.fields.passwordConfirmation")} htmlFor="profile-password-confirmation">
              <Input id="profile-password-confirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} minLength={8} placeholder={t("profilePage.fields.passwordConfirmationPlaceholder")} className="h-12 ps-11" autoComplete="new-password" />
            </ProfileField>
          </div>

          {password && password !== passwordConfirmation ? (
            <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{t("profilePage.passwordMismatch")}</p>
          ) : null}

          {mutationError ? (
            <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {mutationError}
            </p>
          ) : null}
          {success ? (
            <p role="status" className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">
              <CheckCircle2 className="size-4" />{t("profilePage.success")}
            </p>
          ) : null}

          <div className="flex justify-end">
            <PermissionGate permission="edit_company"><Button type="submit" className="h-12 min-w-40 text-white" disabled={updateProfile.isPending || !name.trim() || !email.trim() || Boolean(password && password !== passwordConfirmation)}>
              {updateProfile.isPending ? t("createRequest.actions.submitting") : t("profilePage.save")}
            </Button></PermissionGate>
          </div>
        </form>
      </section>
    </div>
  );
}

function ProfileField({ icon: Icon, label, htmlFor, hint, children }: {
  icon: typeof UserRound;
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="space-y-2">
      <span className="block text-sm font-semibold text-foreground">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute start-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </span>
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
