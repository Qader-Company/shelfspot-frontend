export const TRASH_TABS = ["brands", "sub-brands", "categories", "sub-categories", "products", "requests", "freelancers", "companies"] as const;
export type TrashTab = (typeof TRASH_TABS)[number];

export interface TrashItem {
  id: string;
  name: string;
  secondary?: string;
  image?: string;
  active: boolean;
  deletedAt?: string;
  brand?: string;
  subBrand?: string;
  category?: string;
  family?: string;
  sku?: string;
  description?: string;
  phone?: string;
  email?: string;
  completedTasks?: number;
  industry?: string;
  crNumber?: string;
  storeName?: string;
  price?: number;
  status?: string;
}

