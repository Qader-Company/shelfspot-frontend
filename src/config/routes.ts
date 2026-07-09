export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  otpVerification: "/otp-verification",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  dashboardRequests: "/dashboard/requests",
  dashboardPayment: "/dashboard/payment",
  dashboardCatalog: "/dashboard/catalog",
  dashboardAdmins: "/dashboard/admins",
  dashboardTrash: "/dashboard/trash",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
