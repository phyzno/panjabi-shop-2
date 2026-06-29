import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductDraft {
  fabricId: string | null;
  yardage: number;
  productStyles: Record<string, string>;
  
  // Measurements & Sizing
  sizeType: 'preset' | 'custom';
  standardSize: string;
  measurementMode: 'saved' | 'new';
  selectedPerson: string;
  selectedFitId: number | null;
  customMeasurements: Record<string, string>;
  
  // Progress Tracking (For our Info/Detail Modal & Sequential Flow)
  completedSteps: string[]; // e.g., ['product', 'fabric', 'style', 'advanced', 'measurements']
}

// ডিফল্ট ড্রাফট টেমপ্লেট
const defaultDraft: ProductDraft = {
  fabricId: null,
  yardage: 2.5,
  productStyles: {},
  sizeType: 'preset',
  standardSize: 'M',
  measurementMode: 'new',
  selectedPerson: '',
  selectedFitId: null,
  customMeasurements: {},
  completedSteps: ['product'], // প্রোডাক্ট সিলেক্ট করার সাথে সাথেই এটি কমপ্লিট হবে
};

interface CustomizerState {
  // Global States (Zero-State Support)
  activeProductId: string | null; 
  orderMode: 'tailoring' | 'fabric';
  specialInstructions: string;
  searchQuery: string;
  selectedColors: string[];
  selectedTypes: string[];

  // Drafts Dictionary (productId -> ProductDraft)
  drafts: Record<string, ProductDraft>;

  // Global Actions
  setActiveProduct: (productId: string | null) => void;
  setOrderMode: (mode: 'tailoring' | 'fabric') => void;
  setSpecialInstructions: (text: string) => void;
  setSearchQuery: (query: string) => void;
  toggleColorFilter: (color: string) => void;
  toggleTypeFilter: (type: string) => void;
  
  // Draft Actions
  initDraft: (productId: string, defaultStyles: Record<string, string>, defaultFabricId: string | null) => void;
  updateDraft: (productId: string, updates: Partial<ProductDraft>) => void;
  updateDraftStyle: (productId: string, key: string, value: string) => void;
  updateDraftMeasurement: (productId: string, key: string, value: string) => void;
  markStepCompleted: (productId: string, step: string) => void;
  
  clearDraft: (productId: string) => void;
  resetEntireStore: () => void;
}

export const useCustomizerStore = create<CustomizerState>()(
  persist(
    (set, get) => ({
      activeProductId: null, // শুরুতে ক্যানভাস এবং অপশন ব্ল্যাংক থাকবে
      orderMode: 'tailoring',
      specialInstructions: '',
      searchQuery: '',
      selectedColors: [],
      selectedTypes: [],
      drafts: {},

      setActiveProduct: (productId) => set({ activeProductId: productId }),
      setOrderMode: (orderMode) => set({ orderMode }),
      setSpecialInstructions: (specialInstructions) => set({ specialInstructions }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      
      toggleColorFilter: (color) => set((state) => ({
        selectedColors: state.selectedColors.includes(color) 
          ? state.selectedColors.filter(c => c !== color) 
          : [...state.selectedColors, color]
      })),
      toggleTypeFilter: (type) => set((state) => ({
        selectedTypes: state.selectedTypes.includes(type) 
          ? state.selectedTypes.filter(t => t !== type) 
          : [...state.selectedTypes, type]
      })),

      // Smart Default Initializer
      initDraft: (productId, defaultStyles, defaultFabricId) => set((state) => {
        // যদি ড্রাফট আগে থেকেই থাকে (In-progress), তবে সেটি ওভাররাইট করবে না
        if (state.drafts[productId]) {
          return state; 
        }
        // নতুন হলে Smart Default দিয়ে ড্রাফট তৈরি করবে
        return {
          drafts: {
            ...state.drafts,
            [productId]: {
              ...defaultDraft,
              productStyles: defaultStyles,
              fabricId: defaultFabricId,
            }
          }
        };
      }),

      updateDraft: (productId, updates) => set((state) => {
        const currentDraft = state.drafts[productId];
        if (!currentDraft) return state;
        return {
          drafts: {
            ...state.drafts,
            [productId]: { ...currentDraft, ...updates }
          }
        };
      }),

      updateDraftStyle: (productId, key, value) => set((state) => {
        const currentDraft = state.drafts[productId];
        if (!currentDraft) return state;
        return {
          drafts: {
            ...state.drafts,
            [productId]: {
              ...currentDraft,
              productStyles: { ...currentDraft.productStyles, [key]: value }
            }
          }
        };
      }),

      updateDraftMeasurement: (productId, key, value) => set((state) => {
        const currentDraft = state.drafts[productId];
        if (!currentDraft) return state;
        return {
          drafts: {
            ...state.drafts,
            [productId]: {
              ...currentDraft,
              customMeasurements: { ...currentDraft.customMeasurements, [key]: value }
            }
          }
        };
      }),

      markStepCompleted: (productId, step) => set((state) => {
        const currentDraft = state.drafts[productId];
        if (!currentDraft) return state;
        const steps = new Set(currentDraft.completedSteps);
        steps.add(step);
        return {
          drafts: {
            ...state.drafts,
            [productId]: { ...currentDraft, completedSteps: Array.from(steps) }
          }
        };
      }),

      // Add To Cart করার পর নির্দিষ্ট প্রোডাক্টের ড্রাফট ক্লিয়ার করা
      clearDraft: (productId) => set((state) => {
        const newDrafts = { ...state.drafts };
        delete newDrafts[productId];
        return { drafts: newDrafts, activeProductId: null };
      }),

      // ফুল ম্যানুয়াল রিসেট
      resetEntireStore: () => set({
        activeProductId: null,
        orderMode: 'tailoring',
        specialInstructions: '',
        searchQuery: '',
        selectedColors: [],
        selectedTypes: [],
        drafts: {},
      }),
    }),
    {
      // স্টোরেজ নাম পরিবর্তন করা হলো (v2), যাতে পুরনো ডেটা স্ট্রাকচারের কারণে সাইট ক্র্যাশ না করে
      name: 'bespoke-atelier-storage-v2',
    }
  )
);