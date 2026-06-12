import { getProductById } from "@/lib/actions/product.actions";
import { getCategoryTree } from "@/lib/actions/category.actions";
import ProductForm from "@/components/admin/product/ProductForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Edit Product',
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: product } = await getProductById(id);
  const { data: categories } = await getCategoryTree();

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-2">
        <Link href="/admin/products" className="text-sm font-sans text-muted-foreground hover:text-primary transition-colors">
          &larr; Back to Products
        </Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Edit Product: {product.name}</h1>
      </div>

      <ProductForm 
        categories={categories || []} 
        initialData={product} 
        isEditMode={true}
      />
    </div>
  );
}
