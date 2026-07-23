import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';

export default function ProdukUnggulan() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Featured categories
  const featuredCategories = [
    {
      id: 1,
      name: 'Gantungan Kunci Ukir Kayu',
      subtitle: 'Kerajinan Tangan Halus',
      icon: (
        <svg viewBox="0 0 100 80" className="w-24 h-20">
          <rect x="20" y="10" width="8" height="50" fill="#92400E"/>
          <rect x="35" y="10" width="8" height="50" fill="#92400E"/>
          <rect x="50" y="10" width="8" height="50" fill="#92400E"/>
          <circle cx="75" cy="35" r="15" fill="#FDE68A"/>
          <path d="M 65 30 Q 75 20 85 30" stroke="#92400E" strokeWidth="2" fill="none"/>
          <circle cx="72" cy="33" r="3" fill="#92400E"/>
          <circle cx="78" cy="33" r="3" fill="#92400E"/>
          <path d="M 70 42 Q 75 45 80 42" stroke="#92400E" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 2,
      name: 'Kopi Robusta Khas Banyuwangi',
      subtitle: 'Aroma Kaya & Otentik',
      icon: (
        <svg viewBox="0 0 100 80" className="w-24 h-20">
          <circle cx="30" cy="25" r="12" fill="#78350F"/>
          <circle cx="30" cy="25" r="8" fill="#92400E"/>
          <path d="M 25 15 Q 30 5 35 15" stroke="#10B981" strokeWidth="2" fill="none"/>
          <rect x="55" y="20" width="20" height="25" rx="2" fill="#D97706"/>
          <rect x="58" y="23" width="14" height="15" rx="1" fill="#FDE68A"/>
          <path d="M 62 30 L 68 30 M 62 33 L 68 33" stroke="#92400E" strokeWidth="2"/>
          <ellipse cx="75" cy="50" rx="15" ry="10" fill="#FDE68A"/>
          <path d="M 65 48 Q 75 55 85 48" stroke="#D97706" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 3,
      name: 'Batik Gajah Oling Asli',
      subtitle: 'Motif Ikonik & Tradisional',
      icon: (
        <svg viewBox="0 0 100 80" className="w-24 h-20">
          <rect x="15" y="15" width="40" height="50" rx="2" fill="#92400E"/>
          <path d="M 20 25 L 50 25 M 20 35 L 50 35 M 20 45 L 50 45 M 20 55 L 50 55" stroke="#FDE68A" strokeWidth="2"/>
          <path d="M 25 15 Q 35 30 45 15" stroke="#FDE68A" strokeWidth="2" fill="none"/>
          <rect x="65" y="20" width="20" height="40" rx="2" fill="#0EA5E9"/>
          <path d="M 68 30 L 82 30 M 68 40 L 82 40 M 68 50 L 82 50" stroke="#FFF" strokeWidth="2"/>
          <circle cx="85" cy="45" r="8" fill="#F59E0B"/>
        </svg>
      )
    }
  ];

  useEffect(() => {
    fetchUnggulanProducts();
  }, []);

  const fetchUnggulanProducts = async () => {
    try {
      setLoading(true);
      // Ambil produk unggulan (bisa filter berdasarkan kategori atau rating tinggi)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      
      const mappedData = (data || []).map(item => ({
        ...item,
        img: item.image_url || item.img || ''
      }));
      
      setProducts(mappedData);
    } catch (err) {
      console.error('Error fetching unggulan products:', err);
      // Fallback data
      setProducts([
        { id: 1, name: 'Kopi Robusta Giling Halus', price: 45000, shop: 'Toko: Kopi Cap Merak', rating: 4.9, img: '/produk/kopi1.png' },
        { id: 2, name: 'Batik Gajah Oling Asli', price: 180000, shop: 'Toko: Batik Cap Merak', rating: 4.9, img: '/produk/batik1.jpg' },
        { id: 3, name: 'Gantungan Kunci Ukir Kayu', price: 45000, shop: 'Toko: Kerajinan Lokal', rating: 4.8, img: '/produk/gantungan1.png' },
        { id: 4, name: 'Keripik Singkong Pedas', price: 45000, shop: 'Toko: Keripik Mak Nyak', rating: 4.8, img: '/produk/keripik1.png' },
        { id: 5, name: 'Topeng Gandrung Kayu', price: 45000, shop: 'Toko: Kerajinan Tangan', rating: 4.9, img: '/produk/topeng1.png' },
        { id: 6, name: 'Madu Hutan Banyuwangi', price: 75000, shop: 'Toko: Madu Alami', rating: 4.9, img: '/produk/madu1.png' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ 
        id: product.id,
        name: product.name,
        price: product.price,
        shop: product.shop,
        img: product.img || product.image_url,
        quantity: 1 
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`✅ ${product.name} berhasil ditambahkan ke keranjang!`);
  };

  const handleViewDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const cartCount = JSON.parse(localStorage.getItem('cart') || '[]').reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Memuat produk unggulan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* ===== SIDEBAR NAVIGASI (Sama seperti Landing) ===== */}
      <aside className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-40">
        <div className="flex flex-col items-center py-4 gap-1 mt-11 h-full">
          <div className="w-20 h-px bg-gray-300 my-3"></div>
          <nav className="flex flex-col gap-1 w-full px-2 flex-1">
            {[
              { path: '/', icon: 'fa-house', label: 'Beranda' },
              { path: '/categories', icon: 'fa-folder', label: 'Kategori' },
              { path: '/unggulan', icon: 'fa-star', label: 'Unggulan' },
              { path: '#', icon: 'fa-handshake', label: 'Mitra' },
              { path: '#', icon: 'fa-circle-info', label: 'Tentang' },
              { path: '#', icon: 'fa-envelope', label: 'Kontak' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition ${
                  item.path === '/unggulan' ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                {item.path === '/unggulan' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-blue-600 rounded-r"></div>
                )}
                <i className={`fa-solid ${item.icon} text-xl`}></i>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-1 w-full px-2 mb-4">
            <a href="#" className="flex flex-col items-center gap-1 p-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition">
              <i className="fa-solid fa-circle-question text-xl"></i>
              <span className="text-[10px] font-medium">Bantuan</span>
            </a>
            {user && (
              <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition w-full">
                <i className="fa-solid fa-right-from-bracket text-xl"></i>
                <span className="text-[10px] font-medium">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ===== HEADER ===== */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-blue-900 p-2 rounded-lg">
                <i className="fa-solid fa-mountain-sun text-white text-2xl"></i>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-blue-900">UMKM</h1>
                <p className="text-[10px] text-blue-700 font-semibold">BANYUWANGI</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex gap-4 xl:gap-6 text-sm font-semibold">
              <Link to="/" className="text-gray-600 hover:text-blue-700 transition">Beranda</Link>
              <Link to="/categories" className="text-gray-600 hover:text-blue-700 transition">Kategori Produk</Link>
              <Link to="/unggulan" className="text-blue-700 border-b-2 border-blue-700 pb-0.5">Produk Unggulan</Link>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Mitra UMKM</a>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Tentang Kami</a>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Kontak</a>
            </nav>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden w-full">
                <input 
                  type="text" 
                  placeholder="Cari produk, UMKM, kerajinan..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
                />
                <button className="bg-blue-700 text-white px-4 py-2 hover:bg-blue-800 transition">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => navigate('/cart')} className="relative p-2 text-gray-600 hover:text-blue-700 transition">
                <i className="fa-solid fa-cart-shopping text-lg md:text-xl"></i>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs text-gray-600">{user.email?.split('@')[0]}</span>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1 text-xs">
                  <Link to="/login" className="font-semibold text-gray-600 hover:text-blue-700">Masuk</Link>
                  <span className="text-gray-400">/</span>
                  <Link to="/register" className="font-semibold text-gray-600 hover:text-blue-700">Daftar</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
              <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-3 py-2 bg-transparent outline-none text-sm" />
              <button className="bg-blue-700 text-white px-3 py-2">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO BANNER ===== */}
      <section className="relative bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden">
        <div className="px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              {/* Left: Text Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-amber-700 font-semibold text-sm md:text-base mb-2 uppercase tracking-wide">
                  Temukan Keunggulan Terbaik Banyuwangi
                </p>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  Premium Banyuwanglini
                </h1>
                <p className="text-gray-600 text-sm md:text-base mb-6">
                  Koleksi Produk Pilihan UMKM Terkurasi
                </p>
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 md:py-3 px-6 md:px-8 rounded-full shadow-lg transition transform hover:scale-105 text-sm md:text-base">
                  Belanja Sekarang
                </button>
              </div>
              {/* Right: Illustration */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
                  <div className="relative flex items-center justify-center gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                      <i className="fa-solid fa-mug-hot text-4xl text-amber-600"></i>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                      <i className="fa-solid fa-shirt text-4xl text-blue-600"></i>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                      <i className="fa-solid fa-palette text-4xl text-purple-600"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <main className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              KOLEKSI PRODUK UNGGULAN PREMIUM
            </h2>
            <div className="w-24 h-1 bg-blue-600 rounded"></div>
          </div>

          {/* Featured Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCategories.map((cat) => (
                <div key={cat.id} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer group">
                  <div className="mb-3 transform group-hover:scale-110 transition">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 text-center mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500 text-center">{cat.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                {/* Image */}
                <div className="relative h-40 md:h-48 bg-gray-100 overflow-hidden">
                  {product.img ? (
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <i className="fa-solid fa-image text-3xl"></i>
                    </div>
                  )}
                  {/* Badge Premium */}
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    PREMIUM
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 md:p-4">
                  <h4 className="font-semibold text-gray-800 text-xs md:text-sm mb-1 line-clamp-2 leading-tight">
                    {product.name}
                  </h4>
                  <p className="text-blue-700 font-bold text-sm md:text-base mb-2">
                    Rp {product.price?.toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
                    <i className="fa-solid fa-store text-orange-400"></i>
                    <span className="truncate">{product.shop}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] md:text-xs font-semibold py-2 rounded transition flex items-center justify-center gap-1"
                    >
                      <i className="fa-solid fa-cart-plus"></i> 
                      <span className="hidden sm:inline">Tambah</span>
                    </button>
                    <button 
                      onClick={() => handleViewDetail(product.id)}
                      className="px-3 py-2 border border-gray-300 rounded hover:border-blue-500 hover:text-blue-600 transition text-[10px] md:text-xs font-semibold"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-lg transition">
              Tampilkan Lebih Banyak
            </button>
          </div>

        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-gray-200 mt-12 pt-8 pb-6">
        <div className="px-4 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-6 opacity-60">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
          <p className="text-xs text-gray-500">© 2024 Dinas Koperasi & UMKM Banyuwangi.</p>
        </div>
      </footer>
    </div>
  );
}