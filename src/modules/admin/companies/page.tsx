import { notFound } from "next/navigation";

import {
  BrandPage,
  CategoryPage,
  ProductPage,
  SubBrandPage,
  SubCategoryPage,
} from "@/modules/dashboard/catalog";

const catalogPages = {
  brand: BrandPage,
  "sub-brand": SubBrandPage,
  category: CategoryPage,
  "sub-category": SubCategoryPage,
  product: ProductPage,
} as const;

export type AdminCompanyCatalogResource = keyof typeof catalogPages;

interface AdminCompanyCatalogPageProps {
  resource: string;
}

export function AdminCompanyCatalogPage({
  resource,
}: AdminCompanyCatalogPageProps) {
  const Page = catalogPages[resource as AdminCompanyCatalogResource];

  if (!Page) notFound();

  return <Page />;
}
