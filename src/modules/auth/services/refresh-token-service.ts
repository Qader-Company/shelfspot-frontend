import axios from "axios";

const REFRESH_ENDPOINT = "/api/auth/company/refresh";

export async function refreshCompanyTokens() {
  await axios.post(REFRESH_ENDPOINT, undefined, { withCredentials: true });
}
