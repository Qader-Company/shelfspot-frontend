import type { StatusBadgeStatus } from "@/modules/dashboard/components/status-badge";

// ─── Status types ───────────────────────────────────────────────────────────

/** Catalog items display status as a toggle for most rows, text badge for others. */
export type CatalogStatusDisplay = "toggle" | "badge";

// ─── Shared row base ────────────────────────────────────────────────────────

export interface CatalogBaseRow {
  id: string;
  name: string;
  thumbnailAlt: string;
  thumbnailUrl?: string | null;
  isActive: boolean;
  statusDisplay: CatalogStatusDisplay;
  /** Only used when statusDisplay === "badge" */
  badgeStatus?: Extract<StatusBadgeStatus, "active" | "inactive">;
  createdDate: string;
}

// ─── Brand ──────────────────────────────────────────────────────────────────

export type BrandRow = CatalogBaseRow;

// ─── Sub-Brand ──────────────────────────────────────────────────────────────

export interface SubBrandRow extends CatalogBaseRow {
  brand: string;
}

// ─── Category ───────────────────────────────────────────────────────────────

export interface CategoryRow extends CatalogBaseRow {
  brand: string;
  subBrand: string;
}

// ─── Sub-Category ───────────────────────────────────────────────────────────

export interface SubCategoryRow extends CatalogBaseRow {
  brand: string;
  subBrand: string;
  category: string;
}

// ─── Product ────────────────────────────────────────────────────────────────

export interface ProductRow extends CatalogBaseRow {
  pathSegments: string[];
  sku: string;
  description: string;
}

// ─── Dropdown options ────────────────────────────────────────────────────────

export const catalogBrandOptions = ["PepsiCo", "Coca-Cola"] as const;
export const catalogSubBrandOptions = ["Pepsi Diet", "Pepsi Max", "Pepsi Original"] as const;
export const catalogCategoryOptions = ["Soft Drinks", "Juices", "Water"] as const;
export const catalogSubCategoryOptions = ["Diet Drinks", "Zero Sugar", "Classic"] as const;

// ─── Mock rows ────────────────────────────────────────────────────────────

const date = "22 May 2026, 15:43PM";
const dateShort = "22 May 2026";

function makeRows<T extends CatalogBaseRow>(
  builder: (index: number) => Omit<T, keyof CatalogBaseRow>,
  name: string,
  thumbAlt: string,
  prefix: string,
): T[] {
  return Array.from({ length: 10 }, (_, i) => {
    const isLast2 = i >= 8;
    return {
      id: `${prefix}-${i + 1}`,
      name,
      thumbnailAlt: thumbAlt,
      isActive: i % 3 !== 1,  // rows 2,5,8 are OFF
      statusDisplay: isLast2 ? "badge" : "toggle",
      badgeStatus: isLast2 ? (i % 3 !== 1 ? "active" : "inactive") : undefined,
      createdDate: date,
      ...builder(i),
    } as T;
  });
}

export const brandRows: BrandRow[] = makeRows<BrandRow>(
  () => ({}),
  "PepsiCo",
  "PepsiCo brand logo",
  "brand",
);

export const subBrandRows: SubBrandRow[] = makeRows<SubBrandRow>(
  () => ({ brand: "PepsiCo" }),
  "Pepsi Diet",
  "Pepsi Diet sub-brand image",
  "subbrand",
);

export const categoryRows: CategoryRow[] = makeRows<CategoryRow>(
  () => ({ brand: "PepsiCo", subBrand: "Pepsi Diet" }),
  "Soft Drinks",
  "Soft Drinks category image",
  "cat",
);

export const subCategoryRows: SubCategoryRow[] = makeRows<SubCategoryRow>(
  () => ({ brand: "PepsiCo", subBrand: "Pepsi Diet", category: "Soft Drinks" }),
  "Diet Drinks",
  "Diet Drinks sub-category image",
  "subcat",
);

const productPath = ["PepsiCo", "Pepsi Diet", "Soft Drinks", "Soft Drinks"];

export const productRows: ProductRow[] = Array.from({ length: 10 }, (_, i) => {
  const isLast2 = i >= 8;
  return {
    id: `prod-${i + 1}`,
    name: "Diet Drinks",
    thumbnailAlt: "Diet Drinks product image",
    isActive: i % 3 !== 1,
    statusDisplay: isLast2 ? "badge" : "toggle",
    badgeStatus: isLast2 ? (i % 3 !== 1 ? "active" : "inactive") : undefined,
    createdDate: dateShort,
    pathSegments: productPath,
    sku: "123SKU",
    description: "-",
  };
});

// ─── Pagination ────────────────────────────────────────────────────────────

export const catalogPagination = {
  pages: ["1", "2", "3", "...", "8", "9", "10"],
  activePage: "1",
};
