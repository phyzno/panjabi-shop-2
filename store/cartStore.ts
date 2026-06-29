import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CART_STORAGE_KEY = 'panjabi-shop-cart';

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  productType: 'readymade' | 'custom_fabric_only' | 'custom_tailored';
  image: string;

  fabricId?: string;
  fabricName?: string;
  fabricImage?: string;
  yardage?: number;
  
  // Customization Data
  customMeasurements?: Record<string, string | number>;
  productStyles?: Record<string, string>;
  tailoringDetails?: Record<string, string>;

  quantity: number;
  
  // Pricing Data (Industry Standard)
  originalUnitPrice: number;
  discountPercentage: number;
  unitPrice: number;
  stitchingCharge: number;
  
  originalTotalPrice: number;
  totalPrice: number;

  sizeMode?: 'preset' | 'number' | 'custom_measurements' | 'saved_profile';
  sizeValue?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'cartItemId' | 'quantity' | 'totalPrice' | 'originalTotalPrice'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Calculation Helpers
  getSubTotal: () => number;
  getOriginalSubTotal: () => number;
  getTotalSavings: () => number;
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
          // Strict Duplicate Checking
          const existingItem = state.items.find((i) =>
            i.productId === item.productId &&
            i.productType === item.productType &&
            i.sizeValue === item.sizeValue &&
            i.fabricId === item.fabricId &&
            i.yardage === item.yardage &&
            JSON.stringify(i.customMeasurements) === JSON.stringify(item.customMeasurements) &&
            JSON.stringify(i.productStyles) === JSON.stringify(item.productStyles) &&
            JSON.stringify(i.tailoringDetails) === JSON.stringify(item.tailoringDetails)
          );

          const originalUnitPrice = item.originalUnitPrice ?? item.unitPrice ?? 0;
          const unitPrice = item.unitPrice ?? 0;
          const stitchingCharge = item.stitchingCharge ?? 0;

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.cartItemId === existingItem.cartItemId
                  ? {
                    ...i,
                    quantity: i.quantity + 1,
                    originalTotalPrice: (i.quantity + 1) * (originalUnitPrice + stitchingCharge),
                    totalPrice: (i.quantity + 1) * (unitPrice + stitchingCharge)
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
            originalTotalPrice: originalUnitPrice + stitchingCharge,
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
              ? { 
                  ...i, 
                  quantity, 
                  originalTotalPrice: quantity * ((i.originalUnitPrice ?? 0) + (i.stitchingCharge ?? 0)),
                  totalPrice: quantity * ((i.unitPrice ?? 0) + (i.stitchingCharge ?? 0)) 
                }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // 🎯 Helper: Final Price Sum (Subtotal for Checkout)
      getSubTotal: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },

      // 🎯 Helper: Original Price Sum (Without Discounts)
      getOriginalSubTotal: () => {
        return get().items.reduce((total, item) => total + item.originalTotalPrice, 0);
      },

      // 🎯 Helper: Total Savings (Original - Final)
      getTotalSavings: () => {
        const originalTotal = get().getOriginalSubTotal();
        const finalTotal = get().getSubTotal();
        return Math.max(0, originalTotal - finalTotal);
      }
    }),
    {
      name: CART_STORAGE_KEY,
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