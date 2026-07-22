import { AuthSplitShell } from "@/modules/auth/components/auth-split-shell";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function AdminLoginPage() {
  return (
    <AuthSplitShell
      visualAlt="Admin login"
      visualSrc="/auth/screens/login-screen.png"
    >
      <LoginForm authContext="admin" />
    </AuthSplitShell>
  );
}
