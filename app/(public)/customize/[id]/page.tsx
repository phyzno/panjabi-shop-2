"use client";

import { useState, use } from 'react';
import { PanjabiCanvas } from '@/components/customizer/PanjabiCanvas';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

const fabrics = [
  { id: 'plain', name: 'Premium Cotton', type: 'plain', price: 180 },
  { id: 'linen', name: 'Linen Blend', type: 'linen', price: 220 },
  { id: 'silk', name: 'Silk Blend', type: 'silk', price: 350 },
  { id: 'check', name: 'Cotton Check', type: 'check', price: 200 },
  { id: 'stripe', name: 'Striped Cotton', type: 'stripe', price: 190 },
  { id: 'embroidery', name: 'Embroidered Muslin', type: 'embroidery', price: 420 },
];

const colors = [
  { id: 'royalblue', hex: '#1B3A6B', name: 'Royal Blue' },
  { id: 'burgundy', hex: '#6B1E2E', name: 'Burgundy' },
  { id: 'forest', hex: '#1A5C3A', name: 'Forest Green' },
  { id: 'brown', hex: '#3D2B1F', name: 'Dark Brown' },
  { id: 'purple', hex: '#4A3060', name: 'Deep Purple' },
  { id: 'midnight', hex: '#1A1A1A', name: 'Midnight' },
  { id: 'mustard', hex: '#8B6914', name: 'Mustard' },
  { id: 'teal', hex: '#2C5F6E', name: 'Teal' },
  { id: 'gold', hex: '#C9A84C', name: 'Gold' },
  { id: 'crimson', hex: '#8B2222', name: 'Crimson' },
  { id: 'slate', hex: '#4A5568', name: 'Slate Gray' },
  { id: 'maroon', hex: '#800000', name: 'Maroon' },
  { id: 'olive', hex: '#556B2F', name: 'Olive' },
  { id: 'navy', hex: '#001F5B', name: 'Navy' },
  { id: 'offwhite', hex: '#F5F0E8', name: 'Off White' },
];

const standardSizes = ['S', 'M', 'L', 'XL'];

