export interface CompanyService {
  id: number;
  key: string;
  name: string;
  minimum_price: number;
  minimum_execution_time: number;
  description?: string | null;
}

export interface GetServicesResponse {
  success: boolean;
  message: string;
  data: CompanyService[];
}
