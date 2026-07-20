"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/lib/query/keys";
import { getServices } from "./service";

export function useServicesQuery() {
  return useQuery({ queryKey: QUERY_KEYS.services, queryFn: getServices, staleTime: 5 * 60 * 1000 });
}
