import { apiClient } from "@/shared/lib/api/client";
const CATALOG_IMAGE_REMOVE_FILE_NAME = "__catalog_image_remove__";
export interface ProductPayload { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string; sku: string; barcode: string; brandId: string; subBrandId: string; categoryId: string; subCategoryId: string; isActive: boolean; image?: File; logoAction?: "keep" | "remove" | "replace"; }
function form(payload: ProductPayload, update = false) { const data = new FormData(); const removeImage = payload.image?.name === CATALOG_IMAGE_REMOVE_FILE_NAME; data.append("translations[en][name]", payload.nameEn); data.append("translations[ar][name]", payload.nameAr); data.append("translations[en][description]", payload.descriptionEn); data.append("translations[ar][description]", payload.descriptionAr); data.append("sku", payload.sku); data.append("barcode", payload.barcode); data.append("brand_id", payload.brandId); data.append("sub_brand_id", payload.subBrandId); data.append("category_id", payload.categoryId); data.append("sub_category_id", payload.subCategoryId); data.append("is_active", payload.isActive ? "1" : "0"); if (update) { data.append("_method", "put"); data.append("logo_action", removeImage ? "remove" : payload.logoAction ?? (payload.image ? "replace" : "keep")); } if (payload.image && !removeImage) data.append("image", payload.image, payload.image.name); return data; }
const multipart = { headers: { "Content-Type": "multipart/form-data" } };
export async function createProductService(payload: ProductPayload) { return (await apiClient.post("/api/company/products", form(payload), multipart)).data as { success: boolean; message: string }; }
export async function updateProductService({ id, payload }: { id: string; payload: ProductPayload }) { return (await apiClient.post(`/api/company/products/${encodeURIComponent(id)}`, form(payload, true), multipart)).data as { success: boolean; message: string }; }
export async function deleteProductService(id: string) { return (await apiClient.delete(`/api/company/products/${encodeURIComponent(id)}`)).data as { success: boolean; message: string }; }
export async function importProductsService(file: File) { const data = new FormData(); data.append("file", file, file.name); return (await apiClient.post("/api/company/products/excel/import", data, multipart)).data as { success: boolean; message: string }; }
export async function downloadProductsTemplateService() {
  const response = await apiClient.get<Blob>("/api/company/products/excel/template", { responseType: "blob" });
  const disposition = response.headers["content-disposition"] as string | undefined;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? "products-template.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
export async function bulkDeleteProductsService(ids: string[]) {
  const body = new URLSearchParams();
  ids.forEach((id, index) => body.append(`ids[${index}]`, String(Number(id))));
  return (await apiClient.delete("/api/company/products/bulk-delete", {
    data: body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })).data as { success: boolean; message: string };
}
