"use client";

import { useMutation } from "@tanstack/react-query";

import {
  getAuthContextConfig,
  type AuthContext,
} from "@/modules/auth/config/auth-context";

export function useLogoutMutation(authContext: AuthContext) {
  return useMutation({
    mutationFn: async () => {
      await fetch(getAuthContextConfig(authContext).logoutEndpoint, {
        method: "POST",
        credentials: "include",
      });
    },
  });
}
