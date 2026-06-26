'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Ruler, X, Info, InfoIcon } from 'lucide-react';

const presetSizeChart = [
  { size: 'S', chest: '36-37 in', shoulder: '14.5 in', sleeve: '24 in', length: '42 in' },
  { size: 'M', chest: '38-39 in', shoulder: '15 in', sleeve: '24.5 in', length: '43 in' },
  { size: 'L', chest: '40-41 in', shoulder: '15.5 in', sleeve: '25 in', length: '44 in' },
  { size: 'XL', chest: '42-43 in', shoulder: '16 in', sleeve: '25.5 in', length: '45 in' },
  { size: 'XXL', chest: '44-45 in', shoulder: '16.5 in', sleeve: '26 in', length: '46 in' },
] as const;

const numericSizeChart = [
  { size: '38', chest: '36-37 in', shoulder: '14.5 in', sleeve: '24 in', length: '42 in' },
  { size: '40', chest: '38-39 in', shoulder: '15 in', sleeve: '24.5 in', length: '43 in' },
  { size: '42', chest: '40-41 in', shoulder: '15.5 in', sleeve: '25 in', length: '44 in' },
  { size: '44', chest: '42-43 in', shoulder: '16 in', sleeve: '25.5 in', length: '45 in' },
  { size: '46', chest: '44-45 in', shoulder: '16.5 in', sleeve: '26 in', length: '46 in' },
] as const;

type SizeMode = 'preset' | 'number';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [sizeMode, setSizeMode] = useState<SizeMode>('preset');

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      setSizeMode('preset');
      return;
    }
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeChart = sizeMode === 'preset' ? presetSizeChart : numericSizeChart;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-[#111410]/60 backdrop-blur-sm p-0 sm:items-center sm:p-6 transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] border border-[#D4D7C9]/50 bg-[#FEFDF8] shadow-[0_32px_80px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-500 sm:animate-in sm:zoom-in-95 sm:slide-in-from-bottom-0">
        
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-[#D4D7C9] rounded-full opacity-50" />
        </div>

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D4D7C9]/40 bg-[#FEFDF8]/80 backdrop-blur-md px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-[#4A5D23]/5 text-[#4A5D23]">
              <Ruler className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-[#17210C] sm:text-2xl">
                Size Guide
              </h2>
              <p className="font-sans text-sm font-normal tracking-wide text-[#1C221A]/60">
                Find your perfect signature fit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9F5] text-[#1C221A]/50 transition-all hover:bg-[#4A5D23] hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#4A5D23]">
                  <InfoIcon className="h-4 w-4" />
                  <span className="font-sans text-[11px] font-normal uppercase tracking-[0.2em]">Standard Panjabi Dimensions</span>
                </div>
                
                <div className="inline-flex rounded-full bg-[#EBECE3] p-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSizeMode('preset')}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer ${
                      sizeMode === 'preset'
                        ? 'bg-white text-[#4A5D23] shadow-sm'
                        : 'text-[#1C221A]/70 hover:text-[#1C221A]'
                    }`}
                  >
                    Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeMode('number')}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer ${
                      sizeMode === 'number'
                        ? 'bg-white text-[#4A5D23] shadow-sm'
                        : 'text-[#1C221A]/70 hover:text-[#1C221A]'
                    }`}
                  >
                    Number
                  </button>
                </div>
              </div>
              
              <div className="grid gap-3 sm:hidden">
                {activeChart.map((row) => (
                  <div key={row.size} className="rounded-2xl border border-[#D4D7C9]/40 bg-white p-4 shadow-sm transition-all hover:border-[#4A5D23]/30">
                    <div className="mb-3 flex items-center justify-between border-b border-[#D4D7C9]/20 pb-3">
                      <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#17210C]/60">Size</span>
                      <span className="text-xl text-[#4A5D23]">{row.size}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <p className="font-sans text-[10px] uppercase tracking-wider text-[#1C221A]/50">Chest</p>
                        <p className="font-sans text-[14px] font-medium text-[#1C221A]">{row.chest}</p>
                      </div>
                      <div>
                        <p className="font-sans text-[10px] uppercase tracking-wider text-[#1C221A]/50">Shoulder</p>
                        <p className="font-sans text-[14px] font-medium text-[#1C221A]">{row.shoulder}</p>
                      </div>
                      <div>
                        <p className="font-sans text-[10px] uppercase tracking-wider text-[#1C221A]/50">Sleeve</p>
                        <p className="font-sans text-[14px] font-medium text-[#1C221A]">{row.sleeve}</p>
                      </div>
                      <div>
                        <p className="font-sans text-[10px] uppercase tracking-wider text-[#1C221A]/50">Length</p>
                        <p className="font-sans text-[14px] font-medium text-[#1C221A]">{row.length}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-hidden rounded-2xl border border-[#D4D7C9]/40 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse transition-all duration-300">
                    <thead>
                      <tr className="bg-[#F8F9F5] font-sans text-[12px] uppercase tracking-[0.15em] text-[#17210C]/60">
                        <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">Size</th>
                        <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">Chest</th>
                        <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">Shoulder</th>
                        <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">Sleeve</th>
                        <th className="px-5 py-4 border-b border-[#D4D7C9]/30 text-right font-medium">Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4D7C9]/20">
                      {activeChart.map((row) => (
                        <tr key={row.size} className="font-sans text-[15px] font-normal text-[#1C221A] hover:bg-[#F8F9F5]/50 transition-colors">
                          <td className="px-5 py-4 text-[#4A5D23] font-medium">{row.size}</td>
                          <td className="px-5 py-4">{row.chest}</td>
                          <td className="px-5 py-4">{row.shoulder}</td>
                          <td className="px-5 py-4">{row.sleeve}</td>
                          <td className="px-5 py-4 text-right">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#F8F9F5]/80 p-4 rounded-xl flex gap-3 items-start">
                <Info className="h-5 w-5 text-[#4A5D23] shrink-0 mt-0.5" />
                <p className="font-sans text-[13.5px] font-normal leading-relaxed text-[#1C221A]/70">
                  <span className="text-[#4A5D23]">Pro Tip:</span> For a more relaxed feel, we recommend selecting one size up from your actual body chest measurement.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <section className="space-y-4">
                <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#17210C]">How to Measure</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape level.' },
                    { label: 'Shoulder', desc: 'Measure from the edge of one shoulder across the back to the other.' },
                    { label: 'Sleeve', desc: 'Measure from the shoulder tip down to your wrist.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="font-heading text-xs text-[#4A5D23] bg-[#4A5D23]/5 h-6 w-6 flex items-center justify-center rounded-full shrink-0 mt-1">{i + 1}</span>
                      <div className="space-y-1">
                        <p className="font-heading text-[13px] font-bold text-[#17210C] uppercase tracking-tight">{item.label}</p>
                        <p className="font-sans text-[14px] font-normal text-[#1C221A]/60 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="rounded-[24px] bg-[#111410] p-6 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Ruler className="h-20 w-20" />
                </div>
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider mb-2">Bespoke Fit?</h3>
                <p className="font-sans text-[14.5px] font-normal text-white/70 mb-6 leading-relaxed">
                  Can&apos;t find your size? Our master tailors can craft a panjabi to your exact body measurements.
                </p>
                <Link
                  href="/dashboard/measurements"
                  onClick={onClose}
                  className="inline-flex items-center gap-3 rounded-full bg-[#4A5D23] px-6 py-3 font-sans text-xs font-normal uppercase tracking-[0.2em] text-white transition-all hover:bg-[#5a722b] hover:gap-5"
                >
                  Create Custom Profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-[#F8F9F5] px-8 py-4 text-center border-t border-[#D4D7C9]/30">
          <p className="font-sans text-[11px] font-normal uppercase tracking-[0.25em] text-[#1C221A]/40">
            © {new Date().getFullYear()} Punjabi Shop • Excellence in Tailoring
          </p>
        </div>
      </div>
    </div>
  );
}

export default SizeGuideModal;