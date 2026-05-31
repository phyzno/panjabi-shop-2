import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomizerState {
  orderMode: 'tailoring' | 'fabric';
  selectedFabricId: string | null;
  yardage: number;
  collarId: string | null;
  sizeType: 'preset' | 'custom';
  standardSize: string;
  specialInstructions: string;
  
  searchQuery: string;
  selectedColors: string[];
  selectedTypes: string[];

  measurementMode: 'saved' | 'new';
  selectedProfileId: string;
  customLength: string;
  customChest: string;
  customShoulder: string;
  customSleeve: string;

  setOrderMode: (mode: 'tailoring' | 'fabric') => void;
  setSelectedFabricId: (id: string | null) => void;
  setYardage: (yards: number) => void;
  setCollarId: (id: string | null) => void;
  setSizeType: (type: 'preset' | 'custom') => void;
  setStandardSize: (size: string) => void;
  setSpecialInstructions: (text: string) => void;
  setSearchQuery: (query: string) => void;
  toggleColorFilter: (color: string) => void;
  toggleTypeFilter: (type: string) => void;

  setMeasurementMode: (mode: 'saved' | 'new') => void;
  setSelectedProfileId: (id: string) => void;
  setCustomLength: (val: string) => void;
  setCustomChest: (val: string) => void;
  setCustomShoulder: (val: string) => void;
  setCustomSleeve: (val: string) => void;
  resetCustomizer: () => void;
}

export const useCustomizerStore = create<CustomizerState>()(
  persist(
    (set) => ({
      orderMode: 'tailoring',
      selectedFabricId: null,
      yardage: 2.5,
      collarId: null,
      sizeType: 'preset',
      standardSize: 'M',
      specialInstructions: '',
      searchQuery: '',
      selectedColors: [],
      selectedTypes: [],

      measurementMode: 'new',
      selectedProfileId: '',
      customLength: '',
      customChest: '',
      customShoulder: '',
      customSleeve: '',

      setOrderMode: (orderMode) => set({ orderMode }),
      setSelectedFabricId: (selectedFabricId) => set({ selectedFabricId }),
      setYardage: (yardage) => set({ yardage }),
      setCollarId: (collarId) => set({ collarId }),
      setSizeType: (sizeType) => set({ sizeType }),
      setStandardSize: (standardSize) => set({ standardSize }),
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

      setMeasurementMode: (measurementMode) => set({ measurementMode }),
      setSelectedProfileId: (selectedProfileId) => set({ selectedProfileId }),
      setCustomLength: (customLength) => set({ customLength }),
      setCustomChest: (customChest) => set({ customChest }),
      setCustomShoulder: (customShoulder) => set({ customShoulder }),
      setCustomSleeve: (customSleeve) => set({ customSleeve }),

      resetCustomizer: () => set({
        orderMode: 'tailoring',
        selectedFabricId: null,
        collarId: null,
        yardage: 2.5,
        sizeType: 'preset',
        standardSize: 'M',
        specialInstructions: '',
        measurementMode: 'new',
        selectedProfileId: '',
        customLength: '',
        customChest: '',
        customShoulder: '',
        customSleeve: '',
        searchQuery: '',
        selectedColors: [],
        selectedTypes: [],
      }),
    }),
    {
      name: 'panjabi-customizer-storage',
    }
  )
);