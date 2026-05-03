'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  image_urls: string[] | null;
}

interface ShopContentProps {
  initialProducts: Product[];
  categories: string[];
}

export function ShopContent({ initialProducts, categories }: ShopContentProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filter products locally for better UX, or could fetch from server
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search filter
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Price filter (Postgres decimals may arrive as strings)
    result = result.filter((p) => {
      const price = Number(p.base_price);
      if (!Number.isFinite(price)) return true;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price-high':
        result.sort((a, b) => b.base_price - a.base_price);
        break;
      case 'newest':
        // Assuming ID or something implies order for now if created_at not available
        result.reverse(); 
        break;
      default:
        // Featured - original order
        break;
    }

    return result;
  }, [initialProducts, searchQuery, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSortBy('featured');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Mobile Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input 
            placeholder="Search products..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <Button 
            variant="outline" 
            className="md:hidden flex items-center gap-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'featured')}>
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`
          fixed inset-0 z-50 bg-white p-6 md:relative md:inset-auto md:bg-transparent md:p-0 md:w-64 md:block shrink-0
          ${isSidebarOpen ? 'block' : 'hidden'}
        `}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="size-6" />
            </Button>
          </div>

          <div className="space-y-8 sticky top-24">
            {/* Category Filter */}
            <div>
              <h3 className="font-heading text-lg font-bold mb-4 border-b pb-2">Category</h3>
              <div className="flex flex-col gap-3">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center gap-2">
                    <Checkbox 
                      id={`cat-${cat}`} 
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <Label 
                      htmlFor={`cat-${cat}`}
                      className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="font-heading text-lg font-bold">Price Range</h3>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                  ৳{priceRange[0]} - ৳{priceRange[1]}
                </span>
              </div>
              <div className="px-2 pt-4">
                <Slider
                  defaultValue={[0, 10000]}
                  max={10000}
                  step={100}
                  value={priceRange}
                  onValueChange={(val) => setPriceRange(Array.isArray(val) ? [...val] : [val])}
                  className="mb-6"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>৳0</span>
                  <span>৳10,000+</span>
                </div>
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-primary hover:text-primary hover:bg-primary/5 font-bold"
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.base_price}
                  imageUrl={product.image_urls?.[0]}
                  isStitched={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="size-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
