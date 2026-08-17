"use client";

import { useMemo } from "react";
import type { Control } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

interface AuthOtpFieldProps {
  control: Control<{ code: string }>;
  length?: number;
  digitLabel?: (position: number) => string;
}

export function AuthOtpField({
  control,
  length = 6,
  digitLabel,
}: AuthOtpFieldProps) {
  const slots = useMemo(() => Array.from({ length }), [length]);

  return (
    <FormField
      control={control}
      name="code"
      render={({ field }) => {
        const characters = field.value.split("").slice(0, length);

        return (
          <FormItem className="gap-3">
            <FormControl>
              <div className="grid grid-cols-6 gap-3">
                {slots.map((_, index) => (
                  <Input
                    key={index}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={characters[index] ?? ""}
                    onChange={(event) => {
                      const nextValue = event.target.value.replace(/\D/g, "");
                      const nextCharacters = [...characters];

                      nextCharacters[index] = nextValue.slice(-1);

                      field.onChange(nextCharacters.join(""));
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Backspace" &&
                        !characters[index] &&
                        index > 0
                      ) {
                        const nextCharacters = [...characters];
                        nextCharacters[index - 1] = "";
                        field.onChange(nextCharacters.join(""));
                      }
                    }}
                    className="h-12 rounded-lg border-0 bg-secondary px-0 py-0 text-center text-xl font-medium shadow-none focus-visible:ring-0"
                    maxLength={1}
                    aria-label={digitLabel?.(index + 1)}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage className="text-center text-xs leading-5" />
          </FormItem>
        );
      }}
    />
  );
}
