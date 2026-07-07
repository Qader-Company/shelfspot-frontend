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
import { cn } from "@/shared/lib/utils";

interface AuthSelectOption {
  label: string;
  value: string;
}

interface AuthSelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  icon?: ReactNode;
  label: string;
  name: FieldPath<TFieldValues>;
  options: AuthSelectOption[];
  placeholder: string;
}

export function AuthSelectField<TFieldValues extends FieldValues>({
  control,
  icon,
  label,
  name,
  options,
  placeholder,
}: AuthSelectFieldProps<TFieldValues>) {
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
              <select
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
                className={cn(
                  "h-full w-full appearance-none border-0 bg-transparent px-0 py-0 text-sm text-foreground outline-none",
                  !field.value && "text-muted-foreground",
                )}
              >
                <option value="" disabled>
                  {placeholder}
                </option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormControl>
          </div>
          <FormMessage className="text-xs leading-5" />
        </FormItem>
      )}
    />
  );
}