export default function CustomizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedFabric, setSelectedFabric] = useState(fabrics[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [collarStyle, setCollarStyle] = useState('Band Collar');
  const [sizeType, setSizeType] = useState<'standard'|'custom'>('standard');
  const [standardSize, setStandardSize] = useState('M');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState('');

  const fabricYards = 2.5;
  const fabricPrice = fabricYards * selectedFabric.price;
  const stitchingCharge = 450;
  const total = fabricPrice + stitchingCharge;

  const handleAddToCart = () => {
    addItem({
      productId: id,
      productName: 'Custom Panjabi',
      color: selectedColor.hex,
      colorName: selectedColor.name,
      fabricType: selectedFabric.type,
      fabricName: selectedFabric.name,
      collarStyle,
      sleeveStyle: 'Full Sleeve',
      buttonStyle: '5 Buttons',
      pocketStyle: 'No Pocket',
      lengthStyle: 'Regular',
      sizeType,
      standardSize: sizeType === 'standard' ? standardSize : undefined,
      specialInstructions,
      fabricPrice,
      stitchingCharge,
      total,
      previewDataUrl,
    });
    router.push('/cart');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* LEFT PANEL: Canvas */}
        <div className="w-full lg:w-[55%] relative">
          <div className="sticky top-24">
            <PanjabiCanvas 
              color={selectedColor.hex} 
              fabricType={selectedFabric.type} 
              collarStyle={collarStyle}
              onRenderComplete={setPreviewDataUrl}
            />
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full border border-gray-200">
                {selectedColor.name}
              </span>
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full border border-gray-200">
                {selectedFabric.name}
              </span>
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full border border-gray-200">
                {collarStyle}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Options */}
        <div className="w-full lg:w-[45%] flex flex-col space-y-12 pb-24">
          
          {/* Section 1: Fabric */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span>
              Fabric Type
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {fabrics.map(fabric => (
                <button
                  key={fabric.id}
                  onClick={() => setSelectedFabric(fabric)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    selectedFabric.id === fabric.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-white'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-3 overflow-hidden relative">
                    {/* Simplified mock pattern visualizer instead of real canvas for thumbnails */}
                    <div className="absolute inset-0 opacity-20" style={{backgroundColor: selectedColor.hex}}></div>
                    {fabric.type === 'check' && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,#000_49%,#000_51%,transparent_51%)] bg-[length:10px_10px]"></div>}
                    {fabric.type === 'stripe' && <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_49%,#000_49%,#000_51%,transparent_51%)] bg-[length:10px_10px]"></div>}
                  </div>
                  <span className="text-sm font-medium text-center">{fabric.name}</span>
                  {selectedFabric.id === fabric.id && <Check size={16} className="text-primary mt-1" />}
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: Color */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">2</span>
              Color
            </h2>
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c)}
                  className={`w-10 h-10 rounded-full transition-all group relative ${
                    selectedColor.id === c.id ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105 border border-gray-200 shadow-sm'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor.id === c.id && c.hex === '#F5F0E8' && <Check size={16} className="absolute inset-0 m-auto text-gray-800" />}
                  {selectedColor.id === c.id && c.hex !== '#F5F0E8' && <Check size={16} className="absolute inset-0 m-auto text-white" />}
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Design */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">3</span>
              Design Options
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Collar Style</h3>
                <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
                  {['Band Collar', 'V-Neck', 'Round Neck', 'Mandarin'].map(style => (
                    <button
                      key={style}
                      onClick={() => setCollarStyle(style)}
                      className={`shrink-0 snap-start px-4 py-2 rounded-lg border-2 whitespace-nowrap font-medium text-sm transition-colors ${
                        collarStyle === style ? 'border-primary bg-primary/5 text-primary' : 'border-border text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Size */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">4</span>
              Size
            </h2>
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button 
                onClick={() => setSizeType('standard')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${sizeType === 'standard' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                Standard Size
              </button>
              <button 
                onClick={() => setSizeType('custom')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${sizeType === 'custom' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                Custom Measurements
              </button>
            </div>
            
            {sizeType === 'standard' ? (
              <div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {standardSizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setStandardSize(sz)}
                      className={`py-4 rounded-xl font-bold text-lg border-2 transition-all ${
                        standardSize === sz ? 'border-primary bg-primary text-white' : 'border-border bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                <button className="text-primary text-sm font-medium underline underline-offset-4">
                  View Size Chart
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl border border-border">
                <p className="text-gray-500 text-sm mb-4">Enter your custom measurements in cm.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Chest / বুকের মাপ</label>
                    <input type="number" placeholder="e.g. 100" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Shoulder / কাঁধ</label>
                    <input type="number" placeholder="e.g. 45" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Sleeve / হাতা</label>
                    <input type="number" placeholder="e.g. 62" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Length / দৈর্ঘ্য</label>
                    <input type="number" placeholder="e.g. 105" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 5: Notes */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">5</span>
              Special Instructions
            </h2>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="Any special request for the tailor..."
              className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none h-32"
              maxLength={300}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{specialInstructions.length}/300</div>
          </section>

        </div>
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 p-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full flex items-center justify-between md:justify-start md:gap-12">
            <div>
              <p className="text-gray-500 text-sm">Total Price</p>
              <p className="font-heading text-3xl font-bold text-primary">৳{total}</p>
            </div>
            <div className="hidden sm:block text-sm bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-lg">
              Advance required: <span className="font-bold">৳{Math.round(total * 0.3)} (30%)</span>
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] hover:from-[#b5953e] hover:to-[#aa8d3e] text-[#1A1A1A] font-bold text-lg px-12 py-4 rounded-xl shadow-lg transform transition-all active:scale-95"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
