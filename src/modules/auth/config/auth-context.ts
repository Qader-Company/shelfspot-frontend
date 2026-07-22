import { ROUTES } from "@/config/routes";

export type AuthContext = "company" | "admin";

export function isAuthContext(value: string): value is AuthContext {
  return value === "company" || value === "admin";
}

export type AuthAction = "login" | "forgot-password" | "verify-otp" | "reset-password" | "refresh" | "logout";

export function isAuthAction(value: string): value is AuthAction {
  return ["login", "forgot-password", "verify-otp", "reset-password", "refresh", "logout"].includes(value);
}

export const AUTH_UPSTREAM_ENDPOINTS: Record<AuthContext, Record<AuthAction, string>> = {
  company: {
    login: "/auth/company/login",
    "forgot-password": "/auth/company/password-reset/send-otp",
    "verify-otp": "/auth/company/reset-password-verification",
    "reset-password": "/auth/reset-password",
    refresh: "/auth/company/refresh",
    logout: "/auth/logout",
  },
  admin: {
    login: "/auth/admin/login",
    "forgot-password": "/auth/password-reset/send-otp",
    "verify-otp": "/auth/admin/reset-password-verification",
    "reset-password": "/auth/reset-password",
    refresh: "/auth/admin/refresh",
    logout: "/auth/logout",
  },
};

export const AUTH_CONTEXTS = {
  company: {
    loginEndpoint: "/api/auth/company/login",
    forgotPasswordEndpoint: "/api/auth/company/forgot-password",
    verifyResetOtpEndpoint: "/api/auth/company/verify-otp",
    resetPasswordEndpoint: "/api/auth/company/reset-password",
    refreshEndpoint: "/api/auth/company/refresh",
    logoutEndpoint: "/api/auth/company/logout",
    loginRoute: ROUTES.login,
    forgotPasswordRoute: ROUTES.forgotPassword,
    otpRoute: ROUTES.otpVerification,
    resetPasswordRoute: ROUTES.resetPassword,
    successRoute: ROUTES.dashboard,
    registrationRoute: ROUTES.register,
    layout: "split",
  },
  admin: {
    loginEndpoint: "/api/auth/admin/login",
    forgotPasswordEndpoint: "/api/auth/admin/forgot-password",
    verifyResetOtpEndpoint: "/api/auth/admin/verify-otp",
    resetPasswordEndpoint: "/api/auth/admin/reset-password",
    refreshEndpoint: "/api/auth/admin/refresh",
    logoutEndpoint: "/api/auth/admin/logout",
    loginRoute: ROUTES.adminLogin,
    forgotPasswordRoute: ROUTES.adminForgotPassword,
    otpRoute: ROUTES.adminOtpVerification,
    resetPasswordRoute: ROUTES.adminResetPassword,
    successRoute: ROUTES.adminDashboard,
    registrationRoute: null,
    layout: "centered",
  },
} as const;

export function getAuthContextConfig(context: AuthContext) {
  return AUTH_CONTEXTS[context];
}
