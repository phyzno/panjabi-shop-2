import { create } from 'zustand';

interface SizeGuideStore {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useSizeGuideStore = create<SizeGuideStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));