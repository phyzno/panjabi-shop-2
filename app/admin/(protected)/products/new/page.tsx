import { getCategoryTree } from "@/lib/actions/category.actions";
import ProductForm from "@/components/admin/product/ProductForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Add Product',
};

export default async function AddProductPage() {
  const { data: categories } = await getCategoryTree();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-2">
        <Link href="/admin/products" className="text-sm font-sans text-muted-foreground hover:text-primary transition-colors">
          &larr; Back to Products
        </Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Add New Product</h1>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  );
}
