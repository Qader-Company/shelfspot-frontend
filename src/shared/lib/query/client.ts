import {
  isServer,
  MutationCache,
  QueryClient,
} from "@tanstack/react-query";

function createQueryClient() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: async () => {
        // Every dashboard mutation can affect a visible list, its filters,
        // hierarchy options, trash counts, or related catalog resources.
        // Refetch active app queries immediately so no manual page reload is
        // needed after create, update, delete, restore, or import actions.
        await queryClient.invalidateQueries({
          queryKey: ["app"],
          refetchType: "active",
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });

  return queryClient;
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
