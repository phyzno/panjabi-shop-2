"use client";

import { SizeGuideModal } from './SizeGuideModal';
import { useSizeGuideStore } from '@/store/useSizeGuideStore';

export function GlobalSizeGuide() {
  const { isOpen, closeModal } = useSizeGuideStore();

  return <SizeGuideModal isOpen={isOpen} onClose={closeModal} />;
}