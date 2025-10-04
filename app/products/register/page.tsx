"use client";

import { useState } from "react";
import { categories, locations } from "../../../filterData";
import Header from '../../components/Header';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Footer from '../../components/Footer';
import MobileBottomNav from '../../components/MobileBottomNav';
import CustomSelect from '../../components/CustomSelect';
import { UploadCloud } from 'lucide-react';
import Image from "next/image";

export default function RegisterProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length > 5) {
        alert("You can upload a maximum of 5 images.");
        return;
      }
      setImages((prev) => [...prev, ...newImages]);
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Anda harus masuk untuk mendaftar produk.");
      setLoading(false);
      return;
    }

    if (!title || !description || !price || !condition || !selectedCategory || !selectedLocation || images.length === 0) {
      setError("Harap isi semua kolom yang wajib diisi dan unggah setidaknya satu gambar.");
      setLoading(false);
      return;
    }

    try {
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        imageUrls.push(data.path);
      }

      const { error: productError } = await supabase.from('listings').insert({
        user_id: user.id,
        title,
        description,
        price: parseFloat(price),
        condition,
        category: selectedCategory,
        location: selectedLocation,
        images: imageUrls,
      });

      if (productError) throw productError;

      alert("Produk berhasil didaftarkan!");
      router.push("/");
    } catch (err: any) {
      console.error("Error registering product:", err);
      setError(err.message || "Failed to register product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-gray-200">
      <Header />
      <main className="pt-20 pb-24">
        <div className="w-full bg-[#111827] py-8 rounded-lg shadow-lg">
          <div className="max-w-screen-xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Daftar Produk</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-lg text-center">{error}</p>}

            <div>
              <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-2">Nama Produk</label>
              <input
                type="text"
                id="title"
                className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Deskripsi Produk</label>
              <textarea
                id="description"
                rows={5}
                className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="price" className="block text-gray-300 text-sm font-bold mb-2">Harga</label>
              <input
                type="number"
                id="price"
                className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="condition" className="block text-gray-300 text-sm font-bold mb-2">Kondisi Produk</label>
              <CustomSelect
                value={condition}
                onChange={(value) => setCondition(value)}
                options={[
                  { value: "Baru", label: "Baru" },
                  { value: "Hampir Baru", label: "Hampir Baru" },
                  { value: "Bekas", label: "Bekas" },
                  { value: "Ada Cacat", label: "Ada Cacat" },
                ]}
                placeholder="Pilih Kondisi"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-300 text-sm font-bold mb-2">Kategori</label>
              <CustomSelect
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedSubcategory("");
                }}
                options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                placeholder="Kategori Utama"
                required
              />
            </div>
            {selectedCategory && (
              <div>
                <label htmlFor="subcategory" className="block text-gray-300 text-sm font-bold mb-2">Sub Kategori</label>
                <CustomSelect
                  value={selectedSubcategory}
                  onChange={(value) => setSelectedSubcategory(value)}
                  options={categories
                    .find((cat) => cat.name === selectedCategory)
                    ?.subcategories.map(subcat => ({ value: subcat, label: subcat })) || []}
                  placeholder="Sub Kategori"
                />
              </div>
            )}

            <div>
              <label htmlFor="location" className="block text-gray-300 text-sm font-bold mb-2">Wilayah (Provinsi)</label>
              <CustomSelect
                value={selectedLocation}
                onChange={(value) => {
                  setSelectedLocation(value);
                  setSelectedRegency("");
                }}
                options={Object.keys(locations).map(provinceName => ({ value: provinceName, label: provinceName }))}
                placeholder="Pilih Provinsi"
                required
              />
            </div>
            {selectedLocation && (
              <div>
                <label htmlFor="regency" className="block text-gray-300 text-sm font-bold mb-2">Wilayah (Kabupaten/Kota)</label>
                <CustomSelect
                  value={selectedRegency}
                  onChange={(value) => setSelectedRegency(value)}
                  options={locations[selectedLocation]?.map(regency => ({ value: regency, label: regency })) || []}
                  placeholder="Pilih Kabupaten/Kota"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">Gambar Produk (maks. 5)</label>
              <div className="mt-2 flex justify-center items-center w-full">
                  <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Klik untuk mengunggah</span> 또는 드래그 앤 드롭</p>
                          <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 5 images)</p>
                      </div>
                      <input id="images" type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                  </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 border-2 border-gray-600 rounded-lg overflow-hidden">
                    <Image src={preview} alt={`Product preview ${index + 1}`} fill style={{objectFit: "cover"}} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-500"
              disabled={loading}
            >
              {loading ? "Mendaftar..." : "Daftar Produk"}
            </button>
                      </form>
                    </div>
                  </div>
                </main>      <Footer />
      <MobileBottomNav />
    </div>
  );
}