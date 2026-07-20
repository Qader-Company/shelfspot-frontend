import { apiClient } from "@/shared/lib/api/client";

const BRANDS_TEMPLATE_ENDPOINT = "/api/company/brands/excel/template";

function getDownloadFilename(contentDisposition?: string) {
  if (!contentDisposition) return "brands-template.xlsx";

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] ?? "brands-template.xlsx";
}

export async function downloadBrandsTemplateService() {
  const response = await apiClient.get<Blob>(BRANDS_TEMPLATE_ENDPOINT, {
    responseType: "blob",
  });
  const filename = getDownloadFilename(response.headers["content-disposition"]);
  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
