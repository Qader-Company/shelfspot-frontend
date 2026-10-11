"use client";

import { Children, Fragment, forwardRef, isValidElement, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/shared/lib/utils";

type SelectChange = { target: { value: string; name: string }; currentTarget: { value: string; name: string }; type: "change" };
type Props = Omit<ComponentPropsWithoutRef<"button">, "value" | "defaultValue" | "onChange" | "children"> & {
  value?: string | number;
  defaultValue?: string | number;
  required?: boolean;
  children: ReactNode;
  onChange?: (event: SelectChange) => void;
};
type Option = { value: string; label: ReactNode; disabled?: boolean };
const EMPTY_OPTION = "__shelfspot_empty_option__";

function getOptions(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child)) return [];
    if (child.type === Fragment) return getOptions(child.props.children);
    if (child.type !== "option") return [];
    return [{ value: String(child.props.value ?? child.props.children ?? ""), label: child.props.children, disabled: child.props.disabled }];
  });
}

// Keeps existing filters and form field handlers while replacing native popup UI.
export const ShelfSelect = forwardRef<HTMLButtonElement, Props>(function ShelfSelect({ children, value, defaultValue, onChange, name, required, disabled, className, dir, ...props }, ref) {
  const locale = useLocale();
  const options = getOptions(children);
  const [internalValue, setInternalValue] = useState(() => String(defaultValue ?? options[0]?.value ?? ""));
  const selected = value === undefined ? internalValue : String(value);
  const empty = options.find((option) => option.value === "");
  const direction = dir === "rtl" || dir === "ltr" ? dir : locale === "ar" ? "rtl" : "ltr";
  return <SelectPrimitive.Root value={selected} name={name} required={required} disabled={disabled} dir={direction} onValueChange={(next) => {
    const nextValue = next === EMPTY_OPTION ? "" : next;
    setInternalValue(nextValue);
    onChange?.({ target: { value: nextValue, name: name ?? "" }, currentTarget: { value: nextValue, name: name ?? "" }, type: "change" });
  }}>
    <SelectPrimitive.Trigger ref={ref} {...props} data-slot="shelf-select" className={cn("group inline-flex h-11 min-w-36 items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 text-start text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive motion-reduce:transition-none", className)}>
      <span className="min-w-0 flex-1 truncate"><SelectPrimitive.Value placeholder={empty?.label} /></span>
      <SelectPrimitive.Icon><ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content position="popper" sideOffset={6} collisionPadding={12} className="shelf-select-popup z-[100] max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1"><ChevronUp className="size-4" /></SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1.5">
          {options.map((option) => <SelectPrimitive.Item key={option.value} value={option.value === "" ? EMPTY_OPTION : option.value} disabled={option.disabled} className="relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pe-9 ps-3 text-sm outline-none transition-colors duration-150 data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary data-[state=checked]:bg-primary/10 data-[state=checked]:font-medium data-[disabled]:pointer-events-none data-[disabled]:opacity-40 motion-reduce:transition-none">
            <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
            <SelectPrimitive.ItemIndicator className="absolute end-3"><Check className="size-4 text-primary" /></SelectPrimitive.ItemIndicator>
          </SelectPrimitive.Item>)}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1"><ChevronDown className="size-4" /></SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>;
});
