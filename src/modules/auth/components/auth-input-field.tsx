"use client";

import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

interface AuthInputFieldProps<TFieldValues extends FieldValues> {
  autoComplete?: string;
  control: Control<TFieldValues>;
  endAdornment?: ReactNode;
  icon?: ReactNode;
  label: string;
  name: FieldPath<TFieldValues>;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
}

export function AuthInputField<TFieldValues extends FieldValues>({
  autoComplete,
  control,
  endAdornment,
  icon,
  label,
  name,
  placeholder,
  type = "text",
}: AuthInputFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="gap-2">
          <FormLabel className="text-sm font-medium text-foreground">
            {label}
          </FormLabel>
          <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-secondary px-3 transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
            {icon ? (
              <span className="shrink-0 text-muted-foreground">{icon}</span>
            ) : null}
            <FormControl>
              <Input
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
                autoComplete={autoComplete}
                type={type}
                placeholder={placeholder}
                className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
              />
            </FormControl>
            {endAdornment ? (
              <div className="shrink-0 text-muted-foreground">
                {endAdornment}
              </div>
            ) : null}
          </div>
          <FormMessage className="text-xs leading-5" />
        </FormItem>
      )}
    />
  );
}
