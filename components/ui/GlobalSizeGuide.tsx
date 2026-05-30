"use client";

import { SizeGuideModal } from './SizeGuideModal';
import { useSizeGuideStore } from '@/store/useSizeGuideStore';

export function GlobalSizeGuide() {
  // এখানে আমরা স্টোর থেকে ভ্যালুগুলো নিচ্ছি
  const { isOpen, closeModal } = useSizeGuideStore();

  return <SizeGuideModal isOpen={isOpen} onClose={closeModal} />;
}