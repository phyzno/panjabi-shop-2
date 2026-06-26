"use client";

import { SizeGuideModal } from './SizeGuideModal';
import { useSizeGuideStore } from '@/store/useSizeGuideStore';

export function GlobalSizeGuide() {
  const { isOpen, closeModal, isGlobal, defaultTab, defaultCategory } = useSizeGuideStore();

  return (
    <SizeGuideModal 
      isOpen={isOpen} 
      onClose={closeModal} 
      isGlobal={isGlobal}
      defaultTab={defaultTab}
      defaultCategory={defaultCategory}
    />
  );
}