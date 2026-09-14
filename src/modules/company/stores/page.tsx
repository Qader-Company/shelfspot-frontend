"use client";
import { useQueryClient } from "@tanstack/react-query";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { StoresView } from "./view";
import { storesKey, useStoresQuery } from "./hooks";
import { saveStore, deleteStore, bulkDeleteStores, toggleStore, getStore } from "./service";
export function StoresPage() {
  const query = useStoresQuery(), client = useQueryClient();
  async function mutate(action: () => Promise<void>) { await action(); await client.invalidateQueries({ queryKey: storesKey }); }
  return <StoresView stores={query.data ?? []} loading={query.isPending} error={query.isError ? normalizeApiError(query.error).message : undefined} onRetry={() => void query.refetch()} onSave={(input, id) => mutate(() => saveStore(input, id))} onDelete={id => mutate(() => deleteStore(id))} onBulkDelete={ids => mutate(() => bulkDeleteStores(ids))} onToggle={store => mutate(() => toggleStore(store))} onLoad={getStore} />;
}
