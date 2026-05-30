"use client";

import React, { useState, useMemo, useEffect } from "react";
import { PanjabiCanvas } from './PanjabiCanvas';
import { useCustomizerStore } from '@/store/useCustomizerStore';
import { resolveProductImageSrc } from '@/lib/productImages';
import { Search, Info, Check, ChevronDown, ChevronUp, ShoppingBag, Ruler, Calculator, ChevronLeft, ChevronRight, X, ShoppingCart, RotateCcw } from "lucide-react";
import { useCartStore } from '@/store/cartStore';
import { addMeasurementProfile } from '@/lib/actions/measurement.actions'; // নতুন যুক্ত করা হয়েছে
import { useAuthStore } from '@/store/authStore';

// --- Mock Data ---
const presetSizes = [
  { size: "S", yard: 2.25 },
  { size: "M", yard: 2.5 },
  { size: "L", yard: 2.5 },
  { size: "XL", yard: 3.0 },
  { size: "XXL", yard: 3.25 }
];

const sizeOptions = ['preset', 'custom'] as const;

const CORE_COLLARS = [
  { id: 'band', name: 'Band Collar', type: 'band', image: '/assets/collars/band-collar.png' },
  { id: 'mandarin', name: 'Mandarin Collar', type: 'mandarin', image: '/assets/collars/mandarin-collar.png' },
  { id: 'round', name: 'Round Collar', type: 'round', image: '/assets/collars/round-collar.png' },
  { id: 'vneck', name: 'V-Neck Collar', type: 'vneck', image: '/assets/collars/vneck-collar.png' }
];

interface CustomizeClientProps {
  productId: string;
  fabrics: any[];
  collars?: any[];
  filterColors?: string[];
  filterPatterns?: string[];
  // নতুন প্রপস
  userId?: string | null;
  savedMeasurements?: any[];
}

export function CustomizeClient({
  productId,
  fabrics,
  collars,
  filterColors = [],
  filterPatterns = [],
  userId: serverUserId,
  savedMeasurements
}: CustomizeClientProps) {
  const { user, isLoaded } = useAuthStore();
  const userId = serverUserId || user?.id;

  const cartStore = useCartStore();
  const store = useCustomizerStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // --- New Measurement Flow States ---
  const [saveProfileToggle, setSaveProfileToggle] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [profileNameError, setProfileNameError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [hasSavedCurrentProfile, setHasSavedCurrentProfile] = useState(false);

  // Helper to determine collar type for canvas and image paths based on name
  const getCanvasCollarType = (collar: any) => {
    if (!collar || !collar.name) return 'band';
    const nameLower = collar.name.toLowerCase();
    if (nameLower.includes('v-neck') || nameLower.includes('vneck')) return 'vneck';
    if (nameLower.includes('round')) return 'round';
    if (nameLower.includes('mandarin')) return 'mandarin';
    return 'band';
  };

  // Accordion & Modal States
  const [expandedStep, setExpandedStep] = useState<number>(0);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalFabric, setModalFabric] = useState<any>(null);

  // Mobile UI States
  const [mobileStep, setMobileStep] = useState<'design' | 'checkout'>('design');
  const [activeBottomSheet, setActiveBottomSheet] = useState<'fabric' | 'collar' | null>(null);

  // Dropdown States for Filters
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isPatternDropdownOpen, setIsPatternDropdownOpen] = useState(false);

  // Fabric Filter States
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);

  // Custom Measurement Input States

  // Set default profile if saved measurements exist
  useEffect(() => {
    if (!isHydrated) return;
    if (savedMeasurements && savedMeasurements.length > 0 && !store.selectedProfileId) {
      const defaultProfile = savedMeasurements.find(p => p.is_default) || savedMeasurements[0];
      store.setSelectedProfileId(defaultProfile.id.toString());
    }
  }, [savedMeasurements, store.selectedProfileId]);

  // Check for duplicate profile names
  useEffect(() => {
    if (newProfileName && savedMeasurements) {
      const isDuplicate = savedMeasurements.some(
        (p) => p.profile_name.toLowerCase() === newProfileName.trim().toLowerCase()
      );
      if (isDuplicate) {
        setProfileNameError('A profile with this name already exists.');
      } else {
        setProfileNameError('');
      }
    } else {
      setProfileNameError('');
    }
  }, [newProfileName, savedMeasurements]);

  // Whenever custom measurements change, unlock the save profile button
  useEffect(() => {
    setHasSavedCurrentProfile(false);
  }, [store.customLength, store.customChest, store.customShoulder, store.customSleeve]);

  // Dynamic Yardage Synchronization (Auto Calculated) - Updated with Saved Profile logic
  const calculatedPanjabiYardage = useMemo(() => {
    // Check saved mode first
    if (store.measurementMode === 'saved') {
      const profile = savedMeasurements?.find(p => p.id.toString() === store.selectedProfileId);
      if (profile && profile.measurements) {
        const len = parseFloat(profile.measurements.length) || 0;
        const chest = parseFloat(profile.measurements.chest) || 0;
        let baseYard = 2.5;
        if (len > 0 && chest > 0) {
          baseYard = 2.25;
          if (len > 42) baseYard += 0.25;
          if (len > 46) baseYard += 0.25;
          if (chest > 44) baseYard += 0.25;
        }
        return baseYard;
      }
      return 2.5; // Default fallback if no profile loaded yet
    }

    if (store.sizeType === 'preset') {
      const found = presetSizes.find(p => p.size === store.standardSize);
      return found ? found.yard : 2.5;
    }

    // Auto calculate for custom size
    if (store.sizeType === 'custom') {
      const len = parseFloat(store.customLength) || 0;
      const chest = parseFloat(store.customChest) || 0;
      let baseYard = 2.5; // Default fallback

      if (len > 0 && chest > 0) {
        baseYard = 2.25;
        if (len > 42) baseYard += 0.25;
        if (len > 46) baseYard += 0.25;
        if (chest > 44) baseYard += 0.25;
      }
      return baseYard;
    }

    return 2.5;
  }, [store.measurementMode, store.selectedProfileId, savedMeasurements, store.sizeType, store.standardSize, store.customLength, store.customChest]);

  useEffect(() => {
    if (store.orderMode === 'fabric') {
      store.setYardage(calculatedPanjabiYardage);
    }
  }, [calculatedPanjabiYardage, store.orderMode, store.setYardage]);

  // Filtering Fabrics Array
  const filteredFabrics = useMemo(() => {
    return fabrics.filter((f: any) => {
      const matchSearch = f.name.toLowerCase().includes(store.searchQuery.toLowerCase());
      const matchColor = selectedColors.length === 0 || selectedColors.includes(f.color_tag);
      const matchPattern = selectedPatterns.length === 0 || selectedPatterns.includes(f.fabric_type);
      return matchSearch && matchColor && matchPattern;
    });
  }, [fabrics, store.searchQuery, selectedColors, selectedPatterns]);

  // Initial Configuration Sync
  useEffect(() => {
    if (!isHydrated) return;
    if (fabrics.length > 0 && !store.selectedFabricId) store.setSelectedFabricId(fabrics[0].id);
    if (!store.collarId) store.setCollarId(CORE_COLLARS[0].id);
  }, [fabrics]); 

  const selectedFabric = fabrics.find((f: any) => f.id === store.selectedFabricId) || fabrics[0];
  const selectedCollar = CORE_COLLARS.find((c: any) => c.id === store.collarId) || CORE_COLLARS[0];

  const selectedFabricImageUrl = selectedFabric?.image_url ? resolveProductImageSrc(selectedFabric.image_url) : undefined;
  const selectedFabricTextureUrl = selectedFabric?.texture_url || undefined;
  const selectedFabricRawUrl = selectedFabric?.raw_image_url || selectedFabric?.texture_url || undefined;

  // Price Calculation Engine
  const stitchingCharge = 450;
  const activeYardage = store.orderMode === 'tailoring' ? calculatedPanjabiYardage : store.yardage;
  const maxFabricYards = selectedFabric?.yards || 0;
  const isFabricStockSufficient = maxFabricYards >= activeYardage;

  const fabricPrice = (selectedFabric?.price || 0) * activeYardage;
  const collarPrice = 0;

  const totalCost = store.orderMode === 'tailoring'
    ? fabricPrice + stitchingCharge + collarPrice
    : fabricPrice;

  // Save Toggle & Login logic
  const handleSaveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked && !userId) {
      setSaveProfileToggle(false); // Force switch to stay OFF immediately
      setShowLoginModal(true);
      return;
    }
    setSaveProfileToggle(isChecked);
  };

  const goToLogin = () => {
    window.location.href = `/login?redirect=/customize/new`;
  };

  // নতুন Save Profile ফাংশন
  const handleSaveProfile = async () => {
    if (!newProfileName) {
      setProfileNameError('Please enter a profile name.');
      return;
    }
    if (profileNameError) return;

    setIsSavingProfile(true);
    const payload = {
      profile_name: newProfileName.trim(),
      is_default: !savedMeasurements || savedMeasurements.length === 0,
      measurements: {
        length: Number(store.customLength),
        chest: Number(store.customChest),
        shoulder: Number(store.customShoulder),
        sleeve: Number(store.customSleeve),
      }
    };
    
    try {
      const res = await addMeasurementProfile(userId!, payload);
      // সেভ হয়ে গেলে বাটন লক করে দিব
      if (res?.success) {
        setHasSavedCurrentProfile(true);
      } else {
        alert(res?.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isFabricStockSufficient) return;

    if (store.orderMode === 'tailoring' && store.measurementMode === 'saved') {
    const profile = savedMeasurements?.find(p => p.id.toString() === store.selectedProfileId);
    if (!profile) {
      alert("Please select or create a valid measurement profile first.");
      return;
    }
  }

    const isTailoring = store.orderMode === 'tailoring';

    // 2. Prepare custom measurements data based on active mode
    const selectedProfile = store.measurementMode === 'saved' && savedMeasurements
      ? savedMeasurements.find((p: any) => p.id.toString() === store.selectedProfileId)
      : null;

    const finalCustomMeasurements = isTailoring ? (
      store.measurementMode === 'saved' && selectedProfile ? {
        length: selectedProfile.measurements.length.toString(),
        chest: selectedProfile.measurements.chest.toString(),
        shoulder: selectedProfile.measurements.shoulder.toString(),
        sleeve: selectedProfile.measurements.sleeve.toString(),
      } : (store.sizeType === 'custom' ? {
        length: store.customLength,
        chest: store.customChest,
        shoulder: store.customShoulder,
        sleeve: store.customSleeve,
      } : undefined)
    ) : undefined;

    cartStore.addItem({
      productId: productId,
      productName: isTailoring
        ? `Custom Tailored Panjabi - ${selectedFabric?.name || 'Premium Fabric'}`
        : `Premium Fabric Bolt - ${selectedFabric?.name || 'Premium Fabric'}`,
      productType: isTailoring ? 'custom_tailored' : 'custom_fabric_only',
      image: selectedFabric?.raw_image_url || selectedFabric?.texture_url || '/placeholder-image.jpg',
      fabricId: selectedFabric?.id?.toString(),
      fabricName: selectedFabric?.name,
      fabricImage: selectedFabric?.texture_url,
      yardage: activeYardage, 

      sizeMode: isTailoring
        ? (store.measurementMode === 'saved' ? 'saved_profile' : (store.sizeType === 'custom' ? 'custom_measurements' : 'preset'))
        : undefined,
      sizeValue: isTailoring
        ? (store.measurementMode === 'saved' ? selectedProfile?.profile_name : (store.sizeType === 'custom' ? 'Custom' : store.standardSize))
        : undefined,

      customMeasurements: finalCustomMeasurements,
      collarType: isTailoring ? selectedCollar?.name : undefined,
      unitPrice: fabricPrice, 
      stitchingCharge: isTailoring ? stitchingCharge : 0, 
    });

    cartStore.openCart();
  };

  const toggleFilterArray = (item: string, list: string[], setList: any) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  useEffect(() => {
    const footerElement = document.querySelector('footer');

    const handleLayoutAdjustment = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        if (footerElement) footerElement.style.display = "none";
      } else {
        if (footerElement) footerElement.style.display = "";
      }
    };

    handleLayoutAdjustment();
    window.addEventListener('resize', handleLayoutAdjustment);

    if (activeBottomSheet || mobileStep === 'checkout') {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener('resize', handleLayoutAdjustment);
      if (footerElement) footerElement.style.display = "";
    };
  }, [activeBottomSheet, mobileStep]);

  // ============================================================================
  // REUSABLE UI RENDER FUNCTIONS (Shared between Desktop & Mobile)
  // ============================================================================

  const renderFabricContent = () => (
    <>
      <div className="flex flex-col gap-3 mb-6 relative z-40">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search fabric name..."
            value={store.searchQuery}
            onChange={(e) => store.setSearchQuery(e.target.value)}
            className="bg-white border border-[#D4D7C9] px-4 py-2.5 pl-9 rounded-xl text-xs font-sans focus:outline-none focus:border-[#4A5D23] transition-all w-full shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1C221A]/30" />
        </div>

        <div className="flex gap-3 w-full">
          {/* Color Dropdown */}
          <div className="relative flex-1 w-full">
            <button
              onClick={() => { setIsColorDropdownOpen(!isColorDropdownOpen); setIsPatternDropdownOpen(false); }}
              className="w-full bg-white border border-[#D4D7C9] px-3 py-2.5 rounded-xl text-[10px] font-sans font-medium uppercase tracking-widest flex items-center justify-between gap-1 text-[#1C221A]/70 hover:border-[#4A5D23] shadow-sm cursor-pointer"
            >
              <span className="truncate">Colors ({selectedColors.length === 0 ? 'All' : selectedColors.length})</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>
            {isColorDropdownOpen && (
              <div className="absolute left-0 mt-2 w-full min-w-[160px] bg-white border border-[#D4D7C9] rounded-xl shadow-xl z-50 p-3 max-h-48 overflow-y-auto custom-scrollbar">
                <button onClick={() => { setSelectedColors([]); setIsColorDropdownOpen(false); }} className="w-full text-left px-2 py-1.5 text-[10px] uppercase tracking-wider font-medium text-[#4A5D23] hover:bg-[#F8F9F5] rounded-md mb-1">Clear All</button>
                {filterColors.map((c: string) => (
                  <label key={c} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#F8F9F5] rounded-md cursor-pointer text-xs font-sans">
                    <input type="checkbox" checked={selectedColors.includes(c)} onChange={() => toggleFilterArray(c, selectedColors, setSelectedColors)} className="accent-[#4A5D23] rounded-sm" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Pattern Dropdown */}
          <div className="relative flex-1 w-full">
            <button
              onClick={() => { setIsPatternDropdownOpen(!isPatternDropdownOpen); setIsColorDropdownOpen(false); }}
              className="w-full bg-white border border-[#D4D7C9] px-3 py-2.5 rounded-xl text-[10px] font-sans font-medium uppercase tracking-widest flex items-center justify-between gap-1 text-[#1C221A]/70 hover:border-[#4A5D23] shadow-sm cursor-pointer"
            >
              <span className="truncate">Patterns ({selectedPatterns.length === 0 ? 'All' : selectedPatterns.length})</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>
            {isPatternDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[160px] bg-white border border-[#D4D7C9] rounded-xl shadow-xl z-50 p-3 max-h-48 overflow-y-auto custom-scrollbar">
                <button onClick={() => { setSelectedPatterns([]); setIsPatternDropdownOpen(false); }} className="w-full text-left px-2 py-1.5 text-[10px] uppercase tracking-wider font-medium text-[#4A5D23] hover:bg-[#F8F9F5] rounded-md mb-1">Clear All</button>
                {filterPatterns.map((p: string) => (
                  <label key={p} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#F8F9F5] rounded-md cursor-pointer text-xs font-sans">
                    <input type="checkbox" checked={selectedPatterns.includes(p)} onChange={() => toggleFilterArray(p, selectedPatterns, setSelectedPatterns)} className="accent-[#4A5D23] rounded-sm" />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-6">
        {filteredFabrics.map((fabric: any) => {
          const outOfStock = fabric.yards <= 0;

          return (
            <div
              key={fabric.id}
              onClick={(e) => {
                if (!outOfStock) {
                  store.setSelectedFabricId(fabric.id);
                  setActiveBottomSheet(null);
                }
              }}
              className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all bg-white ${outOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#D4D7C9]'
                } ${store.selectedFabricId === fabric.id ? 'border-[#4A5D23] shadow-md ring-1 ring-[#4A5D23]' : 'border-[#EBECE3]'}`}
            >
              <div className="aspect-square bg-[#EBECE3] relative overflow-hidden">
                <img src={fabric?.raw_image_url || fabric?.texture_url} alt={fabric.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                {outOfStock && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <span className="bg-red-500/90 text-white text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                      Out of Stock
                    </span>
                  </div>
                )}

                {store.selectedFabricId === fabric.id && !outOfStock && (
                  <div className="absolute top-2 right-2 bg-[#4A5D23] rounded-full p-1 shadow-sm z-10">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setModalFabric(fabric); setIsInfoModalOpen(true); }}
                  className="absolute bottom-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1C221A]/70 hover:text-[#4A5D23] shadow-sm transition-all z-20"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 flex flex-col justify-between flex-1">
                <h4 className="font-sans text-[12px] font-medium text-[#17210C] uppercase tracking-wide truncate">{fabric.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <p className="font-sans text-[10px] text-[#C25934] font-medium uppercase tracking-widest">৳{fabric.price}/yd</p>
                  <p className="font-sans text-[9px] text-[#1C221A]/50">{fabric.yards} yds</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderCollarContent = () => (
    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-6">
      {CORE_COLLARS.map((collar) => (
        <div
          key={collar.id}
          onClick={() => {
            store.setCollarId(collar.id);
            setActiveBottomSheet(null);
          }}
          className={`group relative flex items-center sm:flex-col sm:justify-center gap-4 sm:gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all bg-white ${store.collarId === collar.id ? 'border-[#4A5D23] shadow-md ring-1 ring-[#4A5D23] bg-[#F8F9F5]' : 'border-[#EBECE3] hover:border-[#D4D7C9]'}`}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center relative overflow-hidden shrink-0">
            <img src={collar.image} alt={collar.name} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>

          <span className="font-sans text-[12px] font-medium uppercase tracking-widest text-[#17210C] flex-1 sm:flex-none sm:text-center">
            {collar.name}
          </span>

          {store.collarId === collar.id && (
            <div className="sm:absolute sm:top-2 sm:right-2 bg-[#4A5D23] rounded-full p-1 shadow-sm">
              <Check className="w-3 h-3 text-white stroke-[3]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderMeasurementContent = () => (
    <>
      {/* 1. Main Top-level Toggle: Saved vs New Size */}
      <div className="flex bg-[#EBECE3]/60 p-1 rounded-xl mb-6">
        <button
          onClick={() => store.setMeasurementMode('saved')}
          className={`flex-1 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-all ${
            store.measurementMode === 'saved' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50 hover:text-[#1C221A] cursor-pointer'
          }`}
        >
          My Profiles
        </button>
        <button
          onClick={() => store.setMeasurementMode('new')}
          className={`flex-1 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-all ${
            store.measurementMode === 'new' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50 hover:text-[#1C221A] cursor-pointer'
          }`}
        >
          New Size
        </button>
      </div>

      {/* 2. SAVED PROFILES MODE */}
      {store.measurementMode === 'saved' && (
        <div className="animate-in fade-in duration-300">
          {!userId ? (
            <div className="text-center py-8 bg-white/50 rounded-xl border border-[#D4D7C9]/40">
              <p className="font-sans text-xs text-[#1C221A]/70 mb-3">Please log in to access your saved custom fits.</p>
              <button onClick={() => setShowLoginModal(true)} className="px-5 py-2.5 bg-[#4A5D23] text-white text-[10px] uppercase tracking-widest rounded-lg shadow-sm hover:bg-[#3D4C1D] transition-colors cursor-pointer">
                Log In
              </button>
            </div>
          ) : savedMeasurements && savedMeasurements.length > 0 ? (
            <div className="space-y-4">
              <div className="relative">
                <select 
                  value={store.selectedProfileId} 
                  onChange={(e) => store.setSelectedProfileId(e.target.value)}
                  className="w-full bg-white border border-[#D4D7C9] p-3.5 pr-10 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl shadow-sm font-sans appearance-none cursor-pointer text-[#17210C]"
                >
                  <option value="" disabled>Select a profile...</option>
                  {savedMeasurements.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.profile_name} {profile.is_default ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/50 pointer-events-none" />
              </div>

              {/* Locked Inputs for Selected Profile */}
              {store.selectedProfileId && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F9F5]/80 rounded-xl border border-[#D4D7C9]/40">
                  {(() => {
                    const profile = savedMeasurements.find(p => p.id.toString() === store.selectedProfileId);
                    return (
                      <>
                        <div className="flex flex-col">
                          <span className="font-sans text-[10px] uppercase tracking-widest text-[#1C221A]/50 mb-1">Length</span>
                          <span className="font-sans text-sm text-[#17210C] font-medium bg-white/50 px-3 py-2 rounded-lg border border-[#D4D7C9]/30">{profile?.measurements?.length}"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans text-[10px] uppercase tracking-widest text-[#1C221A]/50 mb-1">Chest</span>
                          <span className="font-sans text-sm text-[#17210C] font-medium bg-white/50 px-3 py-2 rounded-lg border border-[#D4D7C9]/30">{profile?.measurements?.chest}"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans text-[10px] uppercase tracking-widest text-[#1C221A]/50 mb-1">Shoulder</span>
                          <span className="font-sans text-sm text-[#17210C] font-medium bg-white/50 px-3 py-2 rounded-lg border border-[#D4D7C9]/30">{profile?.measurements?.shoulder}"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans text-[10px] uppercase tracking-widest text-[#1C221A]/50 mb-1">Sleeve</span>
                          <span className="font-sans text-sm text-[#17210C] font-medium bg-white/50 px-3 py-2 rounded-lg border border-[#D4D7C9]/30">{profile?.measurements?.sleeve}"</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
             <div className="text-center py-8 bg-white/50 rounded-xl border border-[#D4D7C9]/40">
              <p className="font-sans text-xs text-[#1C221A]/70 mb-2">No profiles found.</p>
              <button onClick={() => store.setMeasurementMode('new')} className="inline-flex justify-center w-fit mx-auto text-[#4A5D23] text-[12px] hover:text-accent uppercase tracking-widest hover:underline cursor-pointer">Go to New Size <ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* 3. NEW SIZE MODE */}
      {store.measurementMode === 'new' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex gap-4 mb-6">
            {sizeOptions.map((t) => (
              <button
                key={t}
                onClick={() => store.setSizeType(t)}
                className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-[0.15em] border-b-2 transition-all cursor-pointer ${store.sizeType === t ? 'border-[#4A5D23] text-[#4A5D23]' : 'border-transparent text-[#1C221A]/40 hover:text-[#1C221A]/70'}`}
              >
                {t} Size
              </button>
            ))}
          </div>

          {store.sizeType === 'preset' ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {presetSizes.map(p => (
                <button
                  key={p.size}
                  onClick={() => store.setStandardSize(p.size)}
                  className={`w-9 h-9 md:w-12 lg:w-12 md:h-12 lg:h-12 rounded-xl text-[10px] md:text-[13px] lg:text-[13px] font-heading font-bold transition-all cursor-pointer ${store.standardSize === p.size ? 'bg-[#4A5D23] text-white shadow-sm' : 'bg-white border border-[#D4D7C9] text-[#1C221A]/60 hover:border-[#4A5D23]'}`}
                >
                  {p.size}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase text-[#4A5D23] mb-1">Length (in)</label>
                  <input type="number" value={store.customLength} onChange={(e) => store.setCustomLength(e.target.value)} className="w-full bg-white border border-[#D4D7C9] p-3 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl shadow-sm font-sans" placeholder="0.0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase text-[#4A5D23] mb-1">Chest (in)</label>
                  <input type="number" value={store.customChest} onChange={(e) => store.setCustomChest(e.target.value)} className="w-full bg-white border border-[#D4D7C9] p-3 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl shadow-sm font-sans" placeholder="0.0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase text-[#4A5D23] mb-1">Shoulder (in)</label>
                  <input type="number" value={store.customShoulder} onChange={(e) => store.setCustomShoulder(e.target.value)} className="w-full bg-white border border-[#D4D7C9] p-3 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl shadow-sm font-sans" placeholder="0.0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase text-[#4A5D23] mb-1">Sleeve (in)</label>
                  <input type="number" value={store.customSleeve} onChange={(e) => store.setCustomSleeve(e.target.value)} className="w-full bg-white border border-[#D4D7C9] p-3 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl shadow-sm font-sans" placeholder="0.0" />
                </div>
              </div>

              {/* Minimal Save Switch */}
              <div className="pt-2 border-t border-[#D4D7C9]/40">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/70 group-hover:text-[#17210C] transition-colors">
                    Save this size for future?
                  </span>
                  <input 
                    type="checkbox" 
                    checked={saveProfileToggle}
                    onChange={handleSaveToggle}
                    className="w-4 h-4 accent-[#4A5D23] rounded cursor-pointer"
                  />
                </label>

                {/* Profile Name Input & Submit Button */}
                {saveProfileToggle && userId && (
                  <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                    <input 
                      type="text" 
                      placeholder="Profile Name (e.g., Slim Fit)"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      disabled={hasSavedCurrentProfile}
                      className={`w-full bg-white border ${profileNameError ? 'border-red-500' : 'border-[#D4D7C9]'} p-3 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl shadow-sm font-sans disabled:bg-[#F8F9F5] disabled:text-[#1C221A]/50 transition-colors`}
                    />
                    {profileNameError && <p className="font-sans text-[10px] text-red-500 mt-1.5">{profileNameError}</p>}
                    
                    {/* ✨ New Explicit Save Button ✨ */}
                    <button 
                      onClick={handleSaveProfile}
                      disabled={hasSavedCurrentProfile || isSavingProfile || !!profileNameError || !newProfileName.trim()}
                      className={`w-full mt-3 py-3 rounded-xl font-sans text-[12px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-sm ${
                        hasSavedCurrentProfile 
                          ? 'bg-[#EBECE3] text-[#4A5D23]' 
                          : 'bg-[#4A5D23] text-white hover:bg-[#3D4C1D] active:scale-[0.98]'
                      } disabled:opacity-70`}
                    >
                      {isSavingProfile ? (
                        'Saving...'
                      ) : hasSavedCurrentProfile ? (
                        <><Check className="w-4 h-4" /> Profile Saved</>
                      ) : (
                        'Save Measurement'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 bg-[#EBECE3]/30 p-3.5 rounded-xl border border-[#D4D7C9]/60 flex justify-between items-center">
        <span className="text-[11px] font-medium uppercase tracking-widest text-[#1C221A]/60">Est. Fabric Sync:</span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-[#4A5D23]">{calculatedPanjabiYardage} Yards</span>
      </div>
    </>
  );

  const renderOrderPreferences = () => (
    <>
      <div className="flex items-center justify-between gap-4 mb-6 bg-white/40 p-4 rounded-2xl border border-[#D4D7C9]/40">
        <span className="font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-[#17210C]">Order Selection:</span>
        <div className="flex bg-[#EBECE3]/60 p-1 rounded-xl">
          <button
            onClick={() => store.setOrderMode('tailoring')}
            className={`px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer ${store.orderMode === 'tailoring' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50 hover:text-[#1C221A]'}`}
          >
            Tailored
          </button>
          <button
            onClick={() => store.setOrderMode('fabric')}
            className={`px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer ${store.orderMode === 'fabric' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50 hover:text-[#1C221A]'}`}
          >
            Fabric
          </button>
        </div>
      </div>

      {store.orderMode === 'fabric' ? (
        <div className="bg-white/60 p-5 rounded-2xl border border-[#D4D7C9] flex items-center justify-between animate-in fade-in duration-300 shadow-sm">
          <span className="text-[12px] font-medium uppercase tracking-widest text-[#17210C]">Adjust Required Yards</span>
          <div className="flex items-center gap-4">
            <button onClick={() => store.setYardage(Math.max(0.5, store.yardage - 0.5))} className="w-8 h-8 rounded-full border border-[#4A5D23] text-[#4A5D23] flex items-center justify-center font-medium hover:bg-[#4A5D23] hover:text-white transition-colors cursor-pointer">-</button>
            <span className="font-heading text-lg font-bold">{store.yardage}</span>
            <button
              onClick={() => store.setYardage(store.yardage + 0.5)}
              disabled={store.yardage + 0.5 > maxFabricYards} 
              className={`w-8 h-8 rounded-full border border-[#4A5D23] text-[#4A5D23] flex items-center justify-center font-medium transition-colors ${store.yardage + 0.5 > maxFabricYards ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#4A5D23] hover:text-white cursor-pointer'
                }`}>+</button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <textarea
            value={store.specialInstructions}
            onChange={(e) => store.setSpecialInstructions(e.target.value)}
            className="w-full bg-white/60 border border-[#D4D7C9] p-4 rounded-2xl text-sm focus:outline-none focus:border-[#4A5D23] h-24 placeholder:text-[#1C221A]/30 font-sans shadow-sm"
            placeholder="Final instructions or specific notes for our master tailor..."
          />
        </div>
      )}
    </>
  );

  // হাইড্রেশন চেকার ইফেক্ট এখানে রাখুন (সব হুকের নিচে)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // হাইড্রেশন চেক (Early Return) একদম শেষে!
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9F5]">
        <div className="w-10 h-10 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] bg-[#F8F9F5] lg:pb-32">

      {/* ===================================================================== */}
      {/* 💻 DESKTOP LAYOUT (Strictly preserved, hidden on mobile)                 */}
      {/* ===================================================================== */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center sticky top-20 h-fit self-start">
        <div className="w-full aspect-square">
          <PanjabiCanvas
            color="#FFFFFF" 
            fabricType={selectedFabric?.patterns?.[0]?.toLowerCase() || 'plain'} 
            fabricImageUrl={selectedFabricTextureUrl} 
            collarType={getCanvasCollarType(selectedCollar)}
            onReset={() => setIsResetModalOpen(true)}
          />
        </div>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 min-h-screen px-4 md:px-8 lg:px-12 py-6 flex-col justify-start">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-[0.05em] text-[#17210C]">
            Bespoke Atelier
          </h1>
        </div>

        <div className="space-y-4">
          {/* STEP 1: Choose Fabric */}
          <div className="border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all">
            <button onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)} className="w-full flex items-center justify-between p-5 bg-[#EBECE3]/30 hover:bg-[#EBECE3]/60 transition-colors cursor-pointer">
              <span className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">01. Choose Fabric</span>
              {expandedStep === 1 ? <ChevronUp className="w-4 h-4 text-[#4A5D23]" /> : <ChevronDown className="w-4 h-4 text-[#1C221A]/50" />}
            </button>
            {expandedStep === 1 && <div className="p-5 border-t border-[#D4D7C9]/40 bg-transparent animate-in slide-in-from-top-2 duration-300">{renderFabricContent()}</div>}
          </div>

          {/* STEP 2: Collar Style Selection */}
          <div className="border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all">
            <button onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)} className="w-full flex items-center justify-between p-5 bg-[#EBECE3]/30 hover:bg-[#EBECE3]/60 transition-colors cursor-pointer">
              <span className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">02. Collar Style</span>
              {expandedStep === 2 ? <ChevronUp className="w-4 h-4 text-[#4A5D23]" /> : <ChevronDown className="w-4 h-4 text-[#1C221A]/50" />}
            </button>
            {expandedStep === 2 && <div className="p-5 border-t border-[#D4D7C9]/40 animate-in slide-in-from-top-2 duration-300">{renderCollarContent()}</div>}
          </div>

          {/* STEP 3: Measurement Panel */}
          <div className="border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all">
            <button onClick={() => setExpandedStep(expandedStep === 3 ? 0 : 3)} className="w-full flex items-center justify-between p-5 bg-[#EBECE3]/30 hover:bg-[#EBECE3]/60 transition-colors cursor-pointer">
              <span className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">03. Measurements</span>
              {expandedStep === 3 ? <ChevronUp className="w-4 h-4 text-[#4A5D23]" /> : <ChevronDown className="w-4 h-4 text-[#1C221A]/50" />}
            </button>
            {expandedStep === 3 && <div className="p-5 border-t border-[#D4D7C9]/40 bg-transparent animate-in slide-in-from-top-2 duration-300">{renderMeasurementContent()}</div>}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#D4D7C9]/50">
          {renderOrderPreferences()}
        </div>
      </div>

      <div className="hidden lg:block fixed bottom-0 left-0 w-full bg-[#F8F9F5]/95 backdrop-blur-xl border-t border-[#D4D7C9]/60 z-[100] p-4 lg:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex w-full md:w-auto justify-between items-center gap-8 px-2">
            {store.orderMode === 'tailoring' ? (
              <>
                <div><p className="text-[9px] font-medium uppercase tracking-widest text-[#1C221A]/50 mb-1">Tailoring Cost</p><p className="font-sans text-xs font-medium text-[#17210C]">৳{(stitchingCharge + collarPrice).toLocaleString()}</p></div>
                <div><p className="text-[9px] font-medium uppercase tracking-widest text-[#1C221A]/50 mb-1">Fabric Cost</p><p className="font-sans text-xs font-medium text-[#17210C]">৳{fabricPrice.toLocaleString()}</p></div>
              </>
            ) : (
              <div><p className="text-[9px] font-medium uppercase tracking-widest text-[#1C221A]/50 mb-1">Fabric Investment ({store.yardage} yds)</p><p className="font-sans text-xs font-medium text-[#17210C]">৳{fabricPrice.toLocaleString()}</p></div>
            )}
            <div className="h-8 w-px bg-[#D4D7C9] mx-2" />
            <div><p className="text-[11px] font-medium uppercase tracking-widest text-[#4A5D23] mb-1">Total Statement</p><p className="font-heading text-2xl font-bold text-[#C25934]">৳{totalCost.toLocaleString()}</p></div>
          </div>
          <div className="flex items-center gap-4">
            {!isFabricStockSufficient && (
              <div className="text-red-500 text-[11px] uppercase text-right">
                Not enough stock!<br />({maxFabricYards} yds available)
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!isFabricStockSufficient}
              className={`w-full md:w-auto px-12 py-4 rounded-full font-sans text-[11px] font-medium uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${!isFabricStockSufficient
                ? 'bg-[#D4D7C9] text-white cursor-not-allowed'
                : 'bg-[#4A5D23] text-white hover:bg-[#3D4C1D] active:scale-[0.98] cursor-pointer'
                }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {!isFabricStockSufficient
                ? 'Out of Stock'
                : store.orderMode === 'tailoring'
                  ? 'Add Customized Panjabi to Cart'
                  : 'Purchase Fabric Bolt'}
            </button>
          </div>
        </div>
      </div>


      {/* ===================================================================== */}
      {/* 📱 MOBILE LAYOUT (Hidden on desktop, App-like interactions)              */}
      {/* ===================================================================== */}

      <div className={`lg:hidden fixed top-0 left-0 w-full h-[100dvh] z-0 transition-opacity duration-500 bg-[#F8F9F5] ${mobileStep === 'design' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <div className="absolute inset-0 w-full h-full pb-20 flex items-center justify-center">
          <PanjabiCanvas
            color="#FFFFFF" 
            fabricType={selectedFabric?.patterns?.[0]?.toLowerCase() || 'plain'} 
            fabricImageUrl={selectedFabricTextureUrl} 
            collarType={getCanvasCollarType(selectedCollar)}
            onReset={() => setIsResetModalOpen(true)}
          />
        </div>
      </div>

      {mobileStep === 'design' && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-[#D4D7C9]/60 pb-safe pt-3 px-4 shadow-[0_-20px_40px_rgba(0,0,0,0.06)] z-20">
          <div className="flex items-center justify-between pb-3">
            <div className="flex gap-6">
              <button onClick={() => setActiveBottomSheet('fabric')} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${activeBottomSheet === 'fabric' ? 'border-[#4A5D23] scale-105' : 'border-[#D4D7C9] group-hover:border-[#4A5D23]'}`}>
                  <img src={selectedFabricRawUrl} alt="Fabric" className="w-full h-full object-cover bg-[#EBECE3]" />
                </div>
                <span className={`text-[12px] font-medium uppercase tracking-widest ${activeBottomSheet === 'fabric' ? 'text-[#4A5D23]' : 'text-[#1C221A]'}`}>Fabric</span>
              </button>
              <button onClick={() => setActiveBottomSheet('collar')} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 rounded-full border-2 bg-primary transition-all ${activeBottomSheet === 'collar' ? 'border-[#4A5D23] scale-105' : 'border-[#D4D7C9] group-hover:border-[#4A5D23]'}`}>
                  <img src={selectedCollar.image} alt="Collar" className="w-full h-full object-contain opacity-100" />
                </div>
                <span className={`text-[12px] font-medium uppercase tracking-widest ${activeBottomSheet === 'collar' ? 'text-[#4A5D23]' : 'text-[#1C221A]'}`}>Collar</span>
              </button>
            </div>
            <button
              onClick={() => { setActiveBottomSheet(null); setMobileStep('checkout'); }}
              className="bg-[#17210C] text-white h-12 px-8 rounded-full font-sans text-[11px] font-medium uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg hover:bg-[#4A5D23] transition-all active:scale-[0.98]"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className={`lg:hidden fixed inset-0 z-[1001] transition-opacity duration-300 ${activeBottomSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveBottomSheet(null)} />
        <div className={`absolute bottom-0 left-0 w-full bg-[#F8F9F5] rounded-t-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col h-[85dvh] ${activeBottomSheet ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4D7C9]/50 shrink-0 bg-white rounded-t-3xl">
            <span className="font-heading text-[14px] font-bold uppercase tracking-[0.1em] text-[#17210C]">
              {activeBottomSheet === 'fabric' ? 'Select Fabric' : 'Select Collar'}
            </span>
            <button onClick={() => setActiveBottomSheet(null)} className="p-2 -mr-2 bg-[#F8F9F5] rounded-full text-[#1C221A]/60 hover:text-[#C25934] transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
            {activeBottomSheet === 'fabric' && renderFabricContent()}
            {activeBottomSheet === 'collar' && renderCollarContent()}
          </div>
        </div>
      </div>

      <div className={`lg:hidden fixed bottom-0 left-0 w-full h-[90dvh] bg-[#F8F9F5] rounded-t-3xl z-50 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileStep === 'checkout' ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center px-4 py-4 border-b border-[#D4D7C9]/50 shrink-0 bg-white rounded-t-3xl relative">
          <button
            onClick={() => setMobileStep('design')}
            className="absolute left-4 p-2 bg-[#F8F9F5] rounded-full text-[#1C221A] flex items-center justify-center active:scale-90 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="w-full text-center font-heading text-[15px] font-bold uppercase tracking-[0.1em] text-[#17210C]">
            Finalize Details
          </span>
        </div>

        <div className="p-5 overflow-y-auto pb-32 flex-1">
          <h3 className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-[#4A5D23] mb-4">Measurements</h3>
          <div className="bg-white p-5 rounded-2xl border border-[#D4D7C9]/40 shadow-sm mb-8">
            {renderMeasurementContent()}
          </div>

          <h3 className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-[#4A5D23] mb-4">Preferences</h3>
          <div className="mb-6">
            {renderOrderPreferences()}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-[#D4D7C9]/60 p-4 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          {!isFabricStockSufficient && (
            <div className="text-red-500 text-center text-[11px] uppercase mb-2">
              Not enough stock! (Only {maxFabricYards} yds available)
            </div>
          )}
          <div className="flex justify-between items-center mb-3 px-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#1C221A]/50 mb-0.5">Total Amount</p>
              <p className="font-heading text-2xl font-bold text-[#C25934]">৳{totalCost.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-sans text-[10px] font-medium text-[#17210C] uppercase tracking-widest">{store.orderMode === 'tailoring' ? 'Tailored Panjabi' : `Fabric (${store.yardage} yds)`}</p>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!isFabricStockSufficient}
            className={`w-full py-3.5 rounded-full font-sans text-[11px] font-medium uppercase tracking-[0.2em] shadow-lg transition-colors flex items-center justify-center gap-2 ${!isFabricStockSufficient
              ? 'bg-[#D4D7C9] text-white cursor-not-allowed'
              : 'bg-[#4A5D23] text-white active:bg-[#3D4C1D] cursor-pointer'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {!isFabricStockSufficient ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* --- Fabric Quick Info Modal --- */}
      {isInfoModalOpen && modalFabric && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#111410]/60 backdrop-blur-sm" onClick={() => setIsInfoModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-64 bg-[#EBECE3] relative">
              <img src={modalFabric?.raw_image_url || modalFabric?.texture_url} alt={modalFabric.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="font-heading text-xl font-bold text-[#17210C] uppercase tracking-wide mb-2">{modalFabric.name}</h3>
              <p className="font-sans text-xs text-[#1C221A]/70 mb-4">{modalFabric.description || "Premium handcrafted boutique textile material."}</p>
              <div className="flex justify-between items-center border-t border-[#EBECE3] pt-4 mt-4">
                <span className="text-[10px] font-medium uppercase tracking-widest text-[#4A5D23]">Price base</span>
                <span className="font-sans text-sm font-medium text-[#17210C]">৳{modalFabric.price}/yd</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ Assistive Touch Style Floating Reset Button (Mobile Only) ✨ */}
      {mobileStep === 'design' && (
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="lg:hidden fixed top-1/3 right-3 z-[1000] w-12 h-12 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-full flex items-center justify-center text-[#1C221A]/70 hover:text-red-500 active:scale-[0.85] transition-all duration-200"
          aria-label="Reset Customizer"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Login Prompt Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#111410]/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 p-2 bg-[#F8F9F5] rounded-full text-[#1C221A]/60 hover:text-red-500 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-heading text-lg font-bold text-[#17210C] uppercase tracking-wide mb-2 mt-4">Login Required</h3>
            <p className="font-sans text-xs text-[#1C221A]/70 mb-6">
              You need to be logged in to save or access measurement profiles. Don't worry, your current design progress will be saved!
            </p>
            <button onClick={goToLogin} className="w-full py-3 bg-[#4A5D23] text-white rounded-xl font-sans text-[11px] font-medium uppercase tracking-[0.2em] shadow-lg hover:bg-[#3D4C1D] transition-colors cursor-pointer">
              Log In Now
            </button>
          </div>
        </div>
      )}

      {/* ✨ Custom Reset Confirmation Modal ✨ */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#111410]/60 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#17210C] uppercase tracking-wide mb-2">Start Over?</h3>
            <p className="font-sans text-xs text-[#1C221A]/70 mb-6 px-2">
              Are you sure you want to clear all your current customizations and reset the design?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsResetModalOpen(false)} 
                className="flex-1 py-3.5 bg-[#F8F9F5] text-[#1C221A] hover:bg-[#D4D7C9] rounded-xl font-sans text-[12px] uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  store.resetCustomizer(); // Zustand স্টোর ক্লিয়ার হবে
                  setIsResetModalOpen(false); // মডাল বন্ধ হবে
                }} 
                className="flex-1 py-3.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-sans text-[12px] uppercase tracking-widest shadow-md transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4D7C9; border-radius: 10px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>
    </div>
  );
}