import { apiClient } from "@/shared/lib/api/client";
import type { Store, StoreInput } from "./types";
const endpoint = "/api/company/stores";
type Row = Record<string, unknown>;
function record(value: unknown): Row { return value && typeof value === "object" && !Array.isArray(value) ? value as Row : {}; }
function coordinate(value: unknown): number | null { return value == null || value === "" || !Number.isFinite(Number(value)) ? null : Number(value); }
export function normalizeStore(value: unknown): Store {
  const item = record(value), latitude = coordinate(item.latitude), longitude = coordinate(item.longitude), status = item.is_active ?? item.active;
  return { id: String(item.id ?? item.value ?? ""), name: String(item.name ?? item.label ?? ""), number: String(item.number ?? ""), latitude, longitude, location: latitude != null && longitude != null ? `${latitude}, ${longitude}` : "—", address: String(item.address ?? ""), active: status == null || status === true || status === 1 || status === "1" };
}
function rows(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const outer = record(response);
  if (Array.isArray(outer.data)) return outer.data;
  const data = record(outer.data);
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.stores)) return data.stores;
  if (Array.isArray(outer.stores)) return outer.stores;
  throw new Error("Unexpected stores response");
}
async function list(path: string) {
  const result: Store[] = []; let page = 1, last = 1;
  do {
    const response = (await apiClient.get(path, { params: { page, per_page: 100 } })).data;
    result.push(...rows(response).map(normalizeStore));
    const root = record(response), data = record(root.data), meta = record(root.meta ?? data.meta ?? data);
    last = Math.max(1, Number(meta.last_page ?? root.last_page ?? 1)); page++;
  } while (page <= last);
  return result;
}
export const getStores = () => list(endpoint);
export const getStoreOptions = () => list(`${endpoint}/options`);
export async function getStore(id: string): Promise<Store> {
  const response = (await apiClient.get(`${endpoint}/${encodeURIComponent(id)}`)).data;
  return normalizeStore(response.data ?? response);
}
export function storePayload(input: StoreInput) {
  return { name: input.name, number: input.number, latitude: Number(input.latitude), longitude: Number(input.longitude), address: input.address, is_active: input.active ? 1 : 0 };
}
export async function saveStore(input: StoreInput, id?: string) {
  if (id) await apiClient.put(`${endpoint}/${encodeURIComponent(id)}`, storePayload(input));
  else await apiClient.post(endpoint, storePayload(input));
}
export async function deleteStore(id: string) { await apiClient.delete(`${endpoint}/${encodeURIComponent(id)}`); }
export async function bulkDeleteStores(ids: string[]) {
  const data = new URLSearchParams(); ids.forEach((id, index) => data.append(`ids[${index}]`, id));
  await apiClient.delete(`${endpoint}/bulk-delete`, { data, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
}
export async function toggleStore(store: Store) {
  const current = await getStore(store.id);
  await apiClient.put(`${endpoint}/${encodeURIComponent(store.id)}`, { name: current.name, number: current.number, latitude: current.latitude, longitude: current.longitude, address: current.address, is_active: store.active ? 0 : 1 });
}
