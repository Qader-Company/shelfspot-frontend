import { apiClient } from "@/shared/lib/api/client";
import type {
  CreateTaskPayload,
  CreateTaskResponse,
} from "@/modules/dashboard/types/task";

const CREATE_TASK_ENDPOINT = "/api/company/tasks";

export interface CreateTaskServiceParams {
  payload: CreateTaskPayload;
  companySlug: string;
}

export async function createTaskService({
  payload,
  companySlug,
}: CreateTaskServiceParams): Promise<CreateTaskResponse> {
  // The API requires multipart/form-data.
  // Use FormData and let axios set the correct Content-Type boundary automatically.
  const formData = new FormData();

  formData.append("date", payload.date);
  formData.append("location[latitude]", String(payload.location.latitude));
  formData.append("location[longitude]", String(payload.location.longitude));

  if (payload.location.location_name != null) {
    formData.append("location[location_name]", payload.location.location_name);
  }

  if (payload.location.address != null) {
    formData.append("location[address]", payload.location.address);
  }

  if (payload.notes != null) {
    formData.append("notes", payload.notes);
  }

  payload.services.forEach((service, serviceIndex) => {
    formData.append(`services[${serviceIndex}][service_key]`, service.service_key);
    formData.append(`services[${serviceIndex}][price]`, String(service.price));
    formData.append(
      `services[${serviceIndex}][execution_time_minutes]`,
      String(service.execution_time_minutes),
    );

    if (service.execution_instructions != null) {
      formData.append(
        `services[${serviceIndex}][execution_instructions]`,
        service.execution_instructions,
      );
    }

    service.products.forEach((product, productIndex) => {
      formData.append(
        `services[${serviceIndex}][products][${productIndex}][product_id]`,
        String(product.product_id),
      );

      if (product.product_details != null) {
        formData.append(
          `services[${serviceIndex}][products][${productIndex}][product_details]`,
          JSON.stringify(product.product_details),
        );
      }
    });
  });

  // Attach document files as request_files on the first service
  if (payload.documentFiles && payload.documentFiles.length > 0) {
    payload.documentFiles.forEach((file, fileIndex) => {
      formData.append(`services[0][request_files][${fileIndex}]`, file, file.name);
    });
  }

  const response = await apiClient.post<CreateTaskResponse>(
    CREATE_TASK_ENDPOINT,
    formData,
    {
      headers: {
        "X-Company-Slug": companySlug,
        // Do NOT set Content-Type manually — axios handles multipart boundary automatically
      },
    },
  );

  return response.data;
}
