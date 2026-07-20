import { apiClient } from "@/shared/lib/api/client";

export async function downloadSubBrandsTemplateService() {
  const response = await apiClient.get<Blob>("/api/company/sub-brands/excel/template", { responseType: "blob" });
  const disposition = response.headers["content-disposition"] as string | undefined;
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = match?.[1] ?? "sub-brands-template.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
