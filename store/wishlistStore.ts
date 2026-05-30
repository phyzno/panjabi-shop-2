import { create } from 'zustand';

interface WishlistState {
  wishlistedIds: number[];
  setWishlistedIds: (ids: number[]) => void;
  addWishlistId: (id: number) => void;
  removeWishlistId: (id: number) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlistedIds: [],
  setWishlistedIds: (ids) => set({ wishlistedIds: ids }),
  addWishlistId: (id) => set((state) => ({ wishlistedIds: [...state.wishlistedIds, id] })),
  removeWishlistId: (id) => set((state) => ({ 
    wishlistedIds: state.wishlistedIds.filter(item => item !== id) 
  })),
}));