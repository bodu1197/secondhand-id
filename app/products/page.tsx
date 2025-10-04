"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category_main: string;
  category_sub: string | null;
  location_province: string;
  location_regency: string | null;
  images: string[];
  created_at: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const location = searchParams.get('location') || '';
  const regency = searchParams.get('regency') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (searchQuery) query.set('q', searchQuery);
        if (category) query.set('category', category);
        if (subcategory) query.set('subcategory', subcategory);
        if (location) query.set('location', location);
        if (regency) query.set('regency', regency);

        const response = await fetch(`/api/products?${query.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, category, subcategory, location, regency]);

  return (
    <div className="min-h-screen bg-[#111827] text-gray-200">
      <Header />
      <main className="container mx-auto p-4 pt-16 pb-16">
        <h1 className="text-3xl font-bold text-center mb-8">Hasil Pencarian</h1>
        {searchQuery && <p className="text-center mb-4">Untuk: "{searchQuery}"</p>}

        {loading && <p className="text-center">Memuat produk...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-center">Tidak ada produk yang ditemukan.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <div className="bg-[#1f2937] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full h-48">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={`https://eiqskgzghfehpmlttyju.supabase.co/storage/v1/object/public/product-images/${product.images[0]}`}
                      alt={product.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">Tidak ada gambar</div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-100 truncate">{product.title}</h2>
                  <p className="text-blue-400 font-bold mt-1">Rp {product.price.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm mt-2">{product.location_province}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
