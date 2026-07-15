import { SidebarChevronIcon } from "@/shared/components/dashboard/dashboard-icons";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { availableRoles } from "./admins.seed";

export type AdminFormMode = "create" | "edit";

interface AdminFormDialogProps {
  isOpen: boolean;
  mode: AdminFormMode;
  labels: {
    createTitle: string;
    editTitle: string;
    activation: string;
    active: string;
    name: string;
    namePlaceholder: string;
    role: string;
    email: string;
    emailPlaceholder: string;
    phoneNumber: string;
    phonePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    cancel: string;
    confirm: string;
  };
  onClose: () => void;
}

export function AdminFormDialog({
  isOpen,
  mode,
  labels,
  onClose,
}: AdminFormDialogProps) {
  if (!isOpen) return null;

  const title = mode === "create" ? labels.createTitle : labels.editTitle;
  const defaultName = mode === "edit" ? "omar ali" : "";
  const defaultEmail = mode === "edit" ? "omarali3@gmail.com" : "";
  const defaultPhone = mode === "edit" ? "+966 6262525242" : "";

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-xl"
      >
        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-foreground">
          {title}
        </h2>

        <div className="mt-6 space-y-5">
          {/* Activation */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              {labels.activation}
            </span>
            <StatusToggle isActive={true} ariaLabel={labels.activation} />
            <span className="text-sm text-muted-foreground">{labels.active}</span>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {labels.name}
            </label>
            <Input
              type="text"
              placeholder={labels.namePlaceholder}
              defaultValue={defaultName}
              className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {labels.role}
            </label>
            <div className="relative">
              <select
                defaultValue="sales"
                className="h-11 w-full appearance-none rounded-lg border border-border bg-secondary pe-10 ps-4 text-sm text-foreground shadow-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <SidebarChevronIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {labels.email}
            </label>
            <Input
              type="email"
              placeholder={labels.emailPlaceholder}
              defaultValue={defaultEmail}
              className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {labels.phoneNumber}
            </label>
            <Input
              type="tel"
              placeholder={labels.phonePlaceholder}
              defaultValue={defaultPhone}
              className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none"
            />
          </div>

          {/* Password + Confirm Password */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {labels.password}
              </label>
              <Input
                type="password"
                placeholder={labels.passwordPlaceholder}
                defaultValue={mode === "edit" ? "0000000" : ""}
                className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {labels.confirmPassword}
              </label>
              <Input
                type="password"
                placeholder={labels.confirmPasswordPlaceholder}
                defaultValue={mode === "edit" ? "0000000" : ""}
                className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border text-sm font-semibold text-primary shadow-none"
            onClick={onClose}
          >
            {labels.cancel}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl text-sm font-semibold text-white hover:text-white"
            onClick={onClose}
          >
            {labels.confirm}
          </Button>
        </div>
      </section>
    </div>
  );
}
