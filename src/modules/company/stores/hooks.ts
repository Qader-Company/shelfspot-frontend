"use client";
import { useQuery } from "@tanstack/react-query";
import { getStores, getStoreOptions } from "./service";
export const storesKey = ["company", "stores"] as const;
export function useStoresQuery() { return useQuery({ queryKey: [...storesKey, "list"], queryFn: getStores }); }
export function useStoreOptionsQuery() { return useQuery({ queryKey: [...storesKey, "options"], queryFn: getStoreOptions }); }
