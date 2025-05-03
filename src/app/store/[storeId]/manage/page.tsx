
"use client";

import {useState, useEffect} from 'react';
import {NewStoreForm} from "@/components/NewStoreForm";
import {Button} from "@/components/ui/button";
import {ProductForm} from "@/components/ProductForm";
import { useParams } from 'next/navigation';
import {StoreCategory} from "@/services/store";

interface RouteParams {
  storeId: string;
}

export default function StoreManagePage() {
  const [userProducts, setUserProducts] = useState<string[]>([]);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const params = useParams<RouteParams>();

  // In a real app, you'd get the storeId from the route
  const storeId = params.storeId || "default_store_id"; // Hardcoded for demonstration
  const storeCategory: StoreCategory = 'other';

  const handleProductCreated = (productName: string) => {
    setUserProducts([...userProducts, productName]);
    setShowNewProductForm(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Your Products</h1>

      <Button onClick={() => setShowNewProductForm(true)} className="mb-4">
        Create New Product
      </Button>

      {showNewProductForm && (
        <div className="mb-6">
          <ProductForm onProductCreated={handleProductCreated} storeId={storeId} storeCategory={storeCategory} />
        </div>
      )}

      {userProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Products:</h2>
          <ul>
            {userProducts.map((productName, index) => (
              <li key={index}>{productName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
