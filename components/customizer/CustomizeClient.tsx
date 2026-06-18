"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { PanjabiCanvas } from './PanjabiCanvas';
import { useCustomizerStore } from '@/store/useCustomizerStore';
import { resolveProductImageSrc } from '@/lib/productImages';
import { Search, Info, Check, ChevronDown, ChevronUp, ShoppingBag, Ruler, Calculator, ChevronLeft, ChevronRight, X, ShoppingCart, RotateCcw, Eye, XCircle } from "lucide-react";
import { useCartStore } from '@/store/cartStore';
import { MEASUREMENT_FIELDS } from '@/lib/config/measurementConfig';
import { STANDARD_SIZES } from '@/lib/config/standardSizes';
import { calculateFabricYardage } from '@/lib/utils/fabricEstimator';
import { addFitMeasurement } from '@/lib/actions/measurement.actions'; // প্রোফাইল সেভ করার জন্য
import { useAuthStore } from '@/store/authStore';
import { getUserMeasurements } from '@/lib/actions/user.actions';
import { FabricQuickViewModal } from './FabricQuickViewModal';
import { UI_VECTORS, JUBBA_CANVAS_MAP, PANT_CANVAS_MAP, PANJABI_CANVAS_MAP, SHIRT_CANVAS_MAP, PAJAMA_CANVAS_MAP, ADVANCED_TAILORING_OPTIONS } from '@/lib/config/productConfig';
import { TailoringDetailsModal } from './TailoringDetailsModal';

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
  const userId = user?.id || (!isLoaded ? serverUserId : null);
  const [activeSavedMeasurements, setActiveSavedMeasurements] = useState<any[]>(savedMeasurements || []);
  const cartStore = useCartStore();
  const store = useCustomizerStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveProfileToggle, setSaveProfileToggle] = useState(false);
  const [profileNameError, setProfileNameError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [hasSavedCurrentProfile, setHasSavedCurrentProfile] = useState(false);
  const getCanvasCollarType = (collar: any) => {
    if (!collar || !collar.name) return 'band';
    const nameLower = collar.name.toLowerCase();
    if (nameLower.includes('v-neck') || nameLower.includes('vneck')) return 'vneck';
    if (nameLower.includes('round')) return 'round';
    if (nameLower.includes('mandarin')) return 'mandarin';
    return 'band';
  };
  const [expandedStep, setExpandedStep] = useState<number>(0);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalFabric, setModalFabric] = useState<any>(null);
  const [mobileStep, setMobileStep] = useState<'design' | 'checkout'>('design');
  const [activeBottomSheet, setActiveBottomSheet] = useState<'product' | 'fabric' | 'style' | 'advanced' | null>(null);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isPatternDropdownOpen, setIsPatternDropdownOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isTailoringModalOpen, setIsTailoringModalOpen] = useState(false);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // কন্টেইনার স্ক্রল ট্র্যাক করার জন্য Ref এবং State
  const pillContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // কম্পোনেন্টের শুরুর দিকের স্টেটগুলোর মধ্যে এই স্টেটগুলো যোগ/আপডেট করুন
  const motherCat = store.selectedProduct.split('_')[0]; // যেমন: 'panjabi', 'shirt'
  const uniquePersons = useMemo(() => Array.from(new Set(activeSavedMeasurements.map(m => m.person_name))), [activeSavedMeasurements]);
  const availableFits = useMemo(() => activeSavedMeasurements.filter(m => m.person_name === store.selectedPerson && m.product_type === motherCat), [activeSavedMeasurements, store.selectedPerson, motherCat]);

  // On-the-fly Save States
  const [saveTargetPerson, setSaveTargetPerson] = useState<string>('');
  const [newProfileName, setNewProfileName] = useState('');
  const [newFitName, setNewFitName] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

  // 1. Auto-Select Logic (Person and Fit Dropdowns)
  useEffect(() => {
    if (!isHydrated || activeSavedMeasurements.length === 0) return;

    // Set Featured Person if none selected
    if (!store.selectedPerson || !uniquePersons.includes(store.selectedPerson)) {
      const featuredPerson = activeSavedMeasurements.find(m => m.is_person_default)?.person_name || uniquePersons[0];
      store.setSelectedPerson(featuredPerson);
      return; // Will re-trigger due to dependency change
    }

    // Set Featured Fit for the selected Person and Product
    if (availableFits.length > 0) {
      const featuredFit = availableFits.find(m => m.is_default) || availableFits[0];
      if (store.selectedFitId !== featuredFit.id && !availableFits.some(m => m.id === store.selectedFitId)) {
        store.setSelectedFitId(featuredFit.id);
      }
    } else {
      store.setSelectedFitId(null);
    }
  }, [isHydrated, activeSavedMeasurements, store.selectedPerson, motherCat, uniquePersons, availableFits]);

  // 2. Dynamic Fabric Yardage Calculator
  const calculatedYardage = useMemo(() => {
    let meas: Record<string, number> = {};

    if (store.measurementMode === 'saved') {
      const fit = activeSavedMeasurements.find(m => m.id === store.selectedFitId);
      if (fit && fit.measurements) meas = fit.measurements;
    } else if (store.sizeType === 'preset') {
      meas = STANDARD_SIZES[motherCat]?.[store.standardSize] || {};
    } else {
      // Custom Inputs
      Object.keys(store.customMeasurements).forEach(k => {
        meas[k] = Number(store.customMeasurements[k]) || 0;
      });
    }

    return calculateFabricYardage({ productKey: store.selectedProduct, measurements: meas });
  }, [store.selectedProduct, store.measurementMode, store.selectedFitId, store.sizeType, store.standardSize, store.customMeasurements, activeSavedMeasurements, motherCat]);

  // Update yardage automatically for Fabric Mode
  useEffect(() => {
    if (store.orderMode === 'fabric') {
      store.setYardage(calculatedYardage);
    }
  }, [calculatedYardage, store.orderMode, store.setYardage]);

  // 3. On-The-Fly Save Logic
  const handleSaveProfileOnTheFly = async () => {
    // যদি লাইভ ভ্যালিডেশন বাটন লক করে রাখে, তবে সাবমিট হবে না
    if (isSaveDisabled) return;

    if (saveTargetPerson === 'NEW_PROFILE' && !newProfileName.trim()) {
      setProfileNameError('Please enter a new profile name.');
      return;
    }
    if (!newFitName.trim()) {
      setProfileNameError('Please enter a fit name (e.g. Slim Fit).');
      return;
    }

    // Blank Data Validation: সাবমিটের সময় চেক করবে কোনো ফিল্ড খালি আছে কি না
    const dynamicFields = MEASUREMENT_FIELDS[motherCat] || [];
    const hasEmptyMeasurements = dynamicFields.some(field => {
      const val = store.customMeasurements[field.id];
      return !val || Number(val) <= 0;
    });

    if (hasEmptyMeasurements) {
      setProfileNameError('Please enter valid measurements for all fields before saving.');
      return;
    }

    setIsSavingProfile(true);
    setProfileNameError('');

    const finalPersonName = saveTargetPerson === 'NEW_PROFILE' ? newProfileName.trim() : saveTargetPerson;

    const numericMeasurements: Record<string, number> = {};
    Object.keys(store.customMeasurements).forEach(k => {
      numericMeasurements[k] = Number(store.customMeasurements[k]) || 0;
    });

    const payload = {
      person_name: finalPersonName,
      fit_name: newFitName.trim(),
      product_type: motherCat,
      measurements: numericMeasurements,
      is_default: !activeSavedMeasurements.some(m => m.person_name === finalPersonName && m.product_type === motherCat && m.is_default),
      is_person_default: activeSavedMeasurements.length === 0
    };

    try {
      const res = await addFitMeasurement(userId!, payload);
      if (res?.success) {
        setHasSavedCurrentProfile(true);
        const latest = await getUserMeasurements(userId!);
        if (latest.success && latest.data) {
          setActiveSavedMeasurements(latest.data);
          store.setMeasurementMode('saved');
          store.setSelectedPerson(finalPersonName);
          setSaveProfileToggle(false);
          setNewProfileName('');
          setNewFitName('');
        }
      } else {
        alert(res?.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // স্ক্রল পজিশন চেক করার ফাংশন
  const handlePillScroll = () => {
    if (!pillContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = pillContainerRef.current;

    // ৫ পিক্সেল বাফার রাখা হয়েছে সেফটি মার্জিন হিসেবে
    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 5);
  };

  // ইনিশিয়াল মাউন্ট এবং উইন্ডো রিসাইজ হ্যান্ডেল করা
  useEffect(() => {
    const container = pillContainerRef.current;
    if (container) {
      // উইন্ডো লোড বা কনটেন্ট চেঞ্জের পর একবার চেক করা
      handlePillScroll();

      window.addEventListener("resize", handlePillScroll);
      return () => window.removeEventListener("resize", handlePillScroll);
    }
  }, [store.selectedProduct]); // প্রোডাক্ট চেঞ্জ হলে রিক্যালকুলেট হবে

  useEffect(() => {
    if (expandedStep > 0 && stepRefs.current[expandedStep]) {
      // 300ms ডিলে দেওয়া হলো যাতে এক্সপ্যান্ড ট্রানজিশন শেষ হওয়ার পর স্ক্রল হয়
      setTimeout(() => {
        stepRefs.current[expandedStep]?.scrollIntoView({
          behavior: "smooth",
          block: "start", // 'center' এর বদলে 'start' দিলে স্ক্রল বক্স নষ্ট হবে না
        });
      }, 300);
    }
  }, [expandedStep]);

  useEffect(() => {
    if (!isLoaded) {
      setActiveSavedMeasurements(savedMeasurements || []);
      return;
    }

    if (!user?.id) {
      setActiveSavedMeasurements([]);
      setSaveProfileToggle(false);
      setShowLoginModal(false);
      store.setSelectedFitId(null);
      return;
    }

    let isActive = true;

    const syncMeasurements = async () => {
      const res = await getUserMeasurements(user.id);
      if (isActive) {
        setActiveSavedMeasurements(res.success && res.data ? res.data : []);
      }
    };

    syncMeasurements();

    return () => {
      isActive = false;
    };
  }, [isLoaded, user?.id, savedMeasurements, store.setSelectedFitId]);

  // 🎯 Smart Live Validation: Deep Duplicate, Name Duplicate & Auto-Unlock Engine
  useEffect(() => {
    // সেভ প্যানেল বা টিকমার্ক বন্ধ করা হলে সমস্ত স্টেট এবং লক রিসেট করে দাও
    if (!saveProfileToggle) {
      setProfileNameError('');
      setIsSaveDisabled(false);
      setHasSavedCurrentProfile(false);
      return;
    }

    let currentError = '';
    let isDisabled = false;
    let exactDuplicateFit = undefined;

    const finalPersonName = saveTargetPerson === 'NEW_PROFILE' ? newProfileName.trim() : saveTargetPerson;

    // ১. New Profile Name Duplicate Check
    if (saveTargetPerson === 'NEW_PROFILE' && finalPersonName !== '') {
      const isDuplicatePerson = activeSavedMeasurements.some(
        (p) => p.person_name?.toLowerCase() === finalPersonName.toLowerCase()
      );
      if (isDuplicatePerson) {
        currentError = `Profile '${finalPersonName}' already exists. Please select it from the dropdown.`;
        isDisabled = true;
      }
    }

    // ২. Fit Name & Deep Measurement Duplicate Check
    if (!isDisabled && finalPersonName) {
      const currentFitName = newFitName.trim().toLowerCase();
      
      // শুধুমাত্র এই নির্দিষ্ট Person এবং Product-এর ফিটগুলো ফিল্টার করা হচ্ছে
      const personFits = activeSavedMeasurements.filter(
        m => m.person_name === finalPersonName && m.product_type === motherCat
      );

      const dynamicFields = MEASUREMENT_FIELDS[motherCat] || [];
      
      // Deep Duplicate Check (হুবহু মাপের মিল খোঁজা)
      exactDuplicateFit = personFits.find(fit => {
        if (!fit.measurements) return false;
        let isMatch = true;
        for (const field of dynamicFields) {
          const currentVal = Number(store.customMeasurements[field.id]) || 0;
          const savedVal = Number(fit.measurements[field.id]) || 0;
          if (currentVal !== savedVal) {
            isMatch = false;
            break;
          }
        }
        return isMatch;
      });

      if (exactDuplicateFit) {
        // 🌟 ক্লিয়ার এবং স্মার্ট এরর মেসেজ (কনফিউশন দূর করার জন্য)
        currentError = `These measurements are identical to the '${exactDuplicateFit.fit_name}' fit under '${finalPersonName}''s ${motherCat.toUpperCase()} profile.`;
        isDisabled = true;
      } else if (currentFitName) {
        // Name Duplicate Check (মাপ ইউনিক, কিন্তু ফিটের নাম আগে থেকেই আছে)
        const isDuplicateFitName = personFits.some(m => m.fit_name.toLowerCase() === currentFitName);
        if (isDuplicateFitName) {
          currentError = `A fit named '${newFitName.trim()}' already exists for this product.`;
          isDisabled = true;
        }
      }
    }

    // 🎯 SMART UNLOCK: ইউজার যদি কোনো ইনপুট, প্রোফাইল ড্রপডাউন বা মেজারমেন্ট চেঞ্জ করে, 
    // যা সদ্য সেভ হওয়া ডাটার সাথে আর মিলছে না, তবে 'Saved' লক স্টেটটি স্বয়ংক্রিয়ভাবে খুলে যাবে।
    if (hasSavedCurrentProfile) {
      if (!newFitName.trim() || !exactDuplicateFit || exactDuplicateFit.fit_name !== newFitName.trim()) {
        setHasSavedCurrentProfile(false);
      }
    }

    setProfileNameError(currentError);
    setIsSaveDisabled(isDisabled);

  }, [
    saveProfileToggle, 
    saveTargetPerson, 
    newProfileName, 
    newFitName, 
    store.customMeasurements, 
    activeSavedMeasurements, 
    motherCat,
    hasSavedCurrentProfile // ডিপেন্ডেন্সিতে যুক্ত করা হলো সেফ ট্র্যাকিংয়ের জন্য
  ]);

  useEffect(() => {
    if (store.orderMode === 'fabric') {
      store.setYardage(calculatedYardage);
    }
  }, [calculatedYardage, store.orderMode, store.setYardage]);

  const filteredFabrics = useMemo(() => {
    return fabrics.filter((f: any) => {
      const matchSearch = f.name.toLowerCase().includes(store.searchQuery.toLowerCase());
      const fabricColors = Array.isArray(f.colors) ? f.colors : [];
      const fabricPatterns = Array.isArray(f.patterns) ? f.patterns : [];
      
      // 🎯 Product Category Filter Logic (New)
      // ডাটাবেসে সেভ থাকা ট্যাগ (যেমন: 'Panjabi') এবং কারেন্ট মাদার ক্যাটাগরির (যেমন: 'panjabi') মধ্যে Case-Insensitive মিল খোঁজা হচ্ছে
      const hasAllowedProducts = Array.isArray(f.allowed_products) && f.allowed_products.length > 0;
      const matchProduct = !hasAllowedProducts || f.allowed_products.some(
        (product: string) => product.toLowerCase() === motherCat.toLowerCase()
      );

      const matchColor = selectedColors.length === 0 || selectedColors.some((color) => fabricColors.includes(color));
      const matchPattern = selectedPatterns.length === 0 || selectedPatterns.some((pattern) => fabricPatterns.includes(pattern));
      
      // matchProduct-কে রিটার্ন কন্ডিশনে যুক্ত করা হলো
      return matchSearch && matchColor && matchPattern && matchProduct;
    });
  }, [fabrics, store.searchQuery, selectedColors, selectedPatterns, motherCat]); // ডিপেন্ডেন্সিতে motherCat যুক্ত করা হয়েছে

  useEffect(() => {
    if (!isHydrated) return;
    if (fabrics.length > 0 && !store.selectedFabricId) store.setSelectedFabricId(String(fabrics[0].id));
    if (!store.collarId) store.setCollarId(CORE_COLLARS[0].id);
  }, [fabrics]);

  const selectedFabric = fabrics.find((f: any) => String(f.id) === store.selectedFabricId) || fabrics[0];
  const selectedCollar = CORE_COLLARS.find((c: any) => c.id === store.collarId) || CORE_COLLARS[0];
  const selectedFabricImageUrl = selectedFabric?.image_url ? resolveProductImageSrc(selectedFabric.image_url) : undefined;
  const selectedFabricTextureUrl = selectedFabric?.texture_url || undefined;
  const selectedFabricCoverUrl = (Array.isArray(selectedFabric?.preview_images) && selectedFabric.preview_images.length > 0)
    ? selectedFabric.preview_images[0]
    : (selectedFabric?.raw_image_url || selectedFabric?.texture_url || undefined);
  const stitchingCharge = 450;
  const activeYardage = store.orderMode === 'tailoring' ? calculatedYardage : store.yardage;
  const maxFabricYards = selectedFabric?.yards || 0;
  const isFabricStockSufficient = maxFabricYards >= activeYardage;
  const fabricPrice = (selectedFabric?.price || 0) * activeYardage;
  const collarPrice = 0;
  const totalCost = store.orderMode === 'tailoring'
    ? fabricPrice + stitchingCharge + collarPrice
    : fabricPrice;

  // --- NEW CONDITIONAL LOGIC ---
  const isFabricOnly = store.orderMode === 'fabric';
  const isPajama = store.selectedProduct.startsWith('pajama');

  const showStyleSection = !isFabricOnly && !isPajama;
  const showAdvancedSection = !isFabricOnly;

  // Dynamic Mother Category Name for Toggle
  const getMotherCategoryName = (productId: string) => {
    if (productId.startsWith('panjabi')) return 'Panjabi';
    if (productId.startsWith('pajama')) return 'Pajama';
    if (productId.startsWith('pant')) return 'Pant';
    if (productId === 'jubba') return 'Jubba';
    if (productId === 'shirt') return 'Shirt';
    return 'Product';
  };
  const tailoredLabel = `Tailored ${getMotherCategoryName(store.selectedProduct)}`;

  // Dynamic Step Numbering
  const stepProduct = "01. ";
  const stepFabric = "02. ";
  const stepStyle = showStyleSection ? "03. " : "";
  const stepAdvanced = showAdvancedSection ? (showStyleSection ? "04. " : "03. ") : "";
  const stepMeasure = isFabricOnly ? "03. " : (isPajama ? "04. " : "05. ");

  const getDynamicOverlayImage = () => {
    if (store.selectedProduct === 'jubba') {
      const { collar, placket, pocket } = store.productStyles;
      return JUBBA_CANVAS_MAP[collar || 'band']?.[placket || 'hidden']?.[pocket || 'chest']
        || JUBBA_CANVAS_MAP['band']['hidden']['chest'];
    }
    else if (store.selectedProduct.startsWith('panjabi_')) {
      const type = store.selectedProduct.split('_')[1];
      const { collar, placket, pocket } = store.productStyles;

      let safeCollar = collar || 'band';
      let safePlacket = placket || 'hidden';
      let safePocket = pocket || 'chest';

      // সাব-ক্যাটাগরি অনুযায়ী Fallback বা Override নিশ্চিত করা
      if (type === 'madani' && !['band', 'round'].includes(safeCollar)) safeCollar = 'band';
      if (type === 'kabuli') {
        if (!['band', 'shirt'].includes(safeCollar)) safeCollar = 'band';
        safePlacket = 'visible'; // Kabuli-এর জন্য Forcefully Visible করা হলো
        if (!['chest', 'double_flap'].includes(safePocket)) safePocket = 'chest';
      }
      if (type === 'short' && !['band', 'mandarin', 'shirt'].includes(safeCollar)) safeCollar = 'band';
      if (type === 'regular' && !['band', 'mandarin', 'round'].includes(safeCollar)) safeCollar = 'band';

      return PANJABI_CANVAS_MAP[type]?.[safeCollar]?.[safePlacket]?.[safePocket]
        || PANJABI_CANVAS_MAP['regular']['band']['hidden']['chest'];
    }
    else if (store.selectedProduct.startsWith('pajama_')) {
      const safeFit = store.selectedProduct.replace('pajama_', '') || 'aligarhi';
      return PAJAMA_CANVAS_MAP[safeFit] || PAJAMA_CANVAS_MAP['aligarhi'];
    }
    else if (store.selectedProduct === 'shirt') {
      const { sleeve, collar, placket, pocket } = store.productStyles;

      // সেফটি ফলব্যাক এবং ডাইনামিক স্লিভ ডিটেকশন
      let safeSleeve = sleeve || 'full';
      let safeCollar = collar || 'spread';
      let safePlacket = placket || 'hidden';
      let safePocket = pocket || 'chest';

      if (!['full', 'half'].includes(safeSleeve)) safeSleeve = 'full';
      if (!['spread', 'buttondown', 'mandarin'].includes(safeCollar)) safeCollar = 'spread';
      if (!['no_pocket', 'chest'].includes(safePocket)) safePocket = 'chest';

      return SHIRT_CANVAS_MAP[safeSleeve]?.[safeCollar]?.[safePlacket]?.[safePocket]
        || SHIRT_CANVAS_MAP['full']['spread']['hidden']['chest'];
    }
    else if (store.selectedProduct.startsWith('pant_')) {
      const pantType = store.selectedProduct.split('_')[1];
      const { front, hem } = store.productStyles;
      return PANT_CANVAS_MAP[pantType]?.[front || 'flat']?.[hem || 'regular']
        || PANT_CANVAS_MAP['formal']['flat']['regular'];
    }

    return `/assets/punjabi/collar-${getCanvasCollarType(selectedCollar)}.png`;
  };

  const handleSaveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked && !userId) {
      setSaveProfileToggle(false);
      setShowLoginModal(true);
      return;
    }
    setSaveProfileToggle(isChecked);
  };
  const goToLogin = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  };

  const handleAddToCart = async () => {
    if (!isFabricStockSufficient) return;

    if (store.orderMode === 'tailoring' && store.measurementMode === 'saved') {
      const profile = activeSavedMeasurements.find(p => p.id.toString() === store.selectedFitId);
      if (!profile) {
        alert("Please select or create a valid measurement profile first.");
        return;
      }
    }

    const isTailoring = store.orderMode === 'tailoring';
    const selectedProfile = store.measurementMode === 'saved'
      ? activeSavedMeasurements.find((p: any) => p.id.toString() === store.selectedFitId)
      : null;
    const finalCustomMeasurements = isTailoring ? (
      store.measurementMode === 'saved' && selectedProfile ? {
        length: selectedProfile.measurements.length.toString(),
        chest: selectedProfile.measurements.chest.toString(),
        shoulder: selectedProfile.measurements.shoulder.toString(),
        sleeve: selectedProfile.measurements.sleeve.toString(),
      } : (store.sizeType === 'custom' ? {
        length: store.customMeasurements.length,
        chest: store.customMeasurements.chest,
        shoulder: store.customMeasurements.shoulder,
        sleeve: store.customMeasurements.sleeve,
      } : undefined)
    ) : undefined;

    cartStore.addItem({
      productId: productId,
      productName: isTailoring
        ? `Custom Tailored Panjabi - ${selectedFabric?.name || 'Premium Fabric'}`
        : `Premium Fabric Bolt - ${selectedFabric?.name || 'Premium Fabric'}`,
      productType: isTailoring ? 'custom_tailored' : 'custom_fabric_only',
      image: selectedFabricCoverUrl || '/placeholder-image.jpg',
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

  const renderProductContent = () => {
    const products = [
      {
        id: 'panjabi',
        name: 'Panjabi',
        type: 'group',
        subcategories: [
          { id: 'panjabi_regular', name: 'Regular-Classic' },
          { id: 'panjabi_madani', name: 'Madani Panjabi' },
          { id: 'panjabi_kabuli', name: 'Kabuli Panjabi' },
          { id: 'panjabi_short', name: 'Short Panjabi' }
        ]
      },
      {
        id: 'pajama',
        name: 'Pajama',
        type: 'group',
        subcategories: [
          { id: 'pajama_aligarhi', name: 'Aligarhi Pajama' },
          { id: 'pajama_churidar', name: 'Churidar Pajama' },
          { id: 'pajama_kabuli_salwar', name: 'Kabuli Salwar' }
        ]
      },
      { id: 'jubba', name: 'Jubba', type: 'single' },
      { id: 'shirt', name: 'Shirt', type: 'single' },
      {
        id: 'pant',
        name: 'Pant',
        type: 'group',
        subcategories: [
          { id: 'pant_formal', name: 'Formal Pant' },
          { id: 'pant_chinos', name: 'Chinos Pant' }
        ]
      }
    ];

    return (
      <div className="flex flex-col gap-3 max-h-none lg:max-h-[360px] overflow-y-auto custom-scrollbar relative z-10 pb-6">
        {products.map(product => (
          <div key={product.id} className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (product.type === 'single') {
                  store.setSelectedProduct(product.id);
                  setExpandedCategory(null);
                  setActiveBottomSheet(null); // মোবাইলে অটো-ক্লোজ
                } else {
                  setExpandedCategory(expandedCategory === product.id ? null : product.id);
                }
              }}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${store.selectedProduct === product.id || store.selectedProduct.startsWith(product.id + '_')
                ? 'border-[#4A5D23] shadow-sm bg-[#F8F9F5]'
                : 'border-[#D4D7C9] bg-white hover:border-[#4A5D23]/50'
                }`}
            >
              <span className="font-heading text-[13px] font-bold uppercase tracking-widest text-[#17210C]">
                {product.name}
              </span>
              {product.type === 'group' && (
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategory === product.id ? 'rotate-180' : ''}`} />
              )}
            </button>

            {product.type === 'group' && expandedCategory === product.id && (
              <div className="grid grid-cols-2 gap-3 pl-4 animate-in slide-in-from-top-2">
                {product.subcategories?.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      store.setSelectedProduct(sub.id);
                      setActiveBottomSheet(null); // মোবাইলে অটো-ক্লোজ
                    }}
                    className={`p-3 rounded-xl border transition-all text-left ${store.selectedProduct === sub.id
                      ? 'border-[#4A5D23] bg-[#4A5D23]/10 ring-1 ring-[#4A5D23]'
                      : 'border-[#D4D7C9] bg-white hover:border-[#4A5D23]/50'
                      }`}
                  >
                    <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#17210C]">
                      {sub.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFabricContent = () => (
    <>
      {/* 🎯 স্মার্ট স্টিকি হেডার: মোবাইলের জন্য স্টিকি, পিসির জন্য নরমাল (static) */}
      <div className="sticky -top-[21px] z-50 pt-[21px] pb-4 -mx-5 px-5 bg-[#F8F9F5]/95 backdrop-blur-md border-b border-[#D4D7C9]/50 lg:border-none lg:static lg:bg-transparent lg:p-0 lg:m-0 lg:pb-6 lg:backdrop-blur-none transition-all">
        <div className="flex flex-col gap-3 relative">

          {/* Search Box */}
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

          {/* Filter Buttons */}
          <div className="flex gap-3 w-full">
            <div className="relative flex-1 w-full">
              <button
                onClick={() => { setIsColorDropdownOpen(!isColorDropdownOpen); setIsPatternDropdownOpen(false); }}
                className="w-full bg-white border border-[#D4D7C9] px-3 py-2.5 rounded-xl text-[10px] font-sans font-medium uppercase tracking-widest flex items-center justify-between gap-1 text-[#1C221A]/70 hover:border-[#4A5D23] shadow-sm cursor-pointer"
              >
                <span className="truncate">Colors ({selectedColors.length === 0 ? 'All' : selectedColors.length})</span>
                {isColorDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
              </button>
              {/* ড্রপডাউন কন্টেন্ট আগের মতোই থাকবে... */}
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

            <div className="relative flex-1 w-full">
              <button
                onClick={() => { setIsPatternDropdownOpen(!isPatternDropdownOpen); setIsColorDropdownOpen(false); }}
                className="w-full bg-white border border-[#D4D7C9] px-3 py-2.5 rounded-xl text-[10px] font-sans font-medium uppercase tracking-widest flex items-center justify-between gap-1 text-[#1C221A]/70 hover:border-[#4A5D23] shadow-sm cursor-pointer"
              >
                <span className="truncate">Patterns ({selectedPatterns.length === 0 ? 'All' : selectedPatterns.length})</span>
                {isPatternDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
              </button>
              {/* ড্রপডাউন কন্টেন্ট আগের মতোই থাকবে... */}
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
      </div>

      {/* 🎯 গ্রিড ফিক্স: মোবাইলে ফুল হাইট (প্যারেন্ট স্ক্রল করবে), পিসিতে নিজস্ব স্ক্রল */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-none overflow-visible lg:max-h-[360px] lg:overflow-y-auto lg:pr-2 custom-scrollbar relative z-10 pb-6 mt-4 lg:mt-0">
        {filteredFabrics.map((fabric: any) => {
          const outOfStock = fabric.yards <= 0;

          const fabricCoverImage = (Array.isArray(fabric?.preview_images) && fabric.preview_images.length > 0)
            ? fabric.preview_images[0]
            : (fabric?.raw_image_url || fabric?.texture_url || '/placeholder-image.jpg');

          // Discount Calculation
          const rawPrice = Number(fabric.price || 0);
          const hasDiscount = (fabric.discount_percentage ?? 0) > 0;
          const discountedPrice = hasDiscount
            ? Math.round(rawPrice - (rawPrice * (fabric.discount_percentage / 100)))
            : rawPrice;

          return (
            <div
              key={fabric.id}
              onClick={(e) => {
                if (!outOfStock) {
                  store.setSelectedFabricId(String(fabric.id));
                  setActiveBottomSheet(null);
                }
              }}
              className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all bg-white ${outOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#D4D7C9]'
                } ${store.selectedFabricId === String(fabric.id) ? 'border-[#4A5D23] shadow-md ring-1 ring-[#4A5D23]' : 'border-[#EBECE3]'}`}
            >
              <div className="aspect-square bg-[#EBECE3] relative overflow-hidden">
                <img src={fabricCoverImage} alt={fabric.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                {outOfStock && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <span className="bg-red-500/90 text-white text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* New Discount Badge */}
                {hasDiscount && !outOfStock && (
                  <div className="absolute top-2 left-2 bg-[#C25934] text-white text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm shadow-sm z-10">
                    -{fabric.discount_percentage}% OFF
                  </div>
                )}

                {store.selectedFabricId === String(fabric.id) && !outOfStock && (
                  <div className="absolute top-2 right-2 bg-[#4A5D23] rounded-full p-1 shadow-sm z-10">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalFabric(fabric);
                    setIsInfoModalOpen(true);
                  }}
                  className="absolute bottom-2 right-2 w-fit h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[10px] text-[#1C221A]/70 hover:text-[#4A5D23] shadow-sm transition-all z-20 gap-1 px-2"
                >
                  <Info className="w-3 h-3" /> Details
                </button>
              </div>

              <div className="p-3 flex flex-col justify-between flex-1">
                <h4 className="font-sans text-[12px] font-medium text-[#17210C] uppercase tracking-wide truncate">{fabric.name}</h4>

                <div className="flex flex-col mt-1.5 gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-[11px] font-medium text-[#C25934] uppercase tracking-widest">
                      ৳ {discountedPrice}/yd
                    </p>
                    {hasDiscount && (
                      <p className="font-sans text-[9px] text-[#1C221A]/40 line-through tracking-wider">
                        ৳ {rawPrice}
                      </p>
                    )}
                  </div>
                  <p className="font-sans text-[9px] text-[#1C221A]/50 tracking-widest">
                    {fabric.yards} yds in stock
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderStyleContent = () => {
    let styleCategories: any[] = [];

    if (store.selectedProduct === 'jubba') {
      styleCategories = [
        { id: 'collar', title: 'Collar Style', choices: Object.entries(UI_VECTORS.collar).filter(([k]) => ['band', 'round'].includes(k)) },
        { id: 'placket', title: 'Placket Style', choices: Object.entries(UI_VECTORS.placket) },
        { id: 'pocket', title: 'Pocket Style', choices: Object.entries(UI_VECTORS.pocket).filter(([k]) => ['no_pocket', 'side', 'chest'].includes(k)) }
      ];
    }
    else if (store.selectedProduct.startsWith('panjabi_')) {
      const type = store.selectedProduct.split('_')[1];

      let collars: Record<string, string | null> = {};
      let plackets: Record<string, string | null> = {};
      let pockets: Record<string, string | null> = {};

      if (type === 'regular') {
        collars = { band: UI_VECTORS.collar.band, mandarin: UI_VECTORS.collar.mandarin, round: UI_VECTORS.collar.round };
        plackets = UI_VECTORS.placket;
        pockets = { no_pocket: UI_VECTORS.pocket.no_pocket, side: UI_VECTORS.pocket.side, chest: UI_VECTORS.pocket.chest };
      } else if (type === 'madani') {
        collars = { band: UI_VECTORS.collar.band, round: UI_VECTORS.collar.round };
        plackets = UI_VECTORS.placket;
        pockets = { no_pocket: UI_VECTORS.pocket.no_pocket, side: UI_VECTORS.pocket.side, chest: UI_VECTORS.pocket.chest };
      } else if (type === 'kabuli') {
        collars = { band: UI_VECTORS.collar.band, shirt: UI_VECTORS.collar.shirt };
        // Kabuli-তে Placket অপশন রেন্ডার হবে না (Confusing না করার জন্য)
        pockets = { chest: UI_VECTORS.pocket.chest, double_flap: UI_VECTORS.pocket.double_chest };
      } else if (type === 'short') {
        collars = { band: UI_VECTORS.collar.band, mandarin: UI_VECTORS.collar.mandarin, shirt: UI_VECTORS.collar.shirt };
        plackets = UI_VECTORS.placket;
        pockets = { no_pocket: UI_VECTORS.pocket.no_pocket, side: UI_VECTORS.pocket.side, chest: UI_VECTORS.pocket.chest };
      }

      styleCategories = [
        { id: 'collar', title: 'Collar Style', choices: Object.entries(collars) },
        // Kabuli ছাড়া বাকি সবগুলোতে Placket রেন্ডার হবে
        ...(type !== 'kabuli' ? [{ id: 'placket', title: 'Placket Style', choices: Object.entries(plackets) }] : []),
        { id: 'pocket', title: 'Pocket Style', choices: Object.entries(pockets) }
      ];
    }
    else if (store.selectedProduct === 'shirt') {
      const collars = { spread: UI_VECTORS.collar.spread, buttondown: UI_VECTORS.collar.buttondown, mandarin: UI_VECTORS.collar.mandarin };
      const plackets = UI_VECTORS.placket;
      const pockets = { no_pocket: UI_VECTORS.pocket.no_pocket, chest: UI_VECTORS.pocket.chest };


      styleCategories = [
        // Sleeve Style সবার উপরে রেন্ডার হবে
        { id: 'sleeve', title: 'Sleeve Style', choices: Object.entries(UI_VECTORS.sleeve) },
        { id: 'collar', title: 'Collar Style', choices: Object.entries(collars) },
        { id: 'placket', title: 'Placket Style', choices: Object.entries(plackets) },
        { id: 'pocket', title: 'Pocket Style', choices: Object.entries(pockets) }
      ];
    }
    else if (store.selectedProduct.startsWith('pant_')) {
      styleCategories = [
        { id: 'front', title: 'Front Style', choices: Object.entries(UI_VECTORS.front) },
        { id: 'hem', title: 'Hem Style', choices: Object.entries(UI_VECTORS.hem) }
      ];
    }

    return (
      <div className="flex flex-col gap-6 max-h-none lg:max-h-[360px] overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-6">
        {styleCategories.map((category) => (
          <div key={category.id} className="animate-in fade-in duration-300">
            <h4 className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#4A5D23] mb-3">
              {category.title}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {category.choices.map(([key, imagePath]: [string, string | null]) => {

                const isSelected = store.productStyles[category.id] === key;

                // Badge এর জন্য স্পেশাল UI
                if (imagePath === 'badge') {
                  return (
                    <div
                      key={key}
                      onClick={() => store.setProductStyle(category.id, key)}
                      className={`relative flex items-center justify-center py-4 px-3 rounded-xl border cursor-pointer transition-all ${isSelected
                        ? 'border-[#4A5D23] bg-[#4A5D23]/10 ring-1 ring-[#4A5D23]'
                        : 'border-[#EBECE3] bg-white hover:border-[#D4D7C9]'
                        }`}
                    >
                      <span className={`font-sans text-[11px] uppercase tracking-widest text-center ${isSelected ? 'text-[#4A5D23]' : 'text-[#17210C]'}`}>
                        {key.replace('_', ' ')}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-[#4A5D23] rounded-full p-1 shadow-sm">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                }

                // রেগুলার আইকনের জন্য আগের UI
                return (
                  <div
                    key={key}
                    onClick={() => store.setProductStyle(category.id, key)}
                    className={`group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all bg-white ${isSelected
                      ? 'border-[#4A5D23] shadow-md ring-1 ring-[#4A5D23] bg-[#F8F9F5]'
                      : 'border-[#EBECE3] hover:border-[#D4D7C9]'
                      }`}
                  >
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
                      {imagePath ? (
                        <img src={imagePath} alt={key} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#1C221A]/30 group-hover:text-[#1C221A]/50 transition-colors" />
                      )}
                    </div>
                    <span className="font-sans text-[9px] font-medium uppercase tracking-widest text-[#17210C] text-center">
                      {key.replace('_', ' ')}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-[#4A5D23] rounded-full p-1 shadow-sm">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTailoringContent = () => {
    // বর্তমান প্রোডাক্টের অ্যাডভান্সড অপশনগুলো বের করা
    const activeKey = store.selectedProduct.startsWith('panjabi_') ? 'panjabi' : store.selectedProduct.startsWith('pant_') ? 'pant' : store.selectedProduct;
    const allOptions = ADVANCED_TAILORING_OPTIONS[activeKey] || [];

    // কন্ডিশনাল লজিক প্রয়োগ
    const visibleOptions = allOptions.filter(group =>
      group.condition ? group.condition(store.selectedProduct, store.productStyles) : true
    );

    if (visibleOptions.length === 0) {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <span className="font-heading text-[12px] uppercase tracking-widest text-[#1C221A]/40">
            Standard Fit
          </span>
          <span className="font-sans text-[10px] text-[#1C221A]/40 mt-2">
            No advanced tailoring required for this product.
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5 p-5 relative z-10">
        {/* Premium Trigger Banner */}
        <div
          onClick={() => setIsTailoringModalOpen(true)}
          className="w-full flex items-center justify-between p-4.5 bg-gradient-to-r from-[#4A5D23]/10 to-transparent border border-dashed border-[#4A5D23]/40 rounded-2xl cursor-pointer hover:bg-[#4A5D23]/10 transition-all shadow-sm group"
        >
          <div className="flex flex-col text-left">
            <span className="font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[#4A5D23]">
              ⚙️ Advanced Tailoring
            </span>
            <span className="font-sans text-[9px] uppercase tracking-wider text-[#1C221A]/60 mt-1">
              Configure detailed specifications
            </span>
          </div>
          <div className="px-3.5 py-1.5 bg-[#4A5D23] text-white text-[9px] font-sans font-medium uppercase tracking-widest rounded-full group-hover:bg-[#3D4C1D] shadow-sm transition-all shrink-0">
            Open Details
          </div>
        </div>

        {/* Selected Summary List */}
        <div className="flex flex-col gap-2 mt-1">
          {visibleOptions.map(group => {
            const selectedValue = store.productStyles[group.id];
            // সিলেক্টেড ভ্যালু না থাকলে ডিফল্ট (প্রথম) ভ্যালুটি দেখাবে
            const choice = group.choices.find(c => c[0] === selectedValue) || group.choices[0];
            const label = choice[0].replace(/_/g, ' ');

            return (
              <div key={group.id} className="flex justify-between items-center px-4 py-3.5 border border-[#D4D7C9]/60 rounded-xl bg-[#F8F9F5]/50 hover:bg-[#F8F9F5] transition-colors">
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-[#1C221A]/60">
                  {group.title}
                </span>
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#4A5D23]">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMeasurementContent = () => {
    const dynamicFields = MEASUREMENT_FIELDS[motherCat] || [];
    const availablePresets = Object.keys(STANDARD_SIZES[motherCat] || {});

    return (
      <>
        <div className="flex bg-[#EBECE3]/60 p-1 rounded-xl mb-6">
          <button onClick={() => store.setMeasurementMode('saved')} className={`flex-1 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-all ${store.measurementMode === 'saved' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50 hover:text-[#1C221A] cursor-pointer'}`}>My Profiles</button>
          <button onClick={() => store.setMeasurementMode('new')} className={`flex-1 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-all ${store.measurementMode === 'new' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50 hover:text-[#1C221A] cursor-pointer'}`}>New Size</button>
        </div>

        {store.measurementMode === 'saved' && (
          <div className="animate-in fade-in duration-300">
            {!userId ? (
              <div className="text-center py-8 bg-white/50 rounded-xl border border-[#D4D7C9]/40">
                <p className="font-sans text-xs text-[#1C221A]/70 mb-3">Please log in to access your saved custom fits.</p>
                <button onClick={() => setShowLoginModal(true)} className="px-5 py-2.5 bg-[#4A5D23] text-white text-[10px] uppercase tracking-widest rounded-lg shadow-sm hover:bg-[#3D4C1D] transition-colors cursor-pointer">Log In</button>
              </div>
            ) : uniquePersons.length > 0 ? (
              <div className="space-y-4">

                {/* Dropdown 1: Select Person */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Select Profile</label>
                  <div className="relative">
                    <select
                      value={store.selectedPerson}
                      onChange={(e) => store.setSelectedPerson(e.target.value)}
                      className="w-full bg-white border border-[#D4D7C9] p-3.5 pr-10 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl shadow-sm font-sans appearance-none cursor-pointer text-[#17210C]"
                    >
                      {uniquePersons.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/50 pointer-events-none" />
                  </div>
                </div>

                {/* Dropdown 2: Select Fit for current product */}
                {availableFits.length > 0 ? (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Select {motherCat} Fit</label>
                    <div className="relative">
                      <select
                        value={store.selectedFitId || ''}
                        onChange={(e) => store.setSelectedFitId(Number(e.target.value))}
                        className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/60 p-3.5 pr-10 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl font-sans appearance-none cursor-pointer text-[#17210C]"
                      >
                        {availableFits.map((fit) => (
                          <option key={fit.id} value={fit.id}>
                            {fit.fit_name} {fit.is_default ? '(Featured)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/50 pointer-events-none" />
                    </div>

                    {/* Display Measurements for Selected Fit */}
                    {store.selectedFitId && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 mt-3 bg-white rounded-xl border border-[#D4D7C9]/40 shadow-sm">
                        {(() => {
                          const fit = availableFits.find(p => p.id === store.selectedFitId);
                          if (!fit || !fit.measurements) return null;
                          return Object.entries(fit.measurements).map(([key, val]) => {
                            const labelDef = dynamicFields.find(f => f.id === key);
                            return (
                              <div key={key} className="flex flex-col">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-[#1C221A]/50 mb-0.5">{labelDef?.label || key}</span>
                                <span className="font-sans text-sm text-[#17210C] font-medium bg-[#F8F9F5] px-2.5 py-1.5 rounded-lg border border-[#D4D7C9]/30">{String(val)}"</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
                    <p className="font-sans text-xs mb-2">No {motherCat} size found for '{store.selectedPerson}'.</p>
                    <button onClick={() => store.setMeasurementMode('new')} className="px-4 py-2 bg-[#4A5D23] text-white text-[10px] uppercase tracking-widest rounded-lg shadow-sm hover:bg-[#3D4C1D] transition-colors cursor-pointer">
                      + Create New {motherCat} Size
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/50 rounded-xl border border-[#D4D7C9]/40">
                <p className="font-sans text-xs text-[#1C221A]/70 mb-2">No profiles found.</p>
                <button onClick={() => store.setMeasurementMode('new')} className="inline-flex justify-center w-fit mx-auto text-[#4A5D23] text-[12px] hover:text-accent uppercase tracking-widest hover:underline cursor-pointer">Create Profile <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}

        {store.measurementMode === 'new' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex gap-4 mb-6">
              {['preset', 'custom'].map((t) => (
                <button key={t} onClick={() => store.setSizeType(t as any)} className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-[0.15em] border-b-2 transition-all cursor-pointer ${store.sizeType === t ? 'border-[#4A5D23] text-[#4A5D23]' : 'border-transparent text-[#1C221A]/40 hover:text-[#1C221A]/70'}`}>
                  {t} Size
                </button>
              ))}
            </div>

            {store.sizeType === 'preset' ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {availablePresets.length > 0 ? availablePresets.map(sizeKey => (
                  <button key={sizeKey} onClick={() => store.setStandardSize(sizeKey)} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl text-[11px] md:text-[13px] font-heading font-bold transition-all cursor-pointer ${store.standardSize === sizeKey ? 'bg-[#4A5D23] text-white shadow-sm' : 'bg-white border border-[#D4D7C9] text-[#1C221A]/60 hover:border-[#4A5D23]'}`}>
                    {sizeKey}
                  </button>
                )) : <span className="text-xs text-[#1C221A]/50">Presets unavailable for this product.</span>}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dynamicFields.map(field => (
                    <div key={field.id}>
                      <label className="block text-[10px] font-medium uppercase text-[#4A5D23] mb-1">{field.label}</label>
                      <input
                        type="number" step="0.25"
                        value={store.customMeasurements[field.id] || ''}
                        onChange={(e) => store.setCustomMeasurement(field.id, e.target.value)}
                        className="w-full bg-white border border-[#D4D7C9] p-2.5 text-sm focus:outline-none focus:border-[#4A5D23] rounded-xl shadow-sm font-sans" placeholder="0.0"
                      />
                    </div>
                  ))}
                </div>

                {/* On-the-fly Save UI */}
                <div className="pt-4 border-t border-[#D4D7C9]/40">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/70 group-hover:text-[#17210C] transition-colors">Save this size for future?</span>
                    <input type="checkbox" checked={saveProfileToggle} onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked && !userId) { setShowLoginModal(true); return; }
                      setSaveProfileToggle(checked);
                      if (checked && !saveTargetPerson) setSaveTargetPerson(uniquePersons.length > 0 ? uniquePersons[0] : 'NEW_PROFILE');
                    }} className="w-4 h-4 accent-[#4A5D23] rounded cursor-pointer" />
                  </label>

                  {saveProfileToggle && userId && (
                    <div className="mt-4 p-4 bg-[#F8F9F5] border border-[#D4D7C9]/60 rounded-xl animate-in slide-in-from-top-2">

                      <label className="block text-[10px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Save under Profile</label>
                      <select
                        value={saveTargetPerson} onChange={e => setSaveTargetPerson(e.target.value)}
                        className="w-full bg-white border border-[#D4D7C9] p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#4A5D23] mb-3 cursor-pointer"
                      >
                        {uniquePersons.map(p => <option key={p} value={p}>{p}</option>)}
                        <option value="NEW_PROFILE" className="text-[#4A5D23]">+ Create New Profile</option>
                      </select>

                      {saveTargetPerson === 'NEW_PROFILE' && (
                        <div className="mb-3 animate-in fade-in">
                          <label className="block text-[10px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">New Profile Name</label>
                          <input type="text" placeholder="e.g. Me, Brother" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} className="w-full bg-white border border-[#D4D7C9] p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#4A5D23]" />
                        </div>
                      )}

                      <div className="mb-2">
                        <label className="block text-[10px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">{motherCat} Fit Name</label>
                        <input type="text" placeholder="e.g. Slim Fit, Loose Fit" value={newFitName} onChange={e => setNewFitName(e.target.value)} className="w-full bg-white border border-[#D4D7C9] p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#4A5D23]" />
                      </div>

                      {profileNameError && <p className="font-sans text-[12px] text-red-500 mt-1 mb-2">{profileNameError}</p>}

                      <button
                        onClick={handleSaveProfileOnTheFly}
                        disabled={hasSavedCurrentProfile || isSavingProfile || isSaveDisabled}
                        className={`w-full mt-2 py-2.5 rounded-lg font-sans text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-sm ${(hasSavedCurrentProfile || isSaveDisabled)
                            ? 'bg-[#EBECE3] text-[#1C221A]/40 cursor-not-allowed'
                            : 'bg-[#4A5D23] text-white hover:bg-[#3D4C1D] cursor-pointer'
                          }`}
                      >
                        {isSavingProfile ? 'Saving...' : hasSavedCurrentProfile ? 'Fit Saved Successfully' : 'Save Fit'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estimator Box */}
        <div className="mt-6 bg-[#EBECE3]/30 p-3.5 rounded-xl border border-[#D4D7C9]/60 flex justify-between items-center">
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#1C221A]/60">Est. Fabric Yardage:</span>
          <span className="text-[11px] uppercase tracking-widest text-[#4A5D23]">{calculatedYardage} Yards</span>
        </div>
      </>
    );
  };

  const renderOrderPreferences = () => (
    <div className="mt-4">
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
    </div>
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9F5]">
        <div className="w-10 h-10 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] bg-[#F8F9F5] lg:pb-32">

      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center sticky top-20 h-fit self-start">
        <div className="w-full aspect-square">
          <PanjabiCanvas
            color="#FFFFFF"
            fabricType={selectedFabric?.patterns?.[0]?.toLowerCase() || 'plain'}
            fabricImageUrl={selectedFabricTextureUrl}
            collarType={getCanvasCollarType(selectedCollar)} // আপাদত পুরনো সিস্টেম ব্রেক না করার জন্য রাখা হলো
            productOverlayUrl={getDynamicOverlayImage()} // নতুন ডাইনামিক পাথ
            onReset={() => setIsResetModalOpen(true)}
            onInfoClick={() => {
              setModalFabric(selectedFabric);
              setIsInfoModalOpen(true);
            }}
          />
        </div>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 min-h-screen px-4 md:px-8 lg:px-8 py-6 flex-col justify-start">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-[0.05em] text-[#17210C]">
            Bespoke Atelier
          </h1>
        </div>

        {/* 🎯 NEW TOP TOGGLE (Segmented Control) */}
        <div className="mb-8 p-1.5 bg-[#EBECE3]/60 rounded-xl flex items-center shadow-inner border border-[#D4D7C9]/40">
          <button
            onClick={() => store.setOrderMode('tailoring')}
            className={`flex-1 py-3.5 rounded-lg text-[12px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${store.orderMode === 'tailoring' ? 'bg-[#4A5D23] text-white shadow-md' : 'text-[#1C221A]/50 hover:text-[#17210C]'}`}
          >
            <span className="text-sm">✂️</span> {tailoredLabel}
          </button>
          <button
            onClick={() => store.setOrderMode('fabric')}
            className={`flex-1 py-3.5 rounded-lg text-[12px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${store.orderMode === 'fabric' ? 'bg-[#4A5D23] text-white shadow-md' : 'text-[#1C221A]/50 hover:text-[#17210C]'}`}
          >
            <span className="text-sm">🧵</span> Fabric Only
          </button>
        </div>

        <div className="space-y-4">
          {/* 01. Choose Product */}
          <div className="border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all">
            <button
              ref={(el) => { stepRefs.current[1] = el; }}
              onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)} className="w-full flex items-center justify-between p-5 bg-[#EBECE3]/30 hover:bg-[#EBECE3]/60 transition-colors cursor-pointer">
              <span className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">{stepProduct}Choose Product</span>
              {expandedStep === 1 ? <ChevronUp className="w-4 h-4 text-[#4A5D23]" /> : <ChevronDown className="w-4 h-4 text-[#1C221A]/50" />}
            </button>
            <div className={`p-5 border-t border-[#D4D7C9]/40 bg-transparent transition-all duration-300 ${expandedStep === 1 ? 'block animate-in slide-in-from-top-2' : 'hidden'}`}>
              {renderProductContent()}
            </div>
          </div>

          {/* 02. Choose Fabric */}
          <div className="border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all">
            <button
              ref={(el) => { stepRefs.current[2] = el; }}
              onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)} className="w-full flex items-center justify-between p-5 bg-[#EBECE3]/30 hover:bg-[#EBECE3]/60 transition-colors cursor-pointer">
              <span className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">{stepFabric}Choose Fabric</span>
              {expandedStep === 2 ? <ChevronUp className="w-4 h-4 text-[#4A5D23]" /> : <ChevronDown className="w-4 h-4 text-[#1C221A]/50" />}
            </button>
            <div className={`p-5 border-t border-[#D4D7C9]/40 bg-transparent transition-all duration-300 ${expandedStep === 2 ? 'block animate-in slide-in-from-top-2' : 'hidden'}`}>
              {renderFabricContent()}
            </div>
          </div>

          {/* 03. Choose Style (Conditionally Hidden) */}
          {showStyleSection && (
            <div className="border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300">
              <button
                ref={(el) => { stepRefs.current[3] = el; }}
                onClick={() => setExpandedStep(expandedStep === 3 ? 0 : 3)} className="w-full flex items-center justify-between p-5 bg-[#EBECE3]/30 hover:bg-[#EBECE3]/60 transition-colors cursor-pointer">
                <span className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">{stepStyle}Choose Style</span>
                {expandedStep === 3 ? <ChevronUp className="w-4 h-4 text-[#4A5D23]" /> : <ChevronDown className="w-4 h-4 text-[#1C221A]/50" />}
              </button>
              <div className={`p-5 border-t border-[#D4D7C9]/40 transition-all duration-300 ${expandedStep === 3 ? 'block animate-in slide-in-from-top-2' : 'hidden'}`}>
                {renderStyleContent()}
              </div>
            </div>
          )}

          {/* 04. Advanced Tailoring (Conditionally Hidden) */}
          {showAdvancedSection && (
            <div className="border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300">
              <button
                ref={(el) => { stepRefs.current[4] = el; }}
                onClick={() => setExpandedStep(expandedStep === 4 ? 0 : 4)} className="w-full flex items-center justify-between p-5 bg-[#EBECE3]/30 hover:bg-[#EBECE3]/60 transition-colors cursor-pointer">
                <span className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">{stepAdvanced}Advanced Tailoring</span>
                {expandedStep === 4 ? <ChevronUp className="w-4 h-4 text-[#4A5D23]" /> : <ChevronDown className="w-4 h-4 text-[#1C221A]/50" />}
              </button>
              <div className={`border-t border-[#D4D7C9]/40 bg-transparent transition-all duration-300 ${expandedStep === 4 ? 'block animate-in slide-in-from-top-2' : 'hidden'}`}>
                {renderTailoringContent()}
              </div>
            </div>
          )}

          {/* 05. Measurements / Fabric Estimator */}
          <div className="border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all">
            <button
              ref={(el) => { stepRefs.current[5] = el; }}
              onClick={() => setExpandedStep(expandedStep === 5 ? 0 : 5)} className="w-full flex items-center justify-between p-5 bg-[#EBECE3]/30 hover:bg-[#EBECE3]/60 transition-colors cursor-pointer">
              <span className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">{stepMeasure}{isFabricOnly ? 'Fabric Estimator' : 'Measurements'}</span>
              {expandedStep === 5 ? <ChevronUp className="w-4 h-4 text-[#4A5D23]" /> : <ChevronDown className="w-4 h-4 text-[#1C221A]/50" />}
            </button>
            <div className={`p-5 border-t border-[#D4D7C9]/40 bg-transparent transition-all duration-300 ${expandedStep === 5 ? 'block animate-in slide-in-from-top-2' : 'hidden'}`}>
              {renderMeasurementContent()}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#D4D7C9]/50">
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
                  ? `Add Customized ${getMotherCategoryName(store.selectedProduct)} to Cart`
                  : 'Purchase Fabric Bolt'}
            </button>
          </div>
        </div>
      </div>

      <div className={`lg:hidden fixed top-0 left-0 w-full h-[100dvh] z-0 transition-opacity duration-500 bg-[#F8F9F5] ${mobileStep === 'design' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <div className="absolute inset-0 w-full h-full pb-20 flex items-center justify-center">
          <PanjabiCanvas
            color="#FFFFFF"
            fabricType={selectedFabric?.patterns?.[0]?.toLowerCase() || 'plain'}
            fabricImageUrl={selectedFabricTextureUrl}
            collarType={getCanvasCollarType(selectedCollar)} // আপাদত পুরনো সিস্টেম ব্রেক না করার জন্য রাখা হলো
            productOverlayUrl={getDynamicOverlayImage()} // নতুন ডাইনামিক পাথ
            onReset={() => setIsResetModalOpen(true)}
            onInfoClick={() => {
              setModalFabric(selectedFabric);
              setIsInfoModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* 📱 MOBILE VIEW: Premium Segmented Toggle & Horizontal Carousel */}
      {mobileStep === 'design' && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-[#D4D7C9]/60 pb-safe pt-4 px-4 shadow-[0_-20px_40px_rgba(0,0,0,0.06)] z-20 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">

          {/* 🎯 Mobile Segmented Order Mode Toggle */}
          <div className="p-1 bg-[#EBECE3]/60 rounded-xl flex items-center shadow-inner border border-[#D4D7C9]/40 w-full">
            <button
              onClick={() => store.setOrderMode('tailoring')}
              className={`flex-1 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${store.orderMode === 'tailoring' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50'}`}
            >
              <span>✂️</span> Tailored {getMotherCategoryName(store.selectedProduct)}
            </button>
            <button
              onClick={() => store.setOrderMode('fabric')}
              className={`flex-1 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${store.orderMode === 'fabric' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50'}`}
            >
              <span>🧵</span> Fabric Only
            </button>
          </div>

          {/* 👑 Horizontal Scrollable Quick-Access Pills with Smart Gradient Fade */}
          <div className="relative w-full flex items-center">

            {/* Left Gradient Fade */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-30 pointer-events-none transition-opacity duration-300 ${showLeftFade ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Right Gradient Fade */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-30 pointer-events-none transition-opacity duration-300 ${showRightFade ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Scroll Container */}
            <div
              ref={pillContainerRef}
              onScroll={handlePillScroll}
              className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar pb-1 w-full snap-x scroll-smooth"
            >
              {/* Product Card Pill */}
              <button
                onClick={() => setActiveBottomSheet('product')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[11px] font-medium uppercase tracking-wider shrink-0 snap-center transition-all bg-white shadow-sm ${activeBottomSheet === 'product'
                  ? 'border-[#4A5D23] text-[#4A5D23] bg-[#4A5D23]/5 ring-1 ring-[#4A5D23]'
                  : 'border-[#D4D7C9] text-[#1C221A]'
                  }`}
              >
                <span>👕</span> {getMotherCategoryName(store.selectedProduct)}
              </button>

              {/* Fabric Card Pill */}
              <button
                onClick={() => setActiveBottomSheet('fabric')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-[11px] font-medium uppercase tracking-wider shrink-0 snap-center transition-all bg-white shadow-sm ${activeBottomSheet === 'fabric'
                  ? 'border-[#4A5D23] text-[#4A5D23] bg-[#4A5D23]/5 ring-1 ring-[#4A5D23]'
                  : 'border-[#D4D7C9] text-[#1C221A]'
                  }`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-[#D4D7C9] shrink-0">
                  <img src={selectedFabricCoverUrl} alt="Fabric" className="w-full h-full object-cover bg-gray-100" />
                </div>
                Fabric: {selectedFabric?.name || 'Select'}
              </button>

              {/* Style Card Pill (Conditionally Rendered) */}
              {showStyleSection && (
                <button
                  onClick={() => setActiveBottomSheet('style')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[11px] font-medium uppercase tracking-wider shrink-0 snap-center transition-all bg-white shadow-sm ${activeBottomSheet === 'style'
                    ? 'border-[#4A5D23] text-[#4A5D23] bg-[#4A5D23]/5 ring-1 ring-[#4A5D23]'
                    : 'border-[#D4D7C9] text-[#1C221A]'
                    }`}
                >
                  <span>✂️</span> Choose Style
                </button>
              )}

              {/* Advanced Card Pill (Conditionally Rendered) */}
              {showAdvancedSection && (
                <button
                  onClick={() => setActiveBottomSheet('advanced')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[11px] font-medium uppercase tracking-wider shrink-0 snap-center transition-all bg-white shadow-sm ${activeBottomSheet === 'advanced'
                    ? 'border-[#4A5D23] text-[#4A5D23] bg-[#4A5D23]/5 ring-1 ring-[#4A5D23]'
                    : 'border-[#D4D7C9] text-[#1C221A]'
                    }`}
                >
                  <span>⚙️</span> Advanced Fit
                </button>
              )}
            </div>
          </div>

          {/* 🛍️ Fixed Floating Bottom Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#D4D7C9]/40 w-full">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-widest text-[#1C221A]/50 mb-0.5">Total Amount</p>
              <p className="font-heading text-lg font-bold text-[#C25934]">৳{totalCost.toLocaleString()}</p>
            </div>

            <button
              onClick={() => { setActiveBottomSheet(null); setMobileStep('checkout'); }}
              disabled={!isFabricStockSufficient}
              className="bg-[#17210C] text-white h-11 px-6 rounded-full font-sans text-[11px] font-medium uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg hover:bg-[#4A5D23] active:scale-[0.98] transition-all"
            >
              <span>{isFabricStockSufficient ? (isFabricOnly ? 'Yards & Checkout' : 'Measurements') : 'Out of Stock'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 🎯 UNIFIED BOTTOM SHEET ENGINE FOR MOBILE */}
      <div className={`lg:hidden fixed inset-0 z-[1001] transition-opacity duration-300 ${activeBottomSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveBottomSheet(null)} />
        <div className={`absolute bottom-0 left-0 w-full bg-[#F8F9F5] rounded-t-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col h-[90dvh] ${activeBottomSheet ? 'translate-y-0' : 'translate-y-full'}`}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4D7C9]/50 shrink-0 bg-white rounded-t-3xl">
            <span className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#17210C]">
              {activeBottomSheet === 'product' && 'Select Product'}
              {activeBottomSheet === 'fabric' && 'Select Premium Fabric'}
              {activeBottomSheet === 'style' && 'Configure Style'}
              {activeBottomSheet === 'advanced' && 'Advanced Tailoring'}
            </span>
            <button onClick={() => setActiveBottomSheet(null)} className="p-2 -mr-2 bg-[#F8F9F5] rounded-full text-[#1C221A]/60 hover:text-[#C25934] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <div className={`h-full w-full p-5 overflow-y-auto custom-scrollbar ${activeBottomSheet === 'product' ? 'block' : 'hidden'}`}>
              {renderProductContent()}
            </div>
            <div className={`h-full w-full p-5 overflow-y-auto custom-scrollbar ${activeBottomSheet === 'fabric' ? 'block' : 'hidden'}`}>
              {renderFabricContent()}
            </div>
            <div className={`h-full w-full p-5 overflow-y-auto custom-scrollbar ${activeBottomSheet === 'style' ? 'block' : 'hidden'}`}>
              {renderStyleContent()}
            </div>
            <div className={`h-full w-full p-5 overflow-y-auto custom-scrollbar ${activeBottomSheet === 'advanced' ? 'block' : 'hidden'}`}>
              {renderTailoringContent()}
            </div>
          </div>

          {/* Manual Control Close bar for Style/Advanced multi-picks */}
          {(activeBottomSheet === 'style' || activeBottomSheet === 'advanced') && (
            <div className="p-4 bg-white border-t border-[#D4D7C9]/40 flex justify-end shrink-0">
              <button
                onClick={() => setActiveBottomSheet(null)}
                className="px-6 py-2.5 bg-[#4A5D23] text-white text-[11px] font-medium uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Apply & View Change
              </button>
            </div>
          )}
        </div>
      </div>

      {/* নতুন যুক্ত করা ব্যাকড্রপ ওভারলে */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001] transition-opacity duration-300 ${mobileStep === 'checkout' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileStep('design')}
      />

      {/* 📏 MOBILE VIEW: Finalize Details (Measurements / Fabric Only Calculator) */}
      {/* এখানে z-50 পরিবর্তন করে z-[1002] করা হয়েছে */}
      <div className={`lg:hidden fixed bottom-0 left-0 w-full h-[90dvh] bg-[#F8F9F5] rounded-t-3xl z-[1002] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileStep === 'checkout' ? 'translate-y-0' : 'translate-y-full'}`}>

        <div className="flex items-center px-4 py-4 border-b border-[#D4D7C9]/50 shrink-0 bg-white rounded-t-3xl relative">
          <button
            onClick={() => setMobileStep('design')}
            className="absolute left-4 p-2 bg-[#F8F9F5] rounded-full text-[#1C221A] flex items-center justify-center active:scale-90 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="w-full text-center font-heading text-[14px] font-bold uppercase tracking-[0.1em] text-[#17210C]">
            {isFabricOnly ? 'Fabric Specifications' : 'Finalize Fit Details'}
          </span>
        </div>

        <div className="p-5 overflow-y-auto pb-32 flex-1">
          {/* Conditionally hide measurements block entirely if Fabric Only */}
          {!isFabricOnly && (
            <>
              <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[#4A5D23] mb-3">Measurements</h3>
              <div className="bg-white p-4 rounded-2xl border border-[#D4D7C9]/40 shadow-sm mb-6">
                {renderMeasurementContent()}
              </div>
            </>
          )}

          <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[#4A5D23] mb-3">
            {isFabricOnly ? 'Required Yardage' : 'Preferences & Tailor Notes'}
          </h3>
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
              <p className="font-sans text-[10px] font-medium text-[#17210C] uppercase tracking-widest">
                {isFabricOnly ? `Premium Fabric Bolt` : `Tailored ${getMotherCategoryName(store.selectedProduct)}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!isFabricStockSufficient}
            className={`w-full py-3.5 rounded-full font-sans text-[11px] font-medium uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${!isFabricStockSufficient
              ? 'bg-[#D4D7C9] text-white cursor-not-allowed'
              : 'bg-[#4A5D23] text-white active:bg-[#3D4C1D] cursor-pointer'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {!isFabricStockSufficient ? 'Out of Stock' : (isFabricOnly ? 'Add Fabric to Cart' : `Add Customized ${getMotherCategoryName(store.selectedProduct)} to Cart`)}
          </button>
        </div>
      </div>

      {/* Fabric Quick View Modal */}
      <FabricQuickViewModal
        fabric={modalFabric}
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onSelectFabric={(fabricId) => {
          store.setSelectedFabricId(fabricId);
          setIsInfoModalOpen(false); // মডাল ক্লোজ হবে
        }}
      />

      {/* Advanced Tailoring Details Modal */}
      <TailoringDetailsModal
        isOpen={isTailoringModalOpen}
        onClose={() => setIsTailoringModalOpen(false)}
        productType={store.selectedProduct}
        productStyles={store.productStyles}
        setProductStyle={store.setProductStyle}
      />

      {showLoginModal && (
        <div className="fixed inset-0 z-[1005] flex items-center justify-center p-6">
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
                  store.resetCustomizer();
                  setIsResetModalOpen(false);
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
