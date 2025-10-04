import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import Header from '../../components/Header';
import Link from 'next/link';
import Footer from '../../components/Footer';
import MobileBottomNav from '../../components/MobileBottomNav';
import { getImageUrl } from '../../../utils/getImageUrl';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: product, error: productError } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      description,
      price,
      condition,
      category,
      location,
      images,
      latitude,
      longitude,
      user_id
    `)
    .eq('id', id)
    .single();

  if (productError || !product) {
    console.error("Error fetching product:", productError, JSON.stringify(productError));
    return <div className="min-h-screen flex items-center justify-center">Produk tidak ditemukan.</div>;
  }

  // Fetch seller nickname separately
  const { data: sellerProfile, error: sellerProfileError } = await supabase
    .from('users')
    .select('name')
    .eq('id', product.user_id)
    .single();

  const sellerNickname = sellerProfile?.name || "Unknown Seller";

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4 pt-16">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          {/* Image Carousel */}
          <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-6">
            {product.images && product.images.length > 0 ? (
              <Image
                src={getImageUrl(product.images[0])}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">Tidak ada gambar</div>
            )}
            {/* Add more images/carousel logic here if needed */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600 mb-2"><strong>Harga:</strong> {product.price.toLocaleString()}원</p>
              <p className="text-gray-600 mb-2"><strong>Kondisi:</strong> {product.condition}</p>
              <p className="text-gray-600 mb-2"><strong>Kategori:</strong> {product.category_main} {product.category_sub ? `> ${product.category_sub}` : ''}</p>
              <p className="text-gray-600 mb-2"><strong>Lokasi Transaksi:</strong> {product.location_province} {product.location_regency}</p>
              {product.contact_info && <p className="text-gray-600 mb-2"><strong>Kontak:</strong> {product.contact_info}</p>}
            </div>
            <div>
              <p className="text-gray-600 mb-2"><strong>Penjual:</strong> {sellerNickname}</p>
              {/* Seller rating can be added here */}
              <div className="flex gap-2 mt-4">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Chat/Tanya
                </button>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
                  Tambahkan ke Favorit
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Deskripsi Produk</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
