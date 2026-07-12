export type TrashTabKey =
  | "brand"
  | "subBrand"
  | "category"
  | "subCategory"
  | "products"
  | "requests";

export interface TrashTabItem {
  key: TrashTabKey;
  labelKey: string;
  count: number;
}

export interface TrashRow {
  id: string;
  productName: string;
  thumbnailAlt: string;
  pathSegments: string[];
  sku: string;
  description: string;
  isActive: boolean;
  deletedDate: string;
}

// ─── Tabs ──────────────────────────────────────────────────────────────────

export const trashTabs: TrashTabItem[] = [
  { key: "brand",       labelKey: "trashPage.tabs.brand",       count: 6  },
  { key: "subBrand",    labelKey: "trashPage.tabs.subBrand",    count: 7  },
  { key: "category",    labelKey: "trashPage.tabs.category",    count: 7  },
  { key: "subCategory", labelKey: "trashPage.tabs.subCategory", count: 1  },
  { key: "products",    labelKey: "trashPage.tabs.products",    count: 22 },
  { key: "requests",    labelKey: "trashPage.tabs.requests",    count: 21 },
];

export const trashDefaultTab: TrashTabKey = "products";

// ─── Table rows ────────────────────────────────────────────────────────────

const demoPath = ["PepsiCo", "Pepsi Diet", "Soft Drinks", "Soft Drinks"];

export const trashRows: TrashRow[] = [
  { id: "trash-1",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: true,  deletedDate: "22 May 2026" },
  { id: "trash-2",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: false, deletedDate: "22 May 2026" },
  { id: "trash-3",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: true,  deletedDate: "22 May 2026" },
  { id: "trash-4",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: true,  deletedDate: "22 May 2026" },
  { id: "trash-5",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: false, deletedDate: "22 May 2026" },
  { id: "trash-6",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: true,  deletedDate: "22 May 2026" },
  { id: "trash-7",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: false, deletedDate: "22 May 2026" },
  { id: "trash-8",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: true,  deletedDate: "22 May 2026" },
  { id: "trash-9",  productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: true,  deletedDate: "22 May 2026" },
  { id: "trash-10", productName: "Diet Drinks", thumbnailAlt: "Diet Drinks product image", pathSegments: demoPath, sku: "123SKU", description: "-", isActive: true,  deletedDate: "22 May 2026" },
];

// ─── Pagination ────────────────────────────────────────────────────────────

export const trashPagination = {
  pages: ["1", "2", "3", "...", "8", "9", "10"],
  activePage: "1",
};
