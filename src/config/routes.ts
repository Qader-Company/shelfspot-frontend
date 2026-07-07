export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  otpVerification: "/otp-verification",
  resetPassword: "/reset-password",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
