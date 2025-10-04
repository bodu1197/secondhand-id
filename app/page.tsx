"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categories, locations } from "../filterData";
import Header from './components/Header';
import Link from 'next/link';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import { Search as SearchIcon } from 'lucide-react';
import CustomSelect from './components/CustomSelect';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Added for mobile search
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchQuery.trim()) {
        query.set("q", searchQuery.trim());
      }
      if (selectedCategory) {
        query.set("category", selectedCategory);
      }
      if (selectedSubcategory) {
        query.set("subcategory", selectedSubcategory);
      }
      if (selectedLocation) {
        query.set("location", selectedLocation);
      }
      if (selectedRegency) {
        query.set("regency", selectedRegency);
      }

      const response = await fetch(`/api/products?${query.toString()}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedLocation, selectedRegency]);




  
    const handleReset = () => {
      setSelectedCategory("");
      setSelectedSubcategory("");
      setSelectedLocation("");
      setSelectedRegency("");
      setSearchQuery(""); // Also clear mobile search query
    };
  return (
    <div className="bg-[#111827] text-gray-200">
      <Header />
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center pt-16">
        {/* Mobile Search Bar */}
        <div className="mb-8 w-full max-w-md md:hidden relative px-6"> {/* Visible only on mobile, added relative for icon positioning */}
          <input
            type="text"
            placeholder="Cari produk..."
            className="w-full p-2 pr-10 rounded-lg border border-gray-700 bg-[#1f2937] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" // Added pr-10 for icon space
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <SearchIcon className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /> {/* Magnifying glass icon */}
        </div>
      <div className="mb-8 w-full max-w-screen-xl mx-auto px-6 md:mt-8 md:flex md:items-center md:justify-between">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
          <div>
            <CustomSelect
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                setSelectedSubcategory("");
              }}
              options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
              placeholder="Pilih Kategori"
              className="w-full"
            />
          </div>
          <div className="hidden md:block">
            <CustomSelect
              value={selectedSubcategory}
              onChange={(value) => setSelectedSubcategory(value)}
              options={selectedCategory && categories
                .find((cat) => cat.name === selectedCategory)
                ?.subcategories.map(subcat => ({ value: subcat, label: subcat })) || []}
              placeholder="Pilih Sub Kategori"
              className="w-full"
              disabled={!selectedCategory}
            />
          </div>
          <div>
            <CustomSelect
              value={selectedLocation}
              onChange={(value) => {
                setSelectedLocation(value);
                setSelectedRegency("");
              }}
              options={Object.keys(locations).map(provinceName => ({ value: provinceName, label: provinceName }))}
              placeholder="Pilih Provinsi"
              className="w-full"
            />
          </div>
          <div className="hidden md:block">
            <CustomSelect
              value={selectedRegency}
              onChange={(value) => setSelectedRegency(value)}
              options={selectedLocation && locations[selectedLocation]?.map(regency => ({ value: regency, label: regency })) || []}
              placeholder="Pilih Kabupaten/Kota"
              className="w-full"
              disabled={!selectedLocation}
            />
          </div>
          <div className="hidden md:flex space-x-2">
            <button
              onClick={handleReset}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="md:hidden mt-4 space-y-4">
          {selectedCategory && (
            <CustomSelect
              value={selectedSubcategory}
              onChange={(value) => setSelectedSubcategory(value)}
              options={selectedCategory && categories
                .find((cat) => cat.name === selectedCategory)
                ?.subcategories.map(subcat => ({ value: subcat, label: subcat })) || []}
              placeholder="Pilih Sub Kategori"
              className="w-full"
              disabled={!selectedCategory}
            />
          )}
          {selectedLocation && (
            <CustomSelect
              value={selectedRegency}
              onChange={(value) => setSelectedRegency(value)}
              options={selectedLocation && locations[selectedLocation]?.map(regency => ({ value: regency, label: regency })) || []}
              placeholder="Pilih Kabupaten/Kota"
              className="w-full"
              disabled={!selectedLocation}
            />
          )}
        </div>
      </div>
      </main>

      <section className="container mx-auto p-4 pb-16">
        {loading ? (
          <p className="text-center">Memuat produk...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <div className="bg-[#1f2937] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative w-full h-48">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`https://eiqskgzghfehpmlttyju.supabase.co/storage/v1/object/public/listings-images/${product.images[0]}`}
                        alt={product.title}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
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
        ) : (
          <p className="text-center">표시할 상품이 없습니다.</p>
        )}
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
