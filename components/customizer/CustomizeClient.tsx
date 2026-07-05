"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { useSizeGuideStore } from '@/store/useSizeGuideStore';
import { cn } from '@/lib/utils';

const presetSizes = [
  { size: "S", yard: 2.25 },
  { size: "M", yard: 2.5 },
  { size: "L", yard: 2.5 },
  { size: "XL", yard: 3.0 },
  { size: "XXL", yard: 3.25 }
];

const sizeOptions = ['preset', 'custom'] as const;

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
  const updateDraft = useCustomizerStore((state) => state.updateDraft);
  const updateDraftMeasurement = useCustomizerStore((state) => state.updateDraftMeasurement);
  const updateDraftStyle = useCustomizerStore((state) => state.updateDraftStyle);

  const activeProductId = store.activeProductId;
  const activeDraft = activeProductId ? store.drafts[activeProductId] : null;

  // Proxy Variables (পুরনো কোডকে নতুন ড্রাফট আর্কিটেকচারের সাথে কানেক্ট করতে)
  const selectedPerson = activeDraft?.selectedPerson || '';
  const selectedFitId = activeDraft?.selectedFitId || null;
  const standardSize = activeDraft?.standardSize || 'M';
  const sizeType = activeDraft?.sizeType || 'preset';
  const measurementMode = activeDraft?.measurementMode || 'new';
  const customMeasurements = activeDraft?.customMeasurements || {};
  const productStyles = activeDraft?.productStyles || {};
  const yardage = activeDraft?.yardage || 0;
  const selectedFabricId = activeDraft?.fabricId || null;
  const selectedProduct = activeProductId || '';
  const specialInstructions = activeDraft?.specialInstructions || '';

  // Proxy Setters (Optimized with stable Zustand actions)
  const setSelectedPerson = useCallback((val: string) => activeProductId && updateDraft(activeProductId, { selectedPerson: val }), [activeProductId, updateDraft]);
  const setSelectedFitId = useCallback((val: number | null) => activeProductId && updateDraft(activeProductId, { selectedFitId: val }), [activeProductId, updateDraft]);
  const setStandardSize = useCallback((val: string) => activeProductId && updateDraft(activeProductId, { standardSize: val }), [activeProductId, updateDraft]);
  const setSizeType = useCallback((val: 'preset' | 'custom') => activeProductId && updateDraft(activeProductId, { sizeType: val }), [activeProductId, updateDraft]);
  const setMeasurementMode = useCallback((val: 'saved' | 'new') => activeProductId && updateDraft(activeProductId, { measurementMode: val }), [activeProductId, updateDraft]);
  const setCustomMeasurement = useCallback((key: string, val: string) => activeProductId && updateDraftMeasurement(activeProductId, key, val), [activeProductId, updateDraftMeasurement]);
  const setProductStyle = useCallback((key: string, val: string) => activeProductId && updateDraftStyle(activeProductId, key, val), [activeProductId, updateDraftStyle]);
  const setYardage = useCallback((val: number) => activeProductId && updateDraft(activeProductId, { yardage: val }), [activeProductId, updateDraft]);
  const setSelectedFabricId = useCallback((val: string | null) => activeProductId && updateDraft(activeProductId, { fabricId: val }), [activeProductId, updateDraft]);
  const setSpecialInstructions = useCallback((val: string) => activeProductId && updateDraft(activeProductId, { specialInstructions: val }), [activeProductId, updateDraft]);

  // 🎯 NEW: Helper for Dynamic Category Emoji
  const getCategoryEmoji = (prodId: string) => {
    if (!prodId) return '👕';
    if (prodId.startsWith('pant') || prodId.startsWith('pajama')) return '👖';
    if (prodId === 'jubba' || prodId.startsWith('panjabi')) return '🥼';
    return '👕'; // Default for Panjabi, Shirt etc.
  };

  // 🎯 NEW: Dynamic Placeholder based on Product Category
  const getNotePlaceholder = () => {
    if (store.orderMode === 'fabric') return "Any special cutting, folding or packaging instructions for this fabric?";
    
    if (motherCat === 'panjabi' || motherCat === 'jubba') {
      return "Any specific fitting instructions? (e.g., Keep the chest a bit loose, prefer shorter length...)";
    }
    if (motherCat === 'shirt') {
      return "Any preferences for the shirt? (e.g., Tighter collar, relaxed sleeves...)";
    }
    if (motherCat === 'pant' || motherCat === 'pajama') {
      return "Any specific instructions for the bottom? (e.g., Tapered ankle, extra room in thighs...)";
    }
    return "Final instructions or specific notes for our master tailor...";
  };

  // 🎯 NEW: Helper to dynamically get basic style categories and their valid options
  const getBasicStyleCategories = (prodId: string) => {
    let categories: { id: string; choices: string[] }[] = [];
    if (prodId === 'jubba') {
      categories = [
        { id: 'collar', choices: ['band', 'round'] },
        { id: 'placket', choices: ['hidden', 'visible'] },
        { id: 'pocket', choices: ['chest', 'side', 'no_pocket'] } // 'chest' কে প্রথমে রাখা হলো সেফ ডিফল্টের জন্য
      ];
    }
    else if (prodId.startsWith('panjabi_')) {
      const type = prodId.split('_')[1];
      let collars = type === 'madani' ? ['band', 'round'] : type === 'kabuli' ? ['band', 'shirt'] : type === 'short' ? ['band', 'mandarin', 'shirt'] : ['band', 'mandarin', 'round'];
      let pockets = type === 'kabuli' ? ['chest', 'double_flap'] : ['chest', 'side', 'no_pocket'];

      categories.push({ id: 'collar', choices: collars });
      if (type !== 'kabuli') categories.push({ id: 'placket', choices: ['hidden', 'visible'] });
      categories.push({ id: 'pocket', choices: pockets });
    }
    else if (prodId === 'shirt') {
      categories = [
        { id: 'sleeve', choices: ['full', 'half'] },
        { id: 'collar', choices: ['spread', 'buttondown', 'mandarin'] },
        { id: 'placket', choices: ['hidden', 'visible'] },
        { id: 'pocket', choices: ['chest', 'no_pocket'] }
      ];
    }
    else if (prodId.startsWith('pant_')) {
      categories = [
        { id: 'front', choices: ['flat', 'pleated'] },
        { id: 'hem', choices: ['regular', 'cuffed'] }
      ];
    }
    return categories;
  };

  // 🎯 NEW: Fully Dynamic Product Select Engine
  const handleProductSelect = (newProductId: string) => {
    isProductSwitching.current = true; // 🎯 FIX: অটো-জাম্প বন্ধ করার ফ্ল্যাগ

    const newMotherCat = newProductId.split('_')[0];
    const defaultFabricId = null;

    const defaultStyles: Record<string, string> = {};
    const basicCategories = getBasicStyleCategories(newProductId);
    basicCategories.forEach(cat => {
      if (cat.choices.length > 0) defaultStyles[cat.id] = cat.choices[0];
    });

    const advancedOptionsDef = ADVANCED_TAILORING_OPTIONS[newMotherCat] || [];
    advancedOptionsDef.forEach(group => {
      if (!group.condition || group.condition(newProductId, defaultStyles)) {
        defaultStyles[group.id] = group.choices[0][0];
      }
    });

    store.setActiveProduct(newProductId);
    store.initDraft(newProductId, defaultStyles, defaultFabricId);
    store.markStepCompleted(newProductId, 'product'); 
    setMobileViewedSteps([]);
    setFurthestStepIndex(0);

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setActiveBottomSheet(null); 
    } else {
      setExpandedStep(1); // পিসিতে স্টেপ ১-এই থাকবে
    }

    // 🎯 FIX: স্টেট আপডেটের পর ফ্ল্যাগটি রিসেট করা
    setTimeout(() => {
      isProductSwitching.current = false;
    }, 200);
  };

  // 🎯 NEW: Helper to dynamically get active sequence
  const getActiveSequence = () => {
    const isFabricMode = store.orderMode === 'fabric';
    const isPajamaProduct = (activeProductId || '').startsWith('pajama');

    const steps = ['product', 'fabric'];
    if (!isFabricMode && !isPajamaProduct) steps.push('style');
    if (!isFabricMode) steps.push('advanced');
    steps.push('measurements');
    return steps;
  };

  const getStepName = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return 'product';
      case 2: return 'fabric';
      case 3: return 'style';
      case 4: return 'advanced';
      case 5: return 'measurements';
      default: return '';
    }
  };

  // 🎯 NEW: Dynamic Step Lock Engine
  const isStepLocked = (stepNumber: number) => {
    if (!activeProductId || !activeDraft) return stepNumber > 1; // isZeroState check

    // 🎯 FIX: ফ্যাব্রিক সিলেক্ট না করা পর্যন্ত ২য় স্টেপের পরের সব স্টেপ লক থাকবে
    if (stepNumber > 2 && !selectedFabric) return true;

    const completed = activeDraft.completedSteps || [];
    const stepName = getStepName(stepNumber);
    const activeSequence = getActiveSequence();

    if (!activeSequence.includes(stepName)) return true;

    const stepIndex = activeSequence.indexOf(stepName);
    if (stepIndex === 0) return false; 

    const prevStepName = activeSequence[stepIndex - 1];
    return !completed.includes(prevStepName);
  };

  // 🎯 NEW: Dynamic Sequence Controller
  const handleChameleonNext = () => {
    if (!activeProductId || !activeDraft) {
      setExpandedStep(1);
      return;
    }

    if (expandedStep === 2 && !selectedFabric) {
      setShowFabricAlert(true);
      return;
    }

    const currentStepName = getStepName(expandedStep);
    if (currentStepName) {
      store.markStepCompleted(activeProductId, currentStepName);
    }

    if (expandedStep === 5) {
      // 🎯 Final Wall: Validation Before Add to Cart
      if (store.orderMode === 'tailoring') {
        const motherCat = activeProductId.split('_')[0];
        const dynamicFields = MEASUREMENT_FIELDS[motherCat] || [];

        if (measurementMode === 'new' && sizeType === 'custom') {
          const hasEmpty = dynamicFields.some(f => !customMeasurements[f.id] || Number(customMeasurements[f.id]) <= 0);
          if (hasEmpty) {
            alert("Please complete all custom measurements before adding to cart.");
            return;
          }
        } else if (measurementMode === 'saved' && !selectedFitId) {
          alert("Please select a measurement profile before adding to cart.");
          return;
        }
      }
      handleAddToCart();
      return;
    }

    // Find the next logical step and navigate to it
    const activeSequence = getActiveSequence();
    const currentIndex = activeSequence.indexOf(currentStepName);

    if (currentIndex !== -1 && currentIndex < activeSequence.length - 1) {
      const nextStepName = activeSequence[currentIndex + 1];
      const nextStepNum = {
        'product': 1, 'fabric': 2, 'style': 3, 'advanced': 4, 'measurements': 5
      }[nextStepName];
      if (nextStepNum) setExpandedStep(nextStepNum);
    }
  };

  // 🎯 NEW: Dynamic Button Text Generator
  const getButtonText = () => {
    if (!activeProductId || !activeDraft) return "Start Customizing";
    if (!isFabricStockSufficient) return "Out of Stock";

    if (expandedStep === 5) {
      const motherCatName = activeProductId.startsWith('panjabi') ? 'Panjabi' :
        activeProductId.startsWith('pajama') ? 'Pajama' :
          activeProductId.startsWith('pant') ? 'Pant' :
            activeProductId === 'jubba' ? 'Jubba' :
              activeProductId === 'shirt' ? 'Shirt' : 'Product';
      return store.orderMode === 'tailoring'
        ? `Add Tailored ${motherCatName} to Cart`
        : 'Purchase Fabric Bolt';
    }

    const currentStepName = getStepName(expandedStep);
    const activeSequence = getActiveSequence();
    const currentIndex = activeSequence.indexOf(currentStepName);

    if (currentIndex !== -1 && currentIndex < activeSequence.length - 1) {
      const nextStepName = activeSequence[currentIndex + 1];
      if (nextStepName === 'fabric') return "Next: Choose Fabric";
      if (nextStepName === 'style') return "Next: Configure Style";
      if (nextStepName === 'advanced') return "Next: Advanced Tailoring";
      if (nextStepName === 'measurements') return store.orderMode === 'fabric' ? "Next: Estimate Fabric Yardage" : "Next: Measurements";
    }

    return "Next";
  };



  const openSizeGuide = useSizeGuideStore((state) => state.openModal);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveProfileToggle, setSaveProfileToggle] = useState(false);
  const [profileNameError, setProfileNameError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [hasSavedCurrentProfile, setHasSavedCurrentProfile] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number>(0);
  const [zeroStateReason, setZeroStateReason] = useState<'fresh' | 'reset' | 'cart'>('fresh');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalFabric, setModalFabric] = useState<any>(null);
  const [mobileStep, setMobileStep] = useState<'design' | 'checkout'>('design');
  const [activeBottomSheet, setActiveBottomSheet] = useState<'product' | 'fabric' | 'style' | 'advanced' | null>(null);
  const [mobileViewedSteps, setMobileViewedSteps] = useState<string[]>([]);
  const [furthestStepIndex, setFurthestStepIndex] = useState<number>(0);
  const [showFabricAlert, setShowFabricAlert] = useState(false);

  // 🎯 Phase 3: Mobile Sequence & Auto-Scroll State
  const [mobileSequenceIndex, setMobileSequenceIndex] = useState(0);
  const mobilePillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isPatternDropdownOpen, setIsPatternDropdownOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isTailoringModalOpen, setIsTailoringModalOpen] = useState(false);

  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isProductSwitching = useRef(false);
  // কন্টেইনার স্ক্রল ট্র্যাক করার জন্য Ref এবং State
  const pillContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // কম্পোনেন্টের শুরুর দিকের স্টেটগুলোর মধ্যে এই স্টেটগুলো যোগ/আপডেট করুন
  const motherCat = activeProductId ? activeProductId.split('_')[0] : '';
  const isZeroState = !activeProductId || !activeDraft;
  const uniquePersons = useMemo(() => Array.from(new Set(activeSavedMeasurements.map(m => m.person_name))), [activeSavedMeasurements]);
  const availableFits = useMemo(() => activeSavedMeasurements.filter(m => m.person_name === selectedPerson && m.product_type === motherCat), [activeSavedMeasurements, selectedPerson, motherCat]);

  // --- ক্যাটাগরি অনুযায়ী সাইজ ফিল্টার (S/M/L vs Numbered) ---
  const rawPresets = useMemo(() => Object.keys(STANDARD_SIZES[motherCat] || {}), [motherCat]);

  const availablePresets = useMemo(() => {
    return rawPresets.filter(key => {
      const isNumeric = !isNaN(Number(key));

      // পাঞ্জাবি, শার্ট এবং পাজামার জন্য S, M, L (Alphabetic) দেখানো হবে
      if (motherCat === 'panjabi' || motherCat === 'shirt' || motherCat === 'pajama') {
        return !isNumeric;
      }
      // জুব্বা এবং প্যান্টের জন্য Numbered (52, 54 বা 32, 34) দেখানো হবে
      else if (motherCat === 'jubba' || motherCat === 'pant') {
        return isNumeric;
      }
      return true; // ফলব্যাক
    });
  }, [rawPresets, motherCat]);

  // 🎯 NEW: Smart Zero State Message Logic
  const zeroStateMessage =
    zeroStateReason === 'cart' ? "Added to Cart! Design your next item." :
      zeroStateReason === 'reset' ? "Reset Done. Please select a product." :
        "Please select a product to start customizing.";

  useEffect(() => {
    setFurthestStepIndex(0);
  }, [store.orderMode]);

  // 🎯 Furthest ইন-প্রোগ্রেস স্টেপ ট্র্যাক করার জন্য forward-only ইঞ্জিন
  useEffect(() => {
    if (!activeProductId || !activeDraft) return;
    
    const sequence = getActiveSequence();
    let currentStepName = '';
    
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (activeBottomSheet) {
        currentStepName = activeBottomSheet;
      } else if (mobileStep === 'checkout') {
        currentStepName = 'measurements';
      } else {
        currentStepName = sequence[Math.min(mobileSequenceIndex, sequence.length - 1)] || '';
      }
    } else {
      currentStepName = getStepName(expandedStep);
    }
    
    if (currentStepName) {
      const currentIndex = sequence.indexOf(currentStepName);
      // 🎯 CRITICAL: ইণ্ডেক্স কেবল সামনে (বৃদ্ধি) যেতে পারবে, কখনো পেছনে (হ্রাস) ব্যাকট্র্যাক করবে না
      if (currentIndex > furthestStepIndex) {
        setFurthestStepIndex(currentIndex);
      }
    }
  }, [expandedStep, activeBottomSheet, mobileStep, mobileSequenceIndex, activeProductId, furthestStepIndex]);

  // ক্যাটাগরি পরিবর্তনের সময় সাইজ রিসেট লজিক (Top-level Hook)
  useEffect(() => {
    if (availablePresets.length > 0 && !availablePresets.includes(standardSize)) {
      setStandardSize(availablePresets[0]);
    }
  }, [motherCat, availablePresets, standardSize, setStandardSize]);

  // On-the-fly Save States
  const [saveTargetPerson, setSaveTargetPerson] = useState<string>('');
  const [newProfileName, setNewProfileName] = useState('');
  const [newFitName, setNewFitName] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

  // 🎯 NEW: Accordion Auto-Expand Engine on Mount/Reload
  useEffect(() => {
    // 🎯 FIX: ইউজার অ্যাক্টিভলি প্রোডাক্ট সুইচ করলে এই অটো-জাম্প কাজ করবে না
    if (isHydrated && activeProductId && activeDraft && !isProductSwitching.current) {
      const activeSequence = getActiveSequence();
      const completed = activeDraft.completedSteps || [];

      // কোন স্টেপটি পেন্ডিং আছে তা বের করা
      let targetStepName = activeSequence.find(step => !completed.includes(step));

      if (!targetStepName) {
        targetStepName = activeSequence[activeSequence.length - 1];
      }

      // ১. PC এর জন্য Expanded Step আপডেট করা (পিসিতে আগের মতোই টার্গেট স্টেপ ওপেন হবে)
      const stepNameToNumber: Record<string, number> = {
        'product': 1, 'fabric': 2, 'style': 3, 'advanced': 4, 'measurements': 5
      };

      const targetStepNumber = stepNameToNumber[targetStepName];
      if (targetStepNumber) {
        setTimeout(() => {
          setExpandedStep(targetStepNumber);
        }, 100);
      }

      // ২. 🎯 MOBILE FIX: রিলোডের পর Mobile Sequence Index আপডেট করা
      const targetIndex = activeSequence.indexOf(targetStepName);
      if (targetIndex !== -1) {
        // 🎯 স্মার্ট লজিক: মোবাইলের নরমাল ফ্লো অনুযায়ী পিলটি লক রাখতে হবে, 
        // তাই আমরা বর্তমান পেন্ডিং ইনডেক্সের ঠিক আগের ইনডেক্সটি (targetIndex - 1) সেট করব।
        // এর ফলে চ্যামেলিয়ন বাটন সঠিক টেক্সট দেখাবে কিন্তু পিল লক থাকবে। 
        // ক্লিক করার পরেই কেবল পিলটি আনলক হবে।
        const lastCompletedIndex = Math.max(0, targetIndex - 1);
        setMobileSequenceIndex(lastCompletedIndex);
      }
    }
  }, [isHydrated, activeProductId]);

  // 1. Auto-Select Logic (Person and Fit Dropdowns)
  useEffect(() => {
    if (!isHydrated || activeSavedMeasurements.length === 0) return;

    // Set Featured Person if none selected
    if (!selectedPerson || !uniquePersons.includes(selectedPerson)) {
      const featuredPerson = activeSavedMeasurements.find(m => m.is_person_default)?.person_name || uniquePersons[0];
      setSelectedPerson(featuredPerson);
      return; // Will re-trigger due to dependency change
    }

    // Set Featured Fit for the selected Person and Product
    if (availableFits.length > 0) {
      const featuredFit = availableFits.find(m => m.is_default) || availableFits[0];
      if (selectedFitId !== featuredFit.id && !availableFits.some(m => m.id === selectedFitId)) {
        setSelectedFitId(featuredFit.id);
      }
    } else {
      setSelectedFitId(null);
    }
  }, [isHydrated, activeSavedMeasurements, selectedPerson, motherCat, uniquePersons, availableFits]);

  // 2. Dynamic Fabric Yardage Calculator
  const calculatedYardage = useMemo(() => {
    let meas: Record<string, number> = {};

    if (measurementMode === 'saved') {
      const fit = activeSavedMeasurements.find(m => m.id === selectedFitId);
      if (fit && fit.measurements) meas = fit.measurements;
    } else if (sizeType === 'preset') {
      meas = STANDARD_SIZES[motherCat]?.[standardSize] || {};
    } else {
      // Custom Inputs
      Object.keys(customMeasurements).forEach(k => {
        meas[k] = Number(customMeasurements[k]) || 0;
      });
    }

    return calculateFabricYardage({ productKey: selectedProduct, measurements: meas });
  }, [selectedProduct, measurementMode, selectedFitId, sizeType, standardSize, customMeasurements, activeSavedMeasurements, motherCat]);

  // Update yardage automatically for Fabric Mode
  useEffect(() => {
    if (store.orderMode === 'fabric') {
      setYardage(calculatedYardage);
    }
  }, [calculatedYardage, store.orderMode, setYardage]);

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
      const val = customMeasurements[field.id];
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
    Object.keys(customMeasurements).forEach(k => {
      numericMeasurements[k] = Number(customMeasurements[k]) || 0;
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
          setMeasurementMode('saved');
          setSelectedPerson(finalPersonName);
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
  }, [selectedProduct]); // প্রোডাক্ট চেঞ্জ হলে রিক্যালকুলেট হবে

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
      setSelectedFitId(null);
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
  }, [isLoaded, user?.id, savedMeasurements, setSelectedFitId]);

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
          const currentVal = Number(customMeasurements[field.id]) || 0;
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
    customMeasurements,
    activeSavedMeasurements,
    motherCat,
    hasSavedCurrentProfile // ডিপেন্ডেন্সিতে যুক্ত করা হলো সেফ ট্র্যাকিংয়ের জন্য
  ]);

  // 🎯 NEW: শুধুমাত্র Style এবং Advanced শিট ওপেন হলেই তা Viewed হিসেবে অটো-ট্র্যাক হবে
  useEffect(() => {
    if (activeBottomSheet === 'style' || activeBottomSheet === 'advanced') {
      setMobileViewedSteps((prev) => 
        prev.includes(activeBottomSheet) ? prev : [...prev, activeBottomSheet]
      );
    }
  }, [activeBottomSheet]);

  // 🎯 NEW: Product Specific Allowed Fabrics
  const allowedFabricsForProduct = useMemo(() => {
    return fabrics.filter((f: any) => {
      const hasAllowedProducts = Array.isArray(f.allowed_products) && f.allowed_products.length > 0;
      return !hasAllowedProducts || f.allowed_products.some(
        (product: string) => product.toLowerCase() === motherCat.toLowerCase()
      );
    });
  }, [fabrics, motherCat]);

  const filteredFabrics = useMemo(() => {
    return allowedFabricsForProduct.filter((f: any) => {
      const matchSearch = f.name.toLowerCase().includes(store.searchQuery.toLowerCase());
      const fabricColors = Array.isArray(f.colors) ? f.colors : [];
      const fabricPatterns = Array.isArray(f.patterns) ? f.patterns : [];

      const matchColor = selectedColors.length === 0 || selectedColors.some((color) => fabricColors.includes(color));
      const matchPattern = selectedPatterns.length === 0 || selectedPatterns.some((pattern) => fabricPatterns.includes(pattern));

      return matchSearch && matchColor && matchPattern;
    });
  }, [allowedFabricsForProduct, store.searchQuery, selectedColors, selectedPatterns]);

  // 🎯 NEW: Validate Fabric (কোনো অটো-সিলেক্ট হবে না, শুধু আনচেকড ফ্যাব্রিক রিমুভ হবে)
  useEffect(() => {
    if (!isHydrated) return;
    
    if (selectedFabricId) {
      const isValidFabric = allowedFabricsForProduct.some((f: any) => String(f.id) === selectedFabricId);
      if (!isValidFabric) {
        setSelectedFabricId(null); 
      }
    }
  }, [allowedFabricsForProduct, selectedFabricId, isHydrated, setSelectedFabricId]);

  // 🎯 NEW: Safe Fallback to null
  const selectedFabric = selectedFabricId ? allowedFabricsForProduct.find((f: any) => String(f.id) === selectedFabricId) || null : null;
  
  const selectedFabricImageUrl = selectedFabric?.image_url ? resolveProductImageSrc(selectedFabric.image_url) : undefined;
  const selectedFabricTextureUrl = selectedFabric?.texture_url || undefined;
  const selectedFabricCoverUrl = (Array.isArray(selectedFabric?.preview_images) && selectedFabric.preview_images.length > 0)
    ? selectedFabric.preview_images[0]
    : (selectedFabric?.raw_image_url || selectedFabric?.texture_url || undefined);
    
  const stitchingCharge = 450;
  const activeYardage = store.orderMode === 'tailoring' ? calculatedYardage : yardage;
  const maxFabricYards = selectedFabric?.yards || 0;
  
  // 🎯 NEW FIX: ফ্যাব্রিক সিলেক্ট না থাকলে Out of Stock এর এরর দেখাবে না
  const isFabricStockSufficient = selectedFabric ? maxFabricYards >= activeYardage : true;

  // 🎯 ডাইনামিক প্রাইসিং (ফ্যাব্রিক null হলে 0 হবে)
  const rawFabricPricePerYard = selectedFabric ? Number(selectedFabric.price || 0) : 0;
  const fabricDiscountPercentage = selectedFabric ? (selectedFabric.discount_percentage || 0) : 0;
  const discountedFabricPricePerYard = fabricDiscountPercentage > 0
    ? Math.round(rawFabricPricePerYard - (rawFabricPricePerYard * (fabricDiscountPercentage / 100)))
    : rawFabricPricePerYard;

  const originalFabricPrice = selectedFabric ? (rawFabricPricePerYard * activeYardage) : 0;
  const fabricPrice = selectedFabric ? (discountedFabricPricePerYard * activeYardage) : 0;

  const collarPrice = 0;
  const originalTotalCost = store.orderMode === 'tailoring'
    ? originalFabricPrice + stitchingCharge + collarPrice
    : originalFabricPrice;
  const totalCost = store.orderMode === 'tailoring'
    ? fabricPrice + stitchingCharge + collarPrice
    : fabricPrice;

  // --- NEW CONDITIONAL LOGIC ---
  const isFabricOnly = store.orderMode === 'fabric';
  const isPajama = selectedProduct.startsWith('pajama');

  const showStyleSection = !isFabricOnly && !isPajama;
  const showAdvancedSection = !isFabricOnly;

  // 🎯 NEW: Dynamic Button Text Generator (Wizard Flow)
  const getMobileMainButtonText = () => {
    if (!activeProductId || !activeDraft) return "Select Product";
    if (!isFabricStockSufficient) return "Out of Stock";

    const activeSequence = getActiveSequence();
    
    // 🎯 FIX: অরিজিনাল কমপ্লিট স্টেপ এবং মোবাইলের ভিউ করা স্টেপগুলোকে একত্রিত করা হলো
    const mobileEffectiveCompleted = Array.from(new Set([...(activeDraft.completedSteps || []), ...mobileViewedSteps]));
    const nextPendingStep = activeSequence.find(step => !mobileEffectiveCompleted.includes(step));

    if (nextPendingStep === 'product') return "Select Product";
    if (nextPendingStep === 'fabric') return "Choose Fabric";
    if (nextPendingStep === 'style') return "Configure Style";
    if (nextPendingStep === 'advanced') return "Advanced Fit";
    if (nextPendingStep === 'measurements') return isFabricOnly ? "Estimate Fabric" : "Enter Measurements";

    return "Continue";
  };

  // 🎯 Phase 3: Check if a pill should be locked
  const isMobilePillLocked = (stepName: string) => {
    const activeSequence = getActiveSequence();
    const stepIndex = activeSequence.indexOf(stepName);
    
    // 🎯 FIX: ফ্যাব্রিক সিলেক্ট না করা পর্যন্ত ২য় স্টেপের (fabric) পরের সব পিল লক থাকবে
    if (stepIndex > 1 && !selectedFabric) return true;
    
    return stepIndex > mobileSequenceIndex;
  };

  // 🎯 Phase 3: Auto-Center Active Pill Effect
  useEffect(() => {
    const activeSequence = getActiveSequence();
    // শিট ওপেন থাকলে সেটিকে টার্গেট করবে, নাহলে পেন্ডিং স্টেপটিকে টার্গেট করবে
    const targetPillKey = activeBottomSheet || activeSequence[Math.min(mobileSequenceIndex, activeSequence.length - 1)];

    if (targetPillKey && mobilePillRefs.current[targetPillKey] && pillContainerRef.current) {
      const pill = mobilePillRefs.current[targetPillKey];
      const container = pillContainerRef.current;

      const pillLeft = pill.offsetLeft;
      const pillWidth = pill.offsetWidth;
      const containerWidth = container.offsetWidth;

      // স্ক্রিনের ঠিক মাঝখানে আনার ম্যাথ
      const scrollPos = pillLeft - (containerWidth / 2) + (pillWidth / 2);

      container.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      });
    }
  }, [activeBottomSheet, mobileSequenceIndex, store.orderMode]);

  // Dynamic Mother Category Name for Toggle
  const getMotherCategoryName = (productId: string) => {
    if (productId.startsWith('panjabi')) return 'Panjabi';
    if (productId.startsWith('pajama')) return 'Pajama';
    if (productId.startsWith('pant')) return 'Pant';
    if (productId === 'jubba') return 'Jubba';
    if (productId === 'shirt') return 'Shirt';
    return 'Product';
  };
  const tailoredLabel = `Tailored ${getMotherCategoryName(selectedProduct)}`;

  // Dynamic Step Numbering
  const stepProduct = "01. ";
  const stepFabric = "02. ";
  const stepStyle = showStyleSection ? "03. " : "";
  const stepAdvanced = showAdvancedSection ? (showStyleSection ? "04. " : "03. ") : "";
  const stepMeasure = isFabricOnly ? "03. " : (isPajama ? "04. " : "05. ");

  const getDynamicOverlayImage = () => {
    if (selectedProduct === 'jubba') {
      const { collar, placket, pocket } = productStyles;
      return JUBBA_CANVAS_MAP[collar || 'band']?.[placket || 'hidden']?.[pocket || 'chest']
        || JUBBA_CANVAS_MAP['band']['hidden']['chest'];
    }
    else if (selectedProduct.startsWith('panjabi_')) {
      const type = selectedProduct.split('_')[1];
      const { collar, placket, pocket } = productStyles;

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
    else if (selectedProduct.startsWith('pajama_')) {
      const safeFit = selectedProduct.replace('pajama_', '') || 'aligarhi';
      return PAJAMA_CANVAS_MAP[safeFit] || PAJAMA_CANVAS_MAP['aligarhi'];
    }
    else if (selectedProduct === 'shirt') {
      const { sleeve, collar, placket, pocket } = productStyles;

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
    else if (selectedProduct.startsWith('pant_')) {
      const pantType = selectedProduct.split('_')[1];
      const { front, hem } = productStyles;
      return PANT_CANVAS_MAP[pantType]?.[front || 'flat']?.[hem || 'regular']
        || PANT_CANVAS_MAP['formal']['flat']['regular'];
    }

    return PANJABI_CANVAS_MAP['regular']['band']['hidden']['chest'];
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

    if (store.orderMode === 'tailoring' && measurementMode === 'saved') {
      const profile = activeSavedMeasurements.find(p => p.id.toString() === selectedFitId?.toString());
      if (!profile) {
        alert("Please select or create a valid measurement profile first.");
        return;
      }
    }

    const isTailoring = store.orderMode === 'tailoring';

    const selectedProfile = measurementMode === 'saved'
      ? activeSavedMeasurements.find((p: any) => p.id.toString() === selectedFitId?.toString())
      : null;

    // 🎯 1. Dynamic Measurements Logic
    let finalCustomMeasurements: Record<string, string | number> | undefined = undefined;

    if (isTailoring) {
      if (measurementMode === 'saved' && selectedProfile?.measurements) {
        finalCustomMeasurements = { ...selectedProfile.measurements };
      } else if (sizeType === 'custom') {
        finalCustomMeasurements = { ...customMeasurements };
      }
    }

    // 🎯 2. Logic to Split Styles vs Advanced Tailoring
    const basicStyles: Record<string, string> = {};
    const tailoringDetails: Record<string, string> = {};

    if (isTailoring) {
      const advancedOptionsDef = ADVANCED_TAILORING_OPTIONS[motherCat] || [];
      const advancedKeys = advancedOptionsDef.map(group => group.id);

      Object.entries(productStyles).forEach(([key, value]) => {
        if (advancedKeys.includes(key)) {
          tailoringDetails[key] = value;
        } else {
          basicStyles[key] = value;
        }
      });
    }

    // 🎯 3. NEW: Dynamic Product Name & Grouping Logic
    const motherCatName = getMotherCategoryName(selectedProduct);
    const subCategoryStr = selectedProduct.includes('_') ? selectedProduct.split('_')[1] : '';
    const formattedSubCat = subCategoryStr ? subCategoryStr.charAt(0).toUpperCase() + subCategoryStr.slice(1) : '';

    // কার্টে একই ধরনের প্রোডাক্ট কয়টি আছে তা কাউন্ট করা হচ্ছে (১, ২, ৩ ইনডেক্সিংয়ের জন্য)
    const existingItemsCount = cartStore.items.filter(i =>
      i.productId === productId && i.productType === (isTailoring ? 'custom_tailored' : 'custom_fabric_only')
    ).length;
    const productIndex = existingItemsCount + 1;

    const dynamicProductName = isTailoring
      ? `Custom Tailored ${motherCatName}${formattedSubCat ? ` - ${formattedSubCat}` : ''} - ${productIndex}`
      : `Fabric Bolt - ${selectedFabric?.name || 'Premium Fabric'}`;


    // 🎯 4. Add to Cart with updated Name and Size Value
    cartStore.addItem({
      productId: productId,
      productName: dynamicProductName, // 👈 প্রোডাক্টের নাম আপডেট করা হয়েছে
      productType: isTailoring ? 'custom_tailored' : 'custom_fabric_only',
      image: selectedFabricCoverUrl || '/placeholder-image.jpg',
      fabricId: selectedFabric?.id?.toString(),
      fabricName: selectedFabric?.name,
      fabricImage: selectedFabric?.texture_url,
      yardage: activeYardage,

      sizeMode: isTailoring
        ? (measurementMode === 'saved' ? 'saved_profile' : (sizeType === 'custom' ? 'custom_measurements' : 'preset'))
        : undefined,
        
      // 👈 সাইজ ডিসপ্লে লজিক আপডেট করা হয়েছে
      sizeValue: isTailoring
        ? (measurementMode === 'new' && sizeType === 'preset' ? standardSize : 'Custom')
        : undefined,

      customMeasurements: finalCustomMeasurements,
      productStyles: isTailoring ? basicStyles : undefined,
      tailoringDetails: isTailoring ? tailoringDetails : undefined,
      specialInstructions: specialInstructions.trim() || undefined,

      originalUnitPrice: originalFabricPrice,
      discountPercentage: fabricDiscountPercentage,
      unitPrice: fabricPrice,
      stitchingCharge: isTailoring ? stitchingCharge : 0,
    });

    cartStore.openCart();

    // 🎯 NEW: Auto Reset to Zero State after Cart Add
    if (activeProductId) {
      store.clearDraft(activeProductId);
    }
    setZeroStateReason('cart');
    if (mobileStep === 'checkout') setMobileStep('design');

    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setExpandedStep(1);
    }
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
                  handleProductSelect(product.id);
                  setExpandedCategory(null);
                  setActiveBottomSheet(null); // মোবাইলে অটো-ক্লোজ
                } else {
                  setExpandedCategory(expandedCategory === product.id ? null : product.id);
                }
              }}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedProduct === product.id || selectedProduct.startsWith(product.id + '_')
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
                      handleProductSelect(sub.id);
                      setActiveBottomSheet(null); // মোবাইলে অটো-ক্লোজ
                    }}
                    className={`p-3 rounded-xl border transition-all text-left ${selectedProduct === sub.id
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

      {/* 🎯 গ্রিড ফিক্স ও Empty States: মোবাইলে ফুল হাইট, পিসিতে নিজস্ব স্ক্রল */}
      {allowedFabricsForProduct.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/50 rounded-2xl border border-[#D4D7C9]/40 mt-4 lg:mt-0">
          <span className="text-3xl mb-3">😕</span>
          <h4 className="font-heading text-[13px] font-bold uppercase tracking-widest text-[#17210C] mb-2">No Fabrics Available</h4>
          <p className="font-sans text-[11px] text-[#1C221A]/60 max-w-xs mx-auto">
            We currently don't have any premium fabrics assigned for {getMotherCategoryName(selectedProduct)}. Please select a different product.
          </p>
        </div>
      ) : filteredFabrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/50 rounded-2xl border border-[#D4D7C9]/40 mt-4 lg:mt-0">
          <span className="text-3xl mb-3">🔍</span>
          <h4 className="font-heading text-[13px] font-bold uppercase tracking-widest text-[#17210C] mb-2">No Matches Found</h4>
          <p className="font-sans text-[11px] text-[#1C221A]/60 max-w-xs mx-auto mb-4">
            No fabrics match your selected filters. Try adjusting your search or clearing the filters.
          </p>
          <button
            onClick={() => {
              setSelectedColors([]);
              setSelectedPatterns([]);
              store.setSearchQuery('');
            }}
            className="px-5 py-2 bg-[#F8F9F5] border border-[#D4D7C9] rounded-lg text-[10px] font-medium uppercase tracking-widest text-[#1C221A] hover:border-[#4A5D23] transition-colors cursor-pointer shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
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
                  setSelectedFabricId(String(fabric.id));
                  if (activeProductId) {
                    store.markStepCompleted(activeProductId, 'fabric');
                  }
                  setActiveBottomSheet(null);
                }
              }}
              className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all bg-white ${outOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#D4D7C9]'
                } ${selectedFabricId === String(fabric.id) ? 'border-[#4A5D23] shadow-md ring-1 ring-[#4A5D23]' : 'border-[#EBECE3]'}`}
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

                {selectedFabricId === String(fabric.id) && !outOfStock && (
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
      )}
    </>
  );

  const StyleCategoryRow = ({ category, productStyles, setProductStyle }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeft(scrollLeft > 5);
    setShowRight(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Auto Center Active Element
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const timeoutId = setTimeout(() => {
      const activeItem = container.querySelector('[data-active="true"]') as HTMLElement;
      if (activeItem) {
        const scrollPos = activeItem.offsetLeft - (container.clientWidth / 2) + (activeItem.offsetWidth / 2);
        container.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
      checkScroll();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [productStyles[category.id], checkScroll]);

  return (
    <div className="relative w-full group/carousel">
      {/* 🎯 Premium Peek Arrow & Fade (Left) - Matched with Modal */}
      <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#F8F9F5] sm:from-white via-[#F8F9F5]/80 sm:via-white/80 to-transparent z-10 flex items-center justify-start pl-1 pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0'}`}>
         <ChevronLeft className="w-4 h-4 text-[#1C221A]/30 transition-colors group-hover/carousel:text-[#4A5D23]" />
      </div>

      {/* 🎯 Premium Peek Arrow & Fade (Right) - Matched with Modal */}
      <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F8F9F5] sm:from-white via-[#F8F9F5]/80 sm:via-white/80 to-transparent z-10 flex items-center justify-end pr-1 pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0'}`}>
         <ChevronRight className="w-4 h-4 text-[#1C221A]/30 transition-colors group-hover/carousel:text-[#4A5D23]" />
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 pb-4 sm:pb-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:gap-3"
      >
        {category.choices.map(([key, imagePath]: [string, string | null]) => {
          const isSelected = productStyles[category.id] === key;

          if (imagePath === 'badge') {
            return (
              <div
                key={key}
                data-active={isSelected}
                onClick={() => setProductStyle(category.id, key)}
                // 🎯 FIX: snap-start changed to snap-center
                className={`relative flex items-center justify-center py-4 px-3 rounded-[16px] border cursor-pointer transition-all shrink-0 w-[45%] snap-center sm:w-auto ${
                  isSelected
                    ? 'border-[#4A5D23] shadow-sm ring-1 ring-[#4A5D23] bg-white'
                    : 'border-[#D4D7C9]/60 bg-white hover:border-[#D4D7C9]'
                }`}
              >
                <span className={`font-sans text-[11px] uppercase tracking-widest text-center ${isSelected ? 'text-[#4A5D23]' : 'text-[#17210C]'}`}>
                  {key.replace(/_/g, ' ')}
                </span>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-[#4A5D23] rounded-full p-1 shadow-sm">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={key}
              data-active={isSelected}
              onClick={() => setProductStyle(category.id, key)}
              // 🎯 FIX: snap-start changed to snap-center & Wrapper colors matched with Modal
              className={`group relative flex flex-col rounded-[16px] overflow-hidden border cursor-pointer transition-all duration-300 shrink-0 w-[45%] snap-center sm:w-auto ${
                isSelected
                  ? 'border-[#4A5D23] shadow-sm ring-1 ring-[#4A5D23]'
                  : 'border-[#D4D7C9]/60 bg-white hover:border-[#D4D7C9]'
              }`}
            >
              {/* 🎯 FIX: Image Box bg changed to #F8F9F5 and added border-b to match Modal */}
              <div className="w-full aspect-square bg-[#F8F9F5] relative overflow-hidden flex items-center justify-center border-b border-[#EBECE3]/50">
                {imagePath ? (
                  <img
                    src={imagePath}
                    alt={key}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <XCircle className="w-8 h-8 text-[#1C221A]/20 transition-colors group-hover:text-[#1C221A]/40" />
                )}

                <div 
                  className={`absolute top-2 right-2 bg-[#4A5D23] rounded-full p-1 shadow-sm z-10 transition-all duration-200 transform ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
                  }`}
                >
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              </div>

              {/* 🎯 FIX: Footer colors matched with Modal */}
              <div className={`flex-1 p-2.5 flex items-center justify-center transition-colors ${
                isSelected ? 'bg-[#4A5D23]/5' : 'bg-white'
              }`}>
                <span className={`font-sans text-[9px] uppercase tracking-widest text-center truncate px-1 ${
                  isSelected ? 'text-[#4A5D23]' : 'text-[#17210C] font-medium'
                }`}>
                  {key.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  const renderStyleContent = () => {
    let styleCategories: any[] = [];

    if (selectedProduct === 'jubba') {
      styleCategories = [
        { id: 'collar', title: 'Collar Style', choices: Object.entries(UI_VECTORS.collar).filter(([k]) => ['band', 'round'].includes(k)) },
        { id: 'placket', title: 'Placket Style', choices: Object.entries(UI_VECTORS.placket) },
        { id: 'pocket', title: 'Pocket Style', choices: Object.entries(UI_VECTORS.pocket).filter(([k]) => ['no_pocket', 'side', 'chest'].includes(k)) }
      ];
    }
    else if (selectedProduct.startsWith('panjabi_')) {
      const type = selectedProduct.split('_')[1];

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
    else if (selectedProduct === 'shirt') {
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
    else if (selectedProduct.startsWith('pant_')) {
      styleCategories = [
        { id: 'front', title: 'Front Style', choices: Object.entries(UI_VECTORS.front) },
        { id: 'hem', title: 'Hem Style', choices: Object.entries(UI_VECTORS.hem) }
      ];
    }

    return (
      <div className="flex flex-col gap-6 max-h-none lg:max-h-[360px] overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-6">
        {styleCategories.map((category) => (
          <div key={category.id} className="animate-in fade-in duration-300 relative">
            <h4 className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#4A5D23] mb-3 px-1 sm:px-0">
              {category.title}
            </h4>
            
            {/* 🎯 NEW: Dynamic Carousel Component Injected Here */}
            <StyleCategoryRow
              category={category}
              productStyles={productStyles}
              setProductStyle={setProductStyle}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderTailoringContent = () => {
    // বর্তমান প্রোডাক্টের অ্যাডভান্সড অপশনগুলো বের করা
    const allOptions = ADVANCED_TAILORING_OPTIONS[motherCat] || [];

    // কন্ডিশনাল লজিক প্রয়োগ
    const visibleOptions = allOptions.filter(group =>
      group.condition ? group.condition(selectedProduct, productStyles) : true
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
            const selectedValue = productStyles[group.id];
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

    return (
      <>
        <div className="flex justify-between items-center mb-4 mt-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#1C221A]/70">Enter Your Measurements</span>
          <button
            type="button"
            onClick={() => openSizeGuide({ isGlobal: false, tab: 'guide', category: motherCat })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] text-[10px] font-medium uppercase tracking-widest hover:bg-[#4A5D23]/20 transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" /> How to Measure?
          </button>
        </div>
        <div className="flex bg-[#EBECE3]/60 p-1 rounded-xl mb-6">
          <button onClick={() => setMeasurementMode('saved')} className={`flex-1 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-all ${measurementMode === 'saved' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50 hover:text-[#1C221A] cursor-pointer'}`}>My Profiles</button>
          <button onClick={() => setMeasurementMode('new')} className={`flex-1 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-all ${measurementMode === 'new' ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-[#1C221A]/50 hover:text-[#1C221A] cursor-pointer'}`}>New Size</button>
        </div>

        {measurementMode === 'saved' && (
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
                      value={selectedPerson}
                      onChange={(e) => setSelectedPerson(e.target.value)}
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
                        value={selectedFitId || ''}
                        onChange={(e) => setSelectedFitId(Number(e.target.value))}
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
                    {selectedFitId && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 mt-3 bg-white rounded-xl border border-[#D4D7C9]/40 shadow-sm">
                        {(() => {
                          const fit = availableFits.find(p => p.id === selectedFitId);
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
                    <p className="font-sans text-xs mb-2">No {motherCat} size found for '{selectedPerson}'.</p>
                    <button onClick={() => setMeasurementMode('new')} className="px-4 py-2 bg-[#4A5D23] text-white text-[10px] uppercase tracking-widest rounded-lg shadow-sm hover:bg-[#3D4C1D] transition-colors cursor-pointer">
                      + Create New {motherCat} Size
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/50 rounded-xl border border-[#D4D7C9]/40">
                <p className="font-sans text-xs text-[#1C221A]/70 mb-2">No profiles found.</p>
                <button onClick={() => setMeasurementMode('new')} className="inline-flex justify-center w-fit mx-auto text-[#4A5D23] text-[12px] hover:text-accent uppercase tracking-widest hover:underline cursor-pointer">Create Profile <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}

        {measurementMode === 'new' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex gap-4 mb-6">
              {['preset', 'custom'].map((t) => (
                <button key={t} onClick={() => setSizeType(t as any)} className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-[0.15em] border-b-2 transition-all cursor-pointer ${sizeType === t ? 'border-[#4A5D23] text-[#4A5D23]' : 'border-transparent text-[#1C221A]/40 hover:text-[#1C221A]/70'}`}>
                  {t} Size
                </button>
              ))}
            </div>

            {sizeType === 'preset' ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {availablePresets.length > 0 ? availablePresets.map(sizeKey => (
                  <button key={sizeKey} onClick={() => setStandardSize(sizeKey)} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl text-[11px] md:text-[13px] font-heading font-bold transition-all cursor-pointer ${standardSize === sizeKey ? 'bg-[#4A5D23] text-white shadow-sm' : 'bg-white border border-[#D4D7C9] text-[#1C221A]/60 hover:border-[#4A5D23]'}`}>
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
                        value={customMeasurements[field.id] || ''}
                        onChange={(e) => setCustomMeasurement(field.id, e.target.value)}
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
            <button onClick={() => setYardage(Math.max(0.5, yardage - 0.5))} className="w-8 h-8 rounded-full border border-[#4A5D23] text-[#4A5D23] flex items-center justify-center font-medium hover:bg-[#4A5D23] hover:text-white transition-colors cursor-pointer">-</button>
            <span className="font-heading text-lg font-bold">{yardage}</span>
            <button
              onClick={() => setYardage(yardage + 0.5)}
              disabled={yardage + 0.5 > maxFabricYards}
              className={`w-8 h-8 rounded-full border border-[#4A5D23] text-[#4A5D23] flex items-center justify-center font-medium transition-colors ${yardage + 0.5 > maxFabricYards ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#4A5D23] hover:text-white cursor-pointer'
                }`}>+</button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="w-full bg-white/60 border border-[#D4D7C9] p-4 rounded-2xl text-sm focus:outline-none focus:border-[#4A5D23] h-24 placeholder:text-[#1C221A]/40 font-sans shadow-sm"
            placeholder={getNotePlaceholder()}
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
            productOverlayUrl={getDynamicOverlayImage()}
            hasFabric={!!selectedFabric}
            onReset={() => setIsResetModalOpen(true)}
            onInfoClick={() => {
              setModalFabric(selectedFabric);
              setIsInfoModalOpen(true);
            }}
            showTracker={!isZeroState}
            onTrackerClick={() => setIsTrackerOpen(true)}
            showZeroState={isZeroState}
            zeroStateMessage={zeroStateMessage}
          />
        </div>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 min-h-screen px-4 md:px-8 lg:px-8 py-6 flex-col justify-start">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-3xl font-bold uppercase tracking-[0.05em] text-[#17210C]">
              Bespoke Atelier
            </h1>
          </div>
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
          <div className={cn("border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300", isStepLocked(1) ? "opacity-50 pointer-events-none grayscale-[0.5]" : "opacity-100")}>
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
          <div className={cn("border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300", isStepLocked(2) ? "opacity-50 pointer-events-none grayscale-[0.5]" : "opacity-100")}>
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
            <div className={cn("border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300", isStepLocked(3) ? "opacity-50 pointer-events-none grayscale-[0.5]" : "opacity-100")}>
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
            <div className={cn("border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300", isStepLocked(4) ? "opacity-50 pointer-events-none grayscale-[0.5]" : "opacity-100")}>
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
          <div className={cn("border border-[#D4D7C9]/60 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300", isStepLocked(5) ? "opacity-50 pointer-events-none grayscale-[0.5]" : "opacity-100")}>
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
                <div><p className="text-[9px] font-medium uppercase tracking-widest text-[#1C221A]/50 mb-1">Fabric Cost</p><p className="font-sans text-xs font-medium text-[#17210C]">{selectedFabric ? `৳${fabricPrice.toLocaleString()}` : '---'}</p></div>
              </>
            ) : (
              <div><p className="text-[9px] font-medium uppercase tracking-widest text-[#1C221A]/50 mb-1">Fabric Investment {selectedFabric ? `(${yardage} yds)` : ''}</p><p className="font-sans text-xs font-medium text-[#17210C]">{selectedFabric ? `৳${fabricPrice.toLocaleString()}` : '---'}</p></div>
            )}
            <div className="h-8 w-px bg-[#D4D7C9] mx-2" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-[#4A5D23] mb-1">Total Statement</p>
              <div className="flex items-center gap-2">
                <p className={`font-heading text-2xl font-bold ${selectedFabric ? 'text-[#C25934]' : 'text-[#1C221A]/40'}`}>
                  {selectedFabric || store.orderMode === 'tailoring' ? `৳${totalCost.toLocaleString()}` : '---'}
                </p>
                {fabricDiscountPercentage > 0 && selectedFabric && (
                  <div className="flex items-center gap-1.5">
                    <p className="font-sans text-sm text-[#1C221A]/40 line-through">৳{originalTotalCost.toLocaleString()}</p>
                    <span className="text-[10px] bg-[#C25934]/10 text-[#C25934] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                      -{fabricDiscountPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedFabric && !isFabricStockSufficient ? (
              <div className="text-red-500 text-[11px] uppercase text-right font-medium">
                Not enough stock!<br />({maxFabricYards} yds available)
              </div>
            ) : null}
            <button
              onClick={handleChameleonNext}
              disabled={!isZeroState && selectedFabric && !isFabricStockSufficient}
              className={`w-full md:w-auto px-12 py-4 rounded-full font-sans text-[11px] font-medium uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${
                (!isZeroState && selectedFabric && !isFabricStockSufficient)
                  ? 'bg-[#D4D7C9] text-white cursor-not-allowed'
                  : 'bg-[#4A5D23] text-white hover:bg-[#3D4C1D] active:scale-[0.98] cursor-pointer'
              }`}
            >
              {expandedStep === 5 ? <ShoppingCart className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {getButtonText()}
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
            productOverlayUrl={getDynamicOverlayImage()}
            hasFabric={!!selectedFabric}
            onReset={() => setIsResetModalOpen(true)}
            onInfoClick={() => {
              setModalFabric(selectedFabric);
              setIsInfoModalOpen(true);
            }}
            showTracker={!isZeroState}
            onTrackerClick={() => setIsTrackerOpen(true)}
            showZeroState={isZeroState}
            zeroStateMessage={zeroStateMessage}
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
              <span>✂️</span> Tailored {getMotherCategoryName(selectedProduct)}
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
                ref={(el) => { mobilePillRefs.current['product'] = el; }}
                disabled={isMobilePillLocked('product')}
                onClick={() => setActiveBottomSheet('product')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[11px] font-medium uppercase tracking-wider shrink-0 snap-center transition-all bg-white shadow-sm ${isMobilePillLocked('product')
                  ? 'opacity-40 grayscale pointer-events-none border-[#EBECE3]'
                  : activeBottomSheet === 'product'
                    ? 'border-[#4A5D23] text-[#4A5D23] bg-[#4A5D23]/5 ring-1 ring-[#4A5D23]'
                    : 'border-[#D4D7C9] text-[#1C221A] hover:border-[#4A5D23]/50'
                  }`}
              >
                <span>{getCategoryEmoji(selectedProduct)}</span>
                {isZeroState ? 'Select Product' : getMotherCategoryName(selectedProduct)}
              </button>

              {/* Fabric Card Pill */}
              <button
                ref={(el) => { mobilePillRefs.current['fabric'] = el; }}
                disabled={isMobilePillLocked('fabric')}
                onClick={() => setActiveBottomSheet('fabric')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-[11px] font-medium uppercase tracking-wider shrink-0 snap-center transition-all bg-white shadow-sm ${isMobilePillLocked('fabric')
                  ? 'opacity-40 grayscale pointer-events-none border-[#EBECE3]'
                  : activeBottomSheet === 'fabric'
                    ? 'border-[#4A5D23] text-[#4A5D23] bg-[#4A5D23]/5 ring-1 ring-[#4A5D23]'
                    : 'border-[#D4D7C9] text-[#1C221A] hover:border-[#4A5D23]/50'
                  }`}
              >
                {/* 🎯 SMART LOGIC: স্টেপ কমপ্লিট না হওয়া পর্যন্ত 'Choose Fabric' দেখাবে */}
                {isMobilePillLocked('fabric') || !activeDraft?.completedSteps?.includes('fabric') ? (
                  <><span>🧵</span> Choose Fabric</>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-[#D4D7C9] shrink-0">
                      <img src={selectedFabricCoverUrl} alt="Fabric" className="w-full h-full object-cover bg-gray-100" />
                    </div>
                    Fabric: {selectedFabric?.name || 'Select'}
                  </>
                )}
              </button>

              {/* Style Card Pill (Conditionally Rendered) */}
              {showStyleSection && (
                <button
                  ref={(el) => { mobilePillRefs.current['style'] = el; }}
                  disabled={isMobilePillLocked('style')}
                  onClick={() => setActiveBottomSheet('style')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[11px] font-medium uppercase tracking-wider shrink-0 snap-center transition-all bg-white shadow-sm ${isMobilePillLocked('style')
                    ? 'opacity-40 grayscale pointer-events-none border-[#EBECE3]'
                    : activeBottomSheet === 'style'
                      ? 'border-[#4A5D23] text-[#4A5D23] bg-[#4A5D23]/5 ring-1 ring-[#4A5D23]'
                      : 'border-[#D4D7C9] text-[#1C221A] hover:border-[#4A5D23]/50'
                    }`}
                >
                  <span>✂️</span> Choose Style
                </button>
              )}

              {/* Advanced Card Pill (Conditionally Rendered) */}
              {showAdvancedSection && (
                <button
                  ref={(el) => { mobilePillRefs.current['advanced'] = el; }}
                  disabled={isMobilePillLocked('advanced')}
                  onClick={() => setActiveBottomSheet('advanced')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[11px] font-medium uppercase tracking-wider shrink-0 snap-center transition-all bg-white shadow-sm ${isMobilePillLocked('advanced')
                    ? 'opacity-40 grayscale pointer-events-none border-[#EBECE3]'
                    : activeBottomSheet === 'advanced'
                      ? 'border-[#4A5D23] text-[#4A5D23] bg-[#4A5D23]/5 ring-1 ring-[#4A5D23]'
                      : 'border-[#D4D7C9] text-[#1C221A] hover:border-[#4A5D23]/50'
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
              <div className="flex items-baseline gap-1.5">
                <p className={`font-heading text-lg md:text-2xl font-bold ${selectedFabric ? 'text-[#C25934]' : 'text-[#1C221A]/40'}`}>
                  {selectedFabric || store.orderMode === 'tailoring' ? `৳${totalCost.toLocaleString()}` : '---'}
                </p>
                {fabricDiscountPercentage > 0 && selectedFabric && (
                  <div className="flex items-center gap-1.5">
                    <p className="font-sans text-sm text-[#1C221A]/40 line-through">৳{originalTotalCost.toLocaleString()}</p>
                    <span className="text-[10px] bg-[#C25934]/10 text-[#C25934] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                      -{fabricDiscountPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                const activeSequence = getActiveSequence();
                
                // 🎯 FIX: এখানেও Effective Completed ব্যবহার করা হলো
                const mobileEffectiveCompleted = Array.from(new Set([...(activeDraft?.completedSteps || []), ...mobileViewedSteps]));
                
                const targetStep = activeSequence.find(step => !mobileEffectiveCompleted.includes(step)) || 'measurements';
                const targetIndex = activeSequence.indexOf(targetStep);

                if (targetIndex > mobileSequenceIndex) {
                  setMobileSequenceIndex(targetIndex);
                }

                if (targetStep === 'measurements') {
                  setActiveBottomSheet(null);
                  setMobileStep('checkout');
                } else {
                  setActiveBottomSheet(targetStep as any);
                }
              }}
              disabled={selectedFabric && !isFabricStockSufficient}
              className={`h-11 px-6 rounded-full font-sans text-[11px] font-medium uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg transition-all ${
                (selectedFabric && !isFabricStockSufficient)
                  ? 'bg-[#EBECE3] text-[#1C221A]/40 cursor-not-allowed'
                  : 'bg-[#17210C] text-white hover:bg-[#4A5D23] active:scale-[0.98] cursor-pointer'
              }`}
            >
              <span>{getMobileMainButtonText()}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 🎯 UNIFIED BOTTOM SHEET ENGINE FOR MOBILE */}
      <div className={`lg:hidden fixed inset-0 z-[1001] transition-opacity duration-300 ${activeBottomSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveBottomSheet(null)} />
        <div className={`absolute bottom-0 left-0 w-full bg-[#F8F9F5] rounded-t-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col h-[90dvh] ${activeBottomSheet ? 'translate-y-0' : 'translate-y-full'}`}>

          {/* 🎯 Phase 2: Solo Island Progress Tracker Button */}
          {activeBottomSheet && !isZeroState && (
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-white/60 text-[#17210C] transition-all active:scale-95 cursor-pointer z-50 opacity-100 pointer-events-auto visible"
            >
              <Eye className="w-[18px] h-[18px] text-[#4A5D23]" />
              <span className="font-sans text-[10px] uppercase tracking-widest mt-0.5">View Progress</span>
            </button>
          )}

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
                onClick={() => {
                  if (activeProductId && activeBottomSheet) {
                    store.markStepCompleted(activeProductId, activeBottomSheet);
                  }
                  setActiveBottomSheet(null);
                }}
                className="px-6 py-2.5 bg-[#4A5D23] text-white text-[11px] font-medium uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {activeBottomSheet === 'style' ? 'Apply & View Change' : 'Confirm Details'}
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

        {/* 🎯 Phase 2: Solo Island Progress Tracker Button */}
        {mobileStep === 'checkout' && !isZeroState && (
          <button
            onClick={() => setIsTrackerOpen(true)}
            className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-white/60 text-[#17210C] transition-all active:scale-95 cursor-pointer z-50 opacity-100 pointer-events-auto visible"
          >
            <Eye className="w-[18px] h-[18px] text-[#4A5D23]" />
            <span className="font-sans text-[10px] uppercase tracking-widest mt-0.5">View Progress</span>
          </button>
        )}

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
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[#4A5D23]">
              {isFabricOnly ? 'Fabric Estimator' : 'Measurements'}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#D4D7C9]/40 shadow-sm mb-6">
            {renderMeasurementContent()}
          </div>

          <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[#4A5D23] mb-3">
            {isFabricOnly ? 'Required Yardage' : 'Preferences & Tailor Notes'}
          </h3>
          <div className="mb-6">
            {renderOrderPreferences()}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-[#D4D7C9]/60 p-4 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          {!isFabricStockSufficient && selectedFabric && (
            <div className="text-red-500 text-center text-[11px] uppercase mb-2">
              Not enough stock! (Only {maxFabricYards} yds available)
            </div>
          )}
          <div className="flex justify-between items-center mb-3 px-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#1C221A]/50 mb-0.5">Total Amount</p>
              <p className={`font-heading text-2xl font-bold ${selectedFabric ? 'text-[#C25934]' : 'text-[#1C221A]/40'}`}>
                {selectedFabric || store.orderMode === 'tailoring' ? `৳${totalCost.toLocaleString()}` : '---'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-sans text-[10px] font-medium text-[#17210C] uppercase tracking-widest">
                {isFabricOnly ? `Premium Fabric Bolt` : `Tailored ${getMotherCategoryName(selectedProduct)}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedFabric || !isFabricStockSufficient}
            className={`w-full py-3.5 rounded-full font-sans text-[11px] font-medium uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${!selectedFabric || !isFabricStockSufficient
              ? 'bg-[#D4D7C9] text-white cursor-not-allowed'
              : 'bg-[#4A5D23] text-white active:bg-[#3D4C1D] cursor-pointer'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {!selectedFabric ? 'No Fabric Selected' : !isFabricStockSufficient ? 'Out of Stock' : (isFabricOnly ? 'Add Fabric to Cart' : `Add Customized ${getMotherCategoryName(selectedProduct)} to Cart`)}
          </button>
        </div>
      </div>

      {/* Fabric Quick View Modal */}
      <FabricQuickViewModal
        fabric={modalFabric}
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onSelectFabric={(fabricId) => {
          setSelectedFabricId(fabricId);
          setIsInfoModalOpen(false); // মডাল ক্লোজ হবে
        }}
      />

      {/* Advanced Tailoring Details Modal */}
      <TailoringDetailsModal
        isOpen={isTailoringModalOpen}
        onClose={() => setIsTailoringModalOpen(false)}
        productType={selectedProduct}
        productStyles={productStyles}
        setProductStyle={setProductStyle}
      />

      {/* 🎯 Live Progress Tracker Modal */}
      {isTrackerOpen && activeDraft && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#111410]/70 backdrop-blur-md transition-opacity" onClick={() => setIsTrackerOpen(false)} />
          <div className="relative w-full max-w-md bg-[#F8F9F5] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            <div className="flex justify-between items-center border-b border-[#D4D7C9] pb-4 mb-4">
              <h3 className="font-heading text-lg font-bold uppercase tracking-widest text-[#17210C]">
                Draft Summary
              </h3>
              <button onClick={() => setIsTrackerOpen(false)} className="p-2 bg-white rounded-full text-[#1C221A]/60 hover:text-red-500 shadow-sm cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 font-sans text-xs">
              {/* Product */}
              <div className="bg-white p-3 rounded-xl border border-[#D4D7C9]/40 flex justify-between items-center">
                <span className="font-medium text-[#1C221A]/70 uppercase tracking-wider">Product</span>
                <span className="text-[#4A5D23] capitalize font-medium">{selectedProduct.replace('_', ' ')}</span>
              </div>

              {(() => {
                const sequence = getActiveSequence();
                
                // 🎯 FIX: কোনো অনুমানের ওপর ভিত্তি করে নয়, সরাসরি সর্বোচ্চ লকড ইণ্ডেক্স থেকে একটিভ স্টেপ বের করা
                const currentActiveStepName = sequence[Math.min(furthestStepIndex, sequence.length - 1)];

                const getStatus = (step: string) => {
                  // প্রায়োরিটি ১: যদি এটি বর্তমান ওপেন বা আনলকড স্টেপ হয়, তবে completed লিস্টে থাকলেও 'active' (সবুজ পালস) দেখাবে
                  if (currentActiveStepName === step) return 'active';
                  
                  // প্রায়োরিটি ২: যদি বর্তমান স্টেপ না হয়, তবে দেখবে ডাটাবেজে কমপ্লিট হিসেবে মার্ক করা আছে কি না
                  if (activeDraft.completedSteps.includes(step)) return 'completed';

                  // 🎯 NEW FIX: মোবাইলের জন্য ইউজার যদি শিটটি ঘুরে আসে (Soft-complete হয়)
                  if (
                    typeof window !== 'undefined' && 
                    window.innerWidth < 1024 && 
                    mobileViewedSteps.includes(step)
                  ) {
                    return 'completed';
                  }
                  
                  // প্রায়োরিটি ৩: ওপরের কোনোটি না হলে 'pending'
                  return 'pending';
                };

                const fabricStatus = getStatus('fabric');
                const styleStatus = getStatus('style');
                const advStatus = getStatus('advanced');
                const measStatus = getStatus('measurements');

                return (
                  <>
                    {/* Fabric */}
                    <div className={`bg-white p-3 rounded-xl border flex justify-between items-center transition-all ${fabricStatus === 'pending' ? 'border-red-500/20 opacity-70' : 'border-[#D4D7C9]/40'}`}>
                      <span className="font-medium text-[#1C221A]/70 uppercase tracking-wider text-[10px]">Fabric</span>
                      <div className="flex items-center gap-2">
                        {fabricStatus === 'pending' ? (
                          <span className="text-[#C25934] text-[9px] uppercase tracking-widest font-medium bg-[#C25934]/10 px-2 py-0.5 rounded-sm">Pending</span>
                        ) : (
                          <>
                            <span className="text-[#4A5D23] font-medium">{selectedFabric?.name || 'Loading...'}</span>
                            {fabricStatus === 'completed' ? <Check className="w-3.5 h-3.5 text-[#4A5D23]" /> : <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D23] animate-pulse" />}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Basic Styles */}
                    {showStyleSection && (
                      <div className={`bg-white p-3.5 rounded-xl border transition-all ${styleStatus === 'pending' ? 'border-red-500/20 opacity-70' : 'border-[#D4D7C9]/40'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-[#1C221A]/70 uppercase tracking-wider text-[10px]">Configured Styles</span>
                          {styleStatus === 'completed' ? <Check className="w-3.5 h-3.5 text-[#4A5D23]" /> :
                            styleStatus === 'active' ? <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D23] animate-pulse" /> :
                              <span className="text-[#C25934] text-[9px] uppercase tracking-widest font-medium bg-[#C25934]/10 px-2 py-0.5 rounded-sm">Pending</span>}
                        </div>
                        {styleStatus !== 'pending' && (
                          <div className="grid grid-cols-2 gap-2.5">
                            {Object.entries(productStyles)
                              .filter(([k]) => !ADVANCED_TAILORING_OPTIONS[motherCat]?.find(g => g.id === k))
                              .map(([k, v]) => (
                                <div key={k} className="flex flex-col bg-[#F8F9F5] px-3 py-2 rounded-lg border border-[#D4D7C9]/30">
                                  <span className="text-[9px] text-[#1C221A]/50 uppercase tracking-widest mb-0.5">{k.replace(/_/g, ' ')}</span>
                                  <span className="text-[11px] font-medium text-[#17210C] capitalize">{v.replace(/_/g, ' ')}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Advanced Tailoring */}
                    {showAdvancedSection && Object.keys(productStyles).some(k => ADVANCED_TAILORING_OPTIONS[motherCat]?.find(g => g.id === k)) && (
                      <div className={`p-3.5 rounded-xl border transition-all ${advStatus === 'pending' ? 'bg-white border-red-500/20 opacity-70' : 'bg-[#4A5D23]/5 border-[#4A5D23]/20'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-medium uppercase tracking-wider text-[10px] ${advStatus === 'pending' ? 'text-[#1C221A]/70' : 'text-[#4A5D23]'}`}>Advanced Tailoring</span>
                          {advStatus === 'completed' ? <Check className="w-3.5 h-3.5 text-[#4A5D23]" /> :
                            advStatus === 'active' ? <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D23] animate-pulse" /> :
                              <span className="text-[#C25934] text-[9px] uppercase tracking-widest font-medium bg-[#C25934]/10 px-2 py-0.5 rounded-sm">Pending</span>}
                        </div>
                        {advStatus !== 'pending' && (
                          <div className="grid grid-cols-2 gap-2.5">
                            {Object.entries(productStyles)
                              .filter(([k]) => ADVANCED_TAILORING_OPTIONS[motherCat]?.find(g => g.id === k))
                              .map(([k, v]) => {
                                const labelDef = ADVANCED_TAILORING_OPTIONS[motherCat]?.find(g => g.id === k);
                                return (
                                  <div key={k} className="flex flex-col bg-white px-3 py-2 rounded-lg border border-[#4A5D23]/20 shadow-sm">
                                    <span className="text-[9px] text-[#4A5D23]/70 uppercase tracking-widest mb-0.5">{labelDef?.title || k.replace(/_/g, ' ')}</span>
                                    <span className="text-[11px] font-medium text-[#17210C] capitalize">{v.replace(/_/g, ' ')}</span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Measurements */}
                    <div className={`bg-white p-3.5 rounded-xl border transition-all ${measStatus === 'pending' ? 'border-red-500/20 opacity-70' : 'border-[#D4D7C9]/40'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#1C221A]/70 uppercase tracking-wider text-[10px]">{store.orderMode === 'fabric' ? 'Fabric Estimator' : 'Measurements'}</span>
                        {measStatus === 'completed' ? <Check className="w-3.5 h-3.5 text-[#4A5D23]" /> :
                          measStatus === 'active' ? <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D23] animate-pulse" /> :
                            <span className="text-[#C25934] text-[9px] uppercase tracking-widest font-medium bg-[#C25934]/10 px-2 py-0.5 rounded-sm">Pending</span>}
                      </div>
                      {measStatus !== 'pending' && (
                        <div className="mt-3 text-left">
                          <span className={`text-[9px] px-2 py-1 rounded-sm uppercase tracking-widest font-medium ${measurementMode === 'saved' && selectedFitId ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'bg-[#C25934]/10 text-[#C25934]'}`}>
                            {measurementMode === 'saved' && selectedFitId ? 'Profile Linked' : 'Live Draft'}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        </div>
      )}

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
                  // বর্তমান প্রোডাক্টের ড্রাফট ক্লিয়ার করে জিরো-স্টেটে পাঠিয়ে দেবে
                  if (activeProductId) {
                    store.clearDraft(activeProductId);
                  } else {
                    store.resetEntireStore();
                  }
                  setIsResetModalOpen(false);
                  setMobileSequenceIndex(0);
                  setMobileViewedSteps([]);
                  setFurthestStepIndex(0);
                  setZeroStateReason('reset');
                  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                    setExpandedStep(1);
                  }
                }}
                className="flex-1 py-3.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-sans text-[12px] uppercase tracking-widest shadow-md transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Minimal Fabric Alert Modal */}
      {showFabricAlert && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-[#111410]/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowFabricAlert(false)} 
          />
          <div className="relative bg-white w-full max-w-[300px] rounded-2xl p-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-[#C25934]/10 text-[#C25934] rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-[13px] font-bold text-[#17210C] uppercase tracking-wider mb-1.5">
              Fabric Required
            </h3>
            <p className="font-sans text-[11px] text-[#1C221A]/70 mb-5">
              Please select a fabric before proceeding to the next step.
            </p>
            <button
              onClick={() => setShowFabricAlert(false)}
              className="w-full py-2.5 bg-[#17210C] text-white rounded-xl font-sans text-[11px] font-medium uppercase tracking-[0.15em] hover:bg-[#4A5D23] transition-colors cursor-pointer shadow-md"
            >
              Okay, I'll select
            </button>
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
