import axios from "axios";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";

export async function refreshCompanyTokens() {
  await refreshTokens("company");
}

export async function refreshTokens(context: AuthContext) {
  await axios.post(getAuthContextConfig(context).refreshEndpoint, undefined, { withCredentials: true });
}
