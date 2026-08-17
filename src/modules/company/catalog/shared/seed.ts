import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";

export type CatalogStatusDisplay = "toggle" | "badge";

export interface CatalogBaseRow {
  id: string;
  name: string;
  thumbnailAlt: string;
  thumbnailUrl?: string | null;
  isActive: boolean;
  statusDisplay: CatalogStatusDisplay;
  badgeStatus?: Extract<StatusBadgeStatus, "active" | "inactive">;
  createdDate: string;
}

export type BrandRow = CatalogBaseRow;

export interface SubBrandRow extends CatalogBaseRow {
  brand: string;
}

export interface CategoryRow extends CatalogBaseRow {
  brand: string;
  subBrand: string;
}

export interface SubCategoryRow extends CatalogBaseRow {
  brand: string;
  subBrand: string;
  category: string;
}

export interface ProductRow extends CatalogBaseRow {
  pathSegments: string[];
  sku: string;
  barcode: string;
  description: string;
}
