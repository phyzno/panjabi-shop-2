import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomizerState {
  // Core Product Selection
  selectedProduct: string; 
  productStyles: Record<string, string>;

  // Order & Fabric Preferences
  orderMode: 'tailoring' | 'fabric';
  selectedFabricId: string | null;
  yardage: number;
  collarId: string | null; 
  sizeType: 'preset' | 'custom';
  standardSize: string;
  specialInstructions: string;
  
  // Filtering & Search
  searchQuery: string;
  selectedColors: string[];
  selectedTypes: string[];

  // Measurements
  measurementMode: 'saved' | 'new';
  selectedPerson: string; // First Dropdown
  selectedFitId: number | null; // Second Dropdown
  customMeasurements: Record<string, string>; // Dynamic Inputs

  // Actions
  setSelectedProduct: (product: string) => void;
  setProductStyle: (key: string, value: string) => void;
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
  setSelectedPerson: (name: string) => void;
  setSelectedFitId: (id: number | null) => void;
  setCustomMeasurement: (key: string, value: string) => void;
  resetCustomizer: () => void;
}

export const useCustomizerStore = create<CustomizerState>()(
  persist(
    (set) => ({
      // Defaults
      selectedProduct: 'panjabi_regular',
      productStyles: {
        collar: 'band',
        placket: 'hidden',
        pocket: 'chest',
      },
      orderMode: 'tailoring',
      selectedFabricId: null,
      yardage: 2.5,
      collarId: 'band', 
      sizeType: 'preset',
      standardSize: 'M',
      specialInstructions: '',
      searchQuery: '',
      selectedColors: [],
      selectedTypes: [],
      measurementMode: 'new',
      selectedPerson: '',
      selectedFitId: null,
      customMeasurements: {},

      // State Setters
      setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
      setProductStyle: (key, value) => set((state) => ({
        productStyles: { ...state.productStyles, [key]: value }
      })),
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
      setSelectedPerson: (selectedPerson) => set({ selectedPerson }),
      setSelectedFitId: (selectedFitId) => set({ selectedFitId }),
      setCustomMeasurement: (key, value) => set((state) => ({
        customMeasurements: { ...state.customMeasurements, [key]: value }
      })),

      resetCustomizer: () => set({
        selectedProduct: 'panjabi_regular',
        productStyles: { collar: 'band', placket: 'hidden', pocket: 'chest' },
        orderMode: 'tailoring',
        selectedFabricId: null,
        collarId: 'band',
        yardage: 2.5,
        sizeType: 'preset',
        standardSize: 'M',
        specialInstructions: '',
        measurementMode: 'new',
        selectedPerson: '',
        selectedFitId: null,
        customMeasurements: {},
        searchQuery: '',
        selectedColors: [],
        selectedTypes: [],
      }),
    }),
    {
      name: 'bespoke-atelier-storage',
    }
  )
);