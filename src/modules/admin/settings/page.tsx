"use client";

import { ChevronRight, Eye, EyeOff, Settings2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { normalizeApiError } from "@/shared/lib/api/errors";

import { useAdminProfile, useUpdateAdminProfile } from "./hooks";

type Tab = "general" | "profile";

export function AdminSettingsPage() {
  const t = useTranslations("adminSettings");
  const [tab, setTab] = useState<Tab>("general");

  return (
    <main className="space-y-6 px-4 py-8 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Sidebar nav */}
        <nav className="h-fit rounded-2xl bg-card p-4">
          {(["general", "profile"] as Tab[]).map((x) => {
            const Icon = x === "general" ? Settings2 : UserRound;
            return (
              <button
                type="button"
                key={x}
                onClick={() => setTab(x)}
                className="flex w-full items-center gap-3 border-b px-1 py-5 text-start last:border-0"
              >
                <Icon />
                <span>{t(`tabs.${x}`)}</span>
                <ChevronRight
                  className={cn(
                    "ms-auto size-5 rtl:rotate-180",
                    tab === x ? "text-primary" : "text-muted-foreground",
                  )}
                />
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <section className="rounded-2xl bg-card p-4 sm:p-6">
          {tab === "general" ? (
            <GeneralTab t={t} />
          ) : (
            <ProfileTab t={t} />
          )}
        </section>
      </div>
    </main>
  );
}

/* ─── General tab (static UI only) ─────────────────────────────────────── */

function GeneralTab({
  t,
}: {
  t: ReturnType<typeof useTranslations<"adminSettings">>;
}) {
  const [notice, setNotice] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t("general.title")}</h2>
      <Field label={t("general.platform")}>
        <Input defaultValue="ShelfSpot" />
      </Field>
      <Field label={t("general.email")}>
        <Input type="email" defaultValue="name@company.com" />
      </Field>
      {notice && (
        <p role="status" className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
          {notice}
        </p>
      )}
      <div className="flex justify-end">
        <Button className="h-12 w-full sm:w-72" onClick={() => setNotice(t("unverified"))}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

/* ─── Profile tab (API-connected) ────────────────────────────────────────── */

function ProfileTab({
  t,
}: {
  t: ReturnType<typeof useTranslations<"adminSettings">>;
}) {
  const profile = useAdminProfile();
  const mutation = useUpdateAdminProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Populate form once data loads
  useEffect(() => {
    if (profile.data) {
      setName(profile.data.name ?? "");
      setEmail(profile.data.email ?? "");
    }
  }, [profile.data]);

  async function handleSave() {
    setSuccessMsg("");
    setErrorMsg("");

    // Validate passwords only if user is trying to change them
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setErrorMsg(t("profile.validation.currentRequired"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg(t("profile.validation.mismatch"));
        return;
      }
    }

    try {
      const payload: Parameters<typeof mutation.mutateAsync>[0] = {
        name,
        email,
      };
      if (newPassword && currentPassword) {
        payload.current_password = currentPassword;
        payload.password = newPassword;
        payload.password_confirmation = confirmPassword;
      }
      await mutation.mutateAsync(payload);
      setSuccessMsg(t("profile.success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMsg(normalizeApiError(err).message || t("profile.error"));
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t("profile.title")}</h2>

      {profile.isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : profile.isError ? (
        <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {t("profile.loadError")}
        </p>
      ) : (
        <>
          <Field label={t("profile.name")}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={mutation.isPending}
            />
          </Field>
          <Field label={t("profile.email")}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mutation.isPending}
            />
          </Field>

          <p className="pt-2 text-sm font-medium text-muted-foreground">
            {t("profile.passwordSection")}
          </p>

          <PasswordField
            placeholder={t("profile.current")}
            value={currentPassword}
            onChange={setCurrentPassword}
            disabled={mutation.isPending}
          />
          <PasswordField
            placeholder={t("profile.new")}
            value={newPassword}
            onChange={setNewPassword}
            disabled={mutation.isPending}
          />
          <PasswordField
            placeholder={t("profile.confirm")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={mutation.isPending}
          />
        </>
      )}

      {successMsg && (
        <p role="status" className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          {successMsg}
        </p>
      )}
      {errorMsg && (
        <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMsg}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          className="h-12 w-full sm:w-72"
          onClick={() => void handleSave()}
          disabled={mutation.isPending || profile.isLoading || profile.isError}
        >
          {mutation.isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}

/* ─── Shared primitives ─────────────────────────────────────────────────── */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function PasswordField({
  placeholder,
  value,
  onChange,
  disabled,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pe-11"
      />
      <button
        type="button"
        aria-label={placeholder}
        onClick={() => setShow(!show)}
        className="absolute end-3 top-1/2 -translate-y-1/2"
      >
        {show ? <EyeOff /> : <Eye />}
      </button>
    </label>
  );
}
