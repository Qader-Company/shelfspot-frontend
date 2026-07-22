"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { forceDeleteTrash, getTrash, restoreTrash, type TrashResource } from "@/modules/company/dashboard/services/trash-service";
export function useTrashQuery(resource: TrashResource, page: number) { return useQuery({ queryKey: ["app", "trash", resource, page], queryFn: () => getTrash(resource, page), placeholderData: (previous) => previous }); }
export function useRestoreTrashMutation() { return useMutation({ mutationFn: ({ resource, ids }: { resource: TrashResource; ids: string[] }) => restoreTrash(resource, ids) }); }
export function useForceDeleteTrashMutation() { return useMutation({ mutationFn: ({ resource, ids }: { resource: TrashResource; ids: string[] }) => forceDeleteTrash(resource, ids) }); }
