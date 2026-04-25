import { ProductCard } from '@/components/shop/ProductCard';

export default function ShopPage() {
  const products = [
    { id: '1', name: 'Premium Navy Panjabi', category: 'premium', price: 1200, imageUrl: '/assets/punjabi/1-1.webp', isStitched: true },
    { id: '2', name: 'Royal Blue Embroidered', category: 'premium', price: 1500, imageUrl: '/assets/punjabi/Blue-1-1.webp', isStitched: true },
    { id: '3', name: 'Maroon Wedding Panjabi', category: 'wedding', price: 2500, imageUrl: '/assets/punjabi/Merun-KC-2.webp', isStitched: true },
    { id: '4', name: 'Off White Summer', category: 'casual', price: 900, imageUrl: '/assets/punjabi/Off-White-1.webp', isStitched: true },
    { id: '5', name: 'Classic Casual Panjabi', category: 'casual', price: 800, imageUrl: '/assets/punjabi/1-2.webp', isStitched: true },
    { id: '6', name: 'Premium Ash Panjabi', category: 'premium', price: 1300, imageUrl: '/assets/punjabi/1-29.webp', isStitched: true },
    { id: '7', name: 'Golden Wedding Special', category: 'wedding', price: 2800, imageUrl: '/assets/punjabi/3-8.webp', isStitched: true },
    { id: '8', name: 'Dark Green Premium', category: 'premium', price: 1400, imageUrl: '/assets/punjabi/4-11.webp', isStitched: true },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filter Sidebar (Desktop) */}
        <div className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 border-b pb-2">Category</h3>
            <ul className="space-y-2">
              {['All', 'Casual', 'Premium', 'Wedding', 'Regular', 'Narrow Fit'].map(cat => (
                <li key={cat}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-gray-600">{cat}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 border-b pb-2">Price Range</h3>
            <input type="range" min="500" max="5000" className="w-full accent-primary" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>৳500</span>
              <span>৳5000</span>
            </div>
          </div>
          <button className="text-sm text-primary underline underline-offset-4 font-medium">
            Clear All Filters
          </button>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-heading text-3xl font-bold">Shop Collection</h1>
            <select className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary">
              <option>Sort: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
