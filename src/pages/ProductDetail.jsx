import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Pastikan path ini sesuai dengan struktur folder Anda

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // 1. Ambil detail produk berdasarkan ID dari database
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('❌ Error fetching product:', error);
        } else {
          setProduct(data);

          // 2. Ambil produk terkait (produk lain selain yang sedang dilihat, maksimal 4)
          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .neq('id', id)
            .limit(4);
            
          if (relatedData) {
            setRelatedProducts(relatedData);
          }
        }
      } catch (err) {
        console.error('❌ Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Tambah ke keranjang
  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Berhasil menambahkan ${product.name} ke keranjang!`);
    navigate('/cart');
  };

  // Tampilan saat loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  // Tampilan jika produk tidak ditemukan
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-exclamation text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600 mb-4">Produk tidak ditemukan.</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:ml-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-900 p-2 rounded-lg">
                <i className="fa-solid fa-mountain-sun text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-blue-900">UMKM</h1>
                <p className="text-[10px] text-blue-700 font-semibold">BANYUWANGI</p>
              </div>
            </Link>
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-blue-700">
              <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Gambar Produk */}
            <div className="lg:w-1/2 bg-gray-100 p-8">
              <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
                {(product.image_url || product.img) ? (
                  <img 
                    src={product.image_url || product.img} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500/e2e8f0/475569?text=Gambar+Tidak+Tersedia'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <i className="fa-solid fa-image text-8xl"></i>
                  </div>
                )}
              </div>
            </div>

            {/* Info Produk */}
            <div className="lg:w-1/2 p-8">
              <div className="mb-2">
                <span className="text-xs text-gray-500">{product.shop || 'Toko Lokal'}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating || 4.5) ? '' : 'fa-star-half-alt'}`}></i>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{product.rating || '4.5'} (Ulasan)</span>
              </div>

              <div className="text-3xl font-bold text-blue-700 mb-6">
                Rp {(product.price || 0).toLocaleString('id-ID')}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Deskripsi Produk</h3>
                <p className="text-gray-600 leading-relaxed">{product.description || 'Tidak ada deskripsi tersedia.'}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Stok Tersedia</h3>
                <p className={`${(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                  <i className={`fa-solid ${(product.stock || 0) > 0 ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                  {(product.stock || 0) > 0 ? `${product.stock} unit tersedia` : 'Stok Habis'}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Jumlah</h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50"
                    disabled={(product.stock || 0) <= 0}
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="w-16 text-center text-xl font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50"
                    disabled={(product.stock || 0) <= 0 || quantity >= (product.stock || 0)}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* Total Harga */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Harga</span>
                  <span className="text-2xl font-bold text-blue-700">
                    Rp {((product.price || 0) * quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={(product.stock || 0) <= 0}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 ${
                    (product.stock || 0) <= 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <i className="fa-solid fa-cart-plus text-xl"></i>
                  <span>{(product.stock || 0) <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <i className="fa-solid fa-truck text-2xl text-blue-600 mb-2"></i>
                    <p className="text-xs text-gray-600">Gratis Ongkir</p>
                  </div>
                  <div>
                    <i className="fa-solid fa-shield-halved text-2xl text-blue-600 mb-2"></i>
                    <p className="text-xs text-gray-600">Garansi Asli</p>
                  </div>
                  <div>
                    <i className="fa-solid fa-rotate-left text-2xl text-blue-600 mb-2"></i>
                    <p className="text-xs text-gray-600">7 Hari Retur</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produk Terkait */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Produk Terkait</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.id} 
                  onClick={() => {
                    setQuantity(1); // Reset quantity saat pindah produk
                    navigate(`/product/${relatedProduct.id}`);
                    window.scrollTo(0, 0); // Scroll ke atas halaman
                  }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer"
                >
                  <div className="h-32 bg-gray-100">
                    {(relatedProduct.image_url || relatedProduct.img) ? (
                      <img 
                        src={relatedProduct.image_url || relatedProduct.img} 
                        alt={relatedProduct.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300/e2e8f0/475569?text=Gambar'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className="fa-solid fa-image text-2xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-gray-800 text-xs mb-1 line-clamp-2">{relatedProduct.name}</h4>
                    <p className="text-blue-700 font-bold text-sm">Rp {(relatedProduct.price || 0).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}