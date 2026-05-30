import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CART_STORAGE_KEY = 'panjabi-shop-cart';

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  productType: 'readymade' | 'custom_fabric_only' | 'custom_tailored';
  image: string; // কার্টে প্রোডাক্টের ছবি দেখানোর জন্য

  fabricId?: string;
  fabricName?: string;
  fabricImage?: string;
  yardage?: number;
  customMeasurements?: Record<string, string | number>;
  collarType?: string;

  quantity: number;
  unitPrice: number;
  stitchingCharge: number;
  totalPrice: number;

  sizeMode?: 'preset' | 'number' | 'custom_measurements' | 'saved_profile';
  sizeValue?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // কার্ট ড্রয়ার ওপেন/ক্লোজ স্টেট
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'cartItemId' | 'quantity' | 'totalPrice'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubTotal: () => number;
}

let isCartCrossTabSyncReady = false;

function readPersistedCartItems(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed?.state?.items) ? parsed.state.items : [];
  } catch {
    return [];
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        set((state) => {
          // চেক করা হচ্ছে একই প্রোডাক্ট এবং একই সাইজ কার্টে আছে কিনা
          const existingItem = state.items.find((i) =>
            i.productId === item.productId &&
            i.productType === item.productType &&
            i.sizeValue === item.sizeValue &&
            i.fabricId === item.fabricId &&
            i.yardage === item.yardage &&
            i.collarType === item.collarType &&
            // Custom measurement thakle shob map perfectly match kore kina check korbe
            JSON.stringify(i.customMeasurements) === JSON.stringify(item.customMeasurements)
          );

          const unitPrice = item.unitPrice ?? 0;
          const stitchingCharge = item.stitchingCharge ?? 0;

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.cartItemId === existingItem.cartItemId
                  ? {
                    ...i,
                    quantity: i.quantity + 1,
                    totalPrice: (i.quantity + 1) * ((i.unitPrice ?? 0) + (i.stitchingCharge ?? 0))
                  }
                  : i
              ),
              isOpen: true,
            };
          }

          const cartItemId = Math.random().toString(36).substring(2, 9);
          const newItem: CartItem = {
            ...item,
            cartItemId,
            quantity: 1,
            totalPrice: unitPrice + stitchingCharge,
          };

          return {
            items: [...state.items, newItem],
            isOpen: true
          };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.cartItemId === cartItemId && quantity > 0
              ? { ...i, quantity, totalPrice: quantity * ((i.unitPrice ?? 0) + (i.stitchingCharge ?? 0)) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubTotal: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },
    }),
    {
      name: CART_STORAGE_KEY,
      // শুধুমাত্র items গুলোকে লোকাল স্টোরেজে সেভ করা হচ্ছে, isOpen স্টেট নয়
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function initCartCrossTabSync() {
  if (typeof window === 'undefined' || isCartCrossTabSyncReady) return;

  isCartCrossTabSyncReady = true;

  window.addEventListener('storage', (event) => {
    if (event.key !== CART_STORAGE_KEY) return;

    useCartStore.setState({
      items: readPersistedCartItems(event.newValue),
    });
  });
}
