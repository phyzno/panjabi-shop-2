import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  productName: string;
  color: string;
  colorName: string;
  fabricType: string;
  fabricName: string;
  collarStyle: string;
  sleeveStyle: string;
  buttonStyle: string;
  pocketStyle: string;
  lengthStyle: string;
  sizeType: 'standard' | 'custom';
  standardSize?: string;
  measurements?: Record<string, number>;
  specialInstructions?: string;
  fabricPrice: number;
  stitchingCharge: number;
  total: number;
  previewDataUrl: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ 
        items: [...state.items, { ...item, id: crypto.randomUUID() }] 
      })),
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter(item => item.id !== id) 
      })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.length,
      getSubtotal: () => get().items.reduce((total, item) => total + item.total, 0),
    }),
    {
      name: 'panjabi-cart-storage',
    }
  )
);
