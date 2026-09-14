import { apiClient } from "@/shared/lib/api/client";
import type { CreateTaskPayload, CreateTaskResponse, GetServicesResponse } from "./types";

const TASKS_ENDPOINT = "/api/company/tasks";
const SERVICES_ENDPOINT = "/api/company/services";

export interface CreateTaskServiceParams { payload: CreateTaskPayload; companySlug: string }

export function toTaskFormData(payload: CreateTaskPayload) {
  const formData = new FormData();
  formData.append("date", payload.date);
  formData.append("store_id", String(payload.store_id));
  formData.append("execution_window[from]", payload.execution_window.from);
  formData.append("execution_window[to]", payload.execution_window.to);
  if (payload.repeat_task_id != null) formData.append("repeat_task_id", String(payload.repeat_task_id));
  payload.keep_attachment_ids?.forEach(id => formData.append("keep_attachment_ids[]", String(id)));
  if (payload.notes != null) formData.append("notes", payload.notes);
  payload.services.forEach((service, serviceIndex) => {
    formData.append(`services[${serviceIndex}][service_key]`, service.service_key);
    if (service.execution_instructions != null) formData.append(`services[${serviceIndex}][execution_instructions]`, service.execution_instructions);
    service.products.forEach((product, productIndex) => {
      formData.append(`services[${serviceIndex}][products][${productIndex}][product_id]`, String(product.product_id));
      Object.entries(product.product_details ?? {}).forEach(([key, value]) => { if (value != null) formData.append(`services[${serviceIndex}][products][${productIndex}][product_details][${key}]`, String(value)); });
    });
    service.planogramFiles?.forEach((file, i) => formData.append(`services[${serviceIndex}][request_files][planogram][${i}]`, file, file.name));
    service.jobOrderFiles?.forEach((file, i) => formData.append(`services[${serviceIndex}][request_files][job_order][${i}]`, file, file.name));
  });
  return formData;
}

export async function getServices(): Promise<GetServicesResponse> {
  return (await apiClient.get<GetServicesResponse>(SERVICES_ENDPOINT)).data;
}

export async function createTask({ payload, companySlug }: CreateTaskServiceParams): Promise<CreateTaskResponse> {
  const formData = toTaskFormData(payload);

  return (await apiClient.post<CreateTaskResponse>(TASKS_ENDPOINT, formData, {
    headers: {
      "X-Company-Slug": companySlug,
      "Content-Type": undefined, // let axios set multipart/form-data with boundary automatically
    },
  })).data;
}
