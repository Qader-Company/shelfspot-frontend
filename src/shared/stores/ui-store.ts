import { create } from "zustand";

interface UiState {
  isSidebarOpen: boolean;
}

export const useUiStore = create<UiState>(() => ({
  isSidebarOpen: false,
}));
