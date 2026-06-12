import { create } from 'zustand';

interface WishlistState {
  wishlistedIds: string[];
  setWishlistedIds: (ids: string[]) => void;
  addWishlistId: (id: string) => void;
  removeWishlistId: (id: string) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlistedIds: [],
  setWishlistedIds: (ids) => set({ wishlistedIds: ids }),
  addWishlistId: (id) => set((state) => ({ wishlistedIds: [...state.wishlistedIds, id] })),
  removeWishlistId: (id) => set((state) => ({ 
    wishlistedIds: state.wishlistedIds.filter(item => item !== id) 
  })),
}));
