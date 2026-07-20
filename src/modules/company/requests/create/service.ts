import { apiClient } from "@/shared/lib/api/client";
import type { CreateTaskPayload, CreateTaskResponse, GetServicesResponse } from "./types";

const TASKS_ENDPOINT = "/api/company/tasks";
const SERVICES_ENDPOINT = "/api/company/services";

export interface CreateTaskServiceParams { payload: CreateTaskPayload; companySlug: string }

export async function getServices(): Promise<GetServicesResponse> {
  return (await apiClient.get<GetServicesResponse>(SERVICES_ENDPOINT)).data;
}

export async function createTask({ payload, companySlug }: CreateTaskServiceParams): Promise<CreateTaskResponse> {
  const formData = new FormData();
  formData.append("date", payload.date);
  formData.append("location[latitude]", String(payload.location.latitude));
  formData.append("location[longitude]", String(payload.location.longitude));
  if (payload.location.location_name != null) formData.append("location[location_name]", payload.location.location_name);
  if (payload.location.address != null) formData.append("location[address]", payload.location.address);
  if (payload.notes != null) formData.append("notes", payload.notes);

  payload.services.forEach((service, serviceIndex) => {
    formData.append(`services[${serviceIndex}][service_key]`, service.service_key);
    formData.append(`services[${serviceIndex}][price]`, String(service.price));
    formData.append(`services[${serviceIndex}][execution_time_minutes]`, String(service.execution_time_minutes));
    if (service.execution_instructions != null) formData.append(`services[${serviceIndex}][execution_instructions]`, service.execution_instructions);
    service.products.forEach((product, productIndex) => {
      formData.append(`services[${serviceIndex}][products][${productIndex}][product_id]`, String(product.product_id));
      Object.entries(product.product_details ?? {}).forEach(([key, value]) => {
        if (value != null) formData.append(`services[${serviceIndex}][products][${productIndex}][product_details][${key}]`, String(value));
      });
    });
    service.planogramFiles?.forEach((file, i) => {
      formData.append(`services[${serviceIndex}][request_files][planogram][${i}]`, file, file.name);
    });
    service.jobOrderFiles?.forEach((file, i) => {
      formData.append(`services[${serviceIndex}][request_files][job_order][${i}]`, file, file.name);
    });
  });

  return (await apiClient.post<CreateTaskResponse>(TASKS_ENDPOINT, formData, {
    headers: {
      "X-Company-Slug": companySlug,
      "Content-Type": undefined, // let axios set multipart/form-data with boundary automatically
    },
  })).data;
}
