import { create } from 'zustand';

interface SizeGuideState {
  isOpen: boolean;
  isGlobal: boolean;
  defaultTab: 'chart' | 'guide';
  defaultCategory: string;
  openModal: (config?: { isGlobal?: boolean; tab?: 'chart' | 'guide'; category?: string }) => void;
  closeModal: () => void;
}

export const useSizeGuideStore = create<SizeGuideState>((set) => ({
  isOpen: false,
  isGlobal: true, 
  defaultTab: 'chart',
  defaultCategory: 'panjabi',
  openModal: (config) => set({ 
    isOpen: true, 
    isGlobal: config?.isGlobal ?? true,
    defaultTab: config?.tab ?? 'chart',
    defaultCategory: config?.category ?? 'panjabi'
  }),
  closeModal: () => set({ isOpen: false }),
}));