export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
