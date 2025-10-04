"use client";

import { useState } from "react";
import { categories, locations } from "../../../filterData";
import Header from '../../components/Header';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Footer from '../../components/Footer';
import MobileBottomNav from '../../components/MobileBottomNav';
import CustomSelect from '../../components/CustomSelect';

export default function RegisterProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [contactInfo, setContactInfo] = useState("");
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

      const { error: productError } = await supabase.from('products').insert({
        user_id: user.id,
        title,
        description,
        price: parseFloat(price),
        condition,
        category_main: selectedCategory,
        category_sub: selectedSubcategory || null,
        location_province: selectedLocation,
        location_regency: selectedRegency || null,
        contact_info: contactInfo || null,
        images: imageUrls,
      });

      if (productError) throw productError;

      alert("Produk berhasil didaftarkan!");
      router.push("/"); // Redirect to home or product list page
    } catch (err: any) {
      console.error("Error registering product:", err);
      setError(err.message || "Failed to register product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4 pt-16">
        <h1 className="text-3xl font-bold text-center mb-8">Daftar Produk</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Nama Produk</label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Deskripsi Produk</label>
            <textarea
              id="description"
              rows={5}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Harga</label>
            <input
              type="number"
              id="price"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="condition" className="block text-gray-700 text-sm font-bold mb-2">Kondisi Produk</label>
            <CustomSelect
              value={condition}
              onChange={(value) => setCondition(value)}
              options={[
                { value: "Baru", label: "Baru" },
                { value: "Hampir Baru", label: "Hampir Baru" },
                { value: "Bekas", label: "Bekas" },
                { value: "Ada Cacat", label: "Ada Cacat" },
              ]}
              placeholder="Pilih"
              required
            />
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Kategori</label>
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
              <div className="w-full sm:w-1/2">
                <label htmlFor="subcategory" className="block text-gray-700 text-sm font-bold mb-2">Sub Kategori</label>
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
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Wilayah Transaksi (Provinsi)</label>
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
              <div className="w-full sm:w-1/2">
                <label htmlFor="regency" className="block text-gray-700 text-sm font-bold mb-2">Wilayah Transaksi (Kabupaten/Kota)</label>
                <CustomSelect
                  value={selectedRegency}
                  onChange={(value) => setSelectedRegency(value)}
                  options={locations[selectedLocation]?.map(regency => ({ value: regency, label: regency })) || []}
                  placeholder="Pilih Kabupaten/Kota"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="contactInfo" className="block text-gray-700 text-sm font-bold mb-2">Nomor WhatsApp (Opsional)</label>
            <input
              type="text"
              id="contactInfo"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Masukkan nomor WhatsApp Anda"
              pattern="^\+?[0-9\s\-]{7,20}$" // Basic pattern for phone numbers
              title="Contoh: +62 812-3456-7890" // Example format
            />
            <p className="text-gray-500 text-xs mt-1">Contoh: +62 812-3456-7890</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Gambar Produk (maks. 5)</label>
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden" // Hide the native file input
            />
            <label htmlFor="images" className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
              <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 10V3L4 10H7L2 17H18L13 10Z"/></svg>
              <span>Pilih File</span>
            </label>
            <span className="ml-3 text-gray-600 text-sm">
              {images.length > 0 ? `${images.length} file(s) dipilih` : "Tidak ada file yang dipilih"}
            </span>
            <div className="mt-4 flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
                  <img src={preview} alt={`Product preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? "Mendaftar..." : "Daftar Produk"}
          </button>
        </form>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
