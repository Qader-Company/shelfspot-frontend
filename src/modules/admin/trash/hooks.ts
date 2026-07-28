import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrash, permanentlyDeleteTrashItem, restoreTrashItem } from "./service";
import type { TrashTab } from "./types";

export function useTrash(tab: TrashTab) { return useQuery({ queryKey: ["admin", "trash", tab], queryFn: () => getTrash(tab) }); }
export function useRestoreTrash() { const client = useQueryClient(); return useMutation({ mutationFn: restoreTrashItem, onSuccess: (_d, v) => client.invalidateQueries({ queryKey: ["admin", "trash", v.tab] }) }); }
export function usePermanentDeleteTrash() { const client = useQueryClient(); return useMutation({ mutationFn: permanentlyDeleteTrashItem, onSuccess: (_d, v) => client.invalidateQueries({ queryKey: ["admin", "trash", v.tab] }) }); }

