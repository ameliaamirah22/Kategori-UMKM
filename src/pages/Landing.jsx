import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';

export default function Landing() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const productsRef = useRef(null);
  const BUCKET_NAME = 'product-images';

  const [categories, setCategories] = useState([
    { id: 1, name: 'Makanan & Minuman', img: '/images/makanan-minuman.png' },
    { id: 2, name: 'Kerajinan Tangan Batik, Tenun', img: '/images/kerajinan-tangan.png' },
    { id: 3, name: 'Fashion Batik, Tenun', img: '/images/fashion.png' },
    { id: 4, name: 'Pertanian & Perikanan', img: '/images/pertanian.png' },
    { id: 5, name: 'Lainnya', img: '/images/lainnya.png' },
  ]);

  const getStock = (product) => {
    const s = Number(product?.stock);
    return Number.isFinite(s) ? s : 0;
  };
  const getStockStatus = (product) => {
    const stock = getStock(product);
    if (stock === 0) return 'out';
    if (stock <= 20) return 'limited';
    return 'available';
  };
  const getPrice = (product) => Number(product?.price) || 0;
  const getRating = (product) => Number(product?.rating) || 4.0;
  const normalize = (str) => (str || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();

  const [expandedSections, setExpandedSections] = useState({
    kategori: true, harga: true, rating: true, stok: true, toko: false,
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
    fetchProducts();
    fetchCategories();
  }, []);

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleFilterChange = (filterName) => {
    setActiveFilters(prev => prev.includes(filterName) ? prev.filter(f => f !== filterName) : [...prev, filterName]);
  };

  const mockProducts = [
    { id: 1, name: 'Kopi Osing Robusta (250g)', price: 45000, shop: 'Toko: Kopi Cap Merak', rating: 4.8, img: 'Kopi Osing Robusta (250g).jpg', category: 'Makanan & Minuman', description: 'Kopi robusta khas Banyuwangi', stock: 35 },
    { id: 2, name: 'Batik Banyuwangi Gajah Oling', price: 180000, shop: 'Toko: Batik Cap Merak', rating: 4.9, img: 'batik_gajah_oling.jpg', category: 'Fashion Batik, Tenun', description: 'Batik tulis motif Gajah Oling', stock: 15 },
    { id: 3, name: 'Keripik Singkong Pedas', price: 25000, shop: 'Toko: Keripik Mak Nyak', rating: 4.7, img: 'keripik_singkong_pedas.png', category: 'Makanan & Minuman', description: 'Keripik singkong renyah pedas', stock: 100 },
    { id: 4, name: 'Gantungan Kunci Kayu Ukir', price: 15000, shop: 'Toko: Kerajinan Lokal', rating: 4.6, img: 'gantungan_kunci_kayu_ukir.png', category: 'Kerajinan Tangan Batik, Tenun', description: 'Gantungan kunci ukiran tradisional', stock: 75 },
    { id: 5, name: 'Topeng Gandrung Kayu', price: 150000, shop: 'Toko: Kerajinan Tangan', rating: 4.9, img: 'topeng_kayu.png', category: 'Kerajinan Tangan Batik, Tenun', description: 'Topeng tari Gandrung kayu pilihan', stock: 8 },
    { id: 6, name: 'Tenun Ikat Banyuwangi', price: 250000, shop: 'Toko: Tenun Nusantara', rating: 4.8, img: 'tenun_ikat.png', category: 'Fashion Batik, Tenun', description: 'Kain tenun ikat tradisional', stock: 12 },
    { id: 7, name: 'Sale Pisang Original', price: 35000, shop: 'Toko: Oleh-Oleh Banyuwangi', rating: 4.7, img: 'sale_pisang.png', category: 'Makanan & Minuman', description: 'Sale pisang khas Banyuwangi', stock: 60 },
    { id: 8, name: 'Kerajinan Anyaman Bambu', price: 75000, shop: 'Toko: Kerajinan Bambu', rating: 4.5, img: 'anyaman_bambu.png', category: 'Kerajinan Tangan Batik, Tenun', description: 'Tempat buah anyaman bambu', stock: 25 },
    { id: 9, name: 'Kaos Batik Modern', price: 95000, shop: 'Toko: Fashion Batik', rating: 4.6, img: 'kaos_batik.png', category: 'Fashion Batik, Tenun', description: 'Kaos motif batik modern', stock: 40 },
    { id: 10, name: 'Dodol Durian', price: 40000, shop: 'Toko: Kue Tradisional', rating: 4.8, img: 'dodol_durian.png', category: 'Makanan & Minuman', description: 'Dodol durian lembut dan legit', stock: 55 },
    { id: 11, name: 'Beras Organik Banyuwangi (5kg)', price: 75000, shop: 'Toko: Tani Makmur', rating: 4.9, img: 'beras_organik.png', category: 'Pertanian & Perikanan', description: 'Beras organik premium tanpa pestisida', stock: 200 },
    { id: 12, name: 'Ikan Asin Tenggiri (500g)', price: 55000, shop: 'Toko: Hasil Laut Muncar', rating: 4.7, img: 'ikan_asin_tenggiri.png', category: 'Pertanian & Perikanan', description: 'Ikan asin tenggiri kualitas premium', stock: 80 },
    { id: 13, name: 'Buah Naga Merah (3kg)', price: 45000, shop: 'Toko: Kebun Naga Banyuwangi', rating: 4.6, img: 'buah_naga_merah.png', category: 'Pertanian & Perikanan', description: 'Buah naga merah segar manis alami', stock: 150 },
    { id: 14, name: 'Udang Vaname Segar (1kg)', price: 95000, shop: 'Toko: Tambak Udang Blimbingsari', rating: 4.8, img: 'udang_vaname.png', category: 'Pertanian & Perikanan', description: 'Udang vaname segar dari tambak', stock: 30 },
  ];

  const filterGroups = [
    {
      key: 'kategori', title: 'Kategori Produk', icon: 'fa-folder',
      items: categories.map((cat) => ({ label: cat.name, type: 'category', value: cat.name })),
    },
    {
      key: 'harga', title: 'Rentang Harga', icon: 'fa-tag',
      items: [
        { label: 'Di bawah Rp 50.000', type: 'price', value: 'under50k' },
        { label: 'Rp 50.000 - Rp 100.000', type: 'price', value: '50k-100k' },
        { label: 'Rp 100.000 - Rp 200.000', type: 'price', value: '100k-200k' },
        { label: 'Di atas Rp 200.000', type: 'price', value: 'above200k' },
      ],
    },
    {
      key: 'rating', title: 'Rating Produk', icon: 'fa-star',
      items: [
        { label: '⭐ 4.8 ke atas', type: 'rating', value: '4.8' },
        { label: '⭐ 4.5 ke atas', type: 'rating', value: '4.5' },
        { label: '⭐ 4.0 ke atas', type: 'rating', value: '4.0' },
      ],
    },
    {
      key: 'stok', title: 'Ketersediaan Stok', icon: 'fa-boxes-stacked',
      items: [
        { label: 'Stok Tersedia (> 20)', type: 'stock', value: 'available' },
        { label: 'Stok Terbatas (≤ 20)', type: 'stock', value: 'limited' },
        { label: 'Stok Habis (0)', type: 'stock', value: 'out' },
      ],
    },
    {
      key: 'toko', title: 'Toko / Penjual', icon: 'fa-store',
      items: [
        { label: 'Kopi Cap Merak', type: 'shop', value: 'Kopi Cap Merak' },
        { label: 'Batik Cap Merak', type: 'shop', value: 'Batik Cap Merak' },
        { label: 'Keripik Mak Nyak', type: 'shop', value: 'Keripik Mak Nyak' },
        { label: 'Kerajinan Lokal', type: 'shop', value: 'Kerajinan Lokal' },
        { label: 'Kerajinan Tangan', type: 'shop', value: 'Kerajinan Tangan' },
        { label: 'Tenun Nusantara', type: 'shop', value: 'Tenun Nusantara' },
        { label: 'Oleh-Oleh Banyuwangi', type: 'shop', value: 'Oleh-Oleh Banyuwangi' },
        { label: 'Fashion Batik', type: 'shop', value: 'Fashion Batik' },
        { label: 'Kue Tradisional', type: 'shop', value: 'Kue Tradisional' },
        { label: 'Tani Makmur', type: 'shop', value: 'Tani Makmur' },
        { label: 'Hasil Laut Muncar', type: 'shop', value: 'Hasil Laut Muncar' },
        { label: 'Kebun Naga Banyuwangi', type: 'shop', value: 'Kebun Naga Banyuwangi' },
        { label: 'Tambak Udang Blimbingsari', type: 'shop', value: 'Tambak Udang Blimbingsari' },
      ],
    },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('❌ Error fetching products:', error);
        setProducts(mockProducts);
      } else if (data && data.length > 0) {
        setProducts(data);
      } else {
        await insertMockData();
      }
    } catch (err) {
      console.error('Error:', err);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) setCategories(data);
    } catch (err) {
      console.warn('⚠️ Gagal memuat kategori, pakai default:', err);
    }
  };

  const insertMockData = async () => {
    if (!user) {
      console.warn('🚫 GAGAL INSERT: Anda harus LOGIN terlebih dahulu!');
      setProducts(mockProducts);
      return;
    }
    try {
      const productsWithImages = mockProducts.map((product) => {
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(product.img);
        return {
          name: product.name, price: product.price, shop: product.shop, rating: product.rating,
          category: product.category, description: product.description, image_url: publicUrl,
          stock: product.stock || Math.floor(Math.random() * 50) + 10,
        };
      });
      const { data, error } = await supabase.from('products').insert(productsWithImages).select();
      if (error) {
        console.error('❌ Error inserting products:', error);
        setProducts(mockProducts);
      } else {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error in insertMockData:', err);
      setProducts(mockProducts);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ✅✅✅ TAMBAH KE KERANJANG SEKALIGUS KURANGI STOK ✅✅✅
  const handleAddToCart = async (product) => {
    const latestProduct = products.find(p => p.id === product.id) || product;
    const currentStock = getStock(latestProduct);

    // Validasi stok
    if (currentStock <= 0) {
      setToastMessage(`Maaf, stok ${product.name} sudah habis!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    // 1. Masukkan ke keranjang
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...latestProduct, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.length);

    // 2. Kurangi stok di database
    const newStock = currentStock - 1;
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
    if (error) console.error('❌ Gagal mengurangi stok di database:', error);

    // 3. Update tampilan lokal
    setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, stock: newStock } : p)));

    // 4. Notifikasi
    setToastMessage(`${product.name} ditambahkan! Sisa stok: ${newStock}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleViewDetail = (productId) => navigate(`/product/${productId}`);
  const scrollToProducts = () => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    setActiveFilters([]);
    scrollToProducts();
  };

  const resetFilters = () => {
    setSelectedCategory('Semua');
    setSearchQuery('');
    setActiveFilters([]);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.shop && product.shop.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'Semua' || normalize(product.category) === normalize(selectedCategory);

    if (activeFilters.length === 0) return matchesSearch && matchesCategory;

    const categoryFilters = activeFilters.filter(f => f.startsWith('category:'));
    const priceFilters = activeFilters.filter(f => f.startsWith('price:'));
    const ratingFilters = activeFilters.filter(f => f.startsWith('rating:'));
    const stockFilters = activeFilters.filter(f => f.startsWith('stock:'));
    const shopFilters = activeFilters.filter(f => f.startsWith('shop:'));

    let matchesFilterCategory = true;
    if (categoryFilters.length > 0) {
      matchesFilterCategory = categoryFilters.some(f => normalize(product.category) === normalize(f.replace('category:', '')));
    }

    let matchesFilterPrice = true;
    if (priceFilters.length > 0) {
      matchesFilterPrice = priceFilters.some(f => {
        const val = f.replace('price:', '');
        const price = getPrice(product);
        switch (val) {
          case 'under50k': return price < 50000;
          case '50k-100k': return price >= 50000 && price <= 100000;
          case '100k-200k': return price > 100000 && price <= 200000;
          case 'above200k': return price > 200000;
          default: return true;
        }
      });
    }

    let matchesFilterRating = true;
    if (ratingFilters.length > 0) {
      matchesFilterRating = ratingFilters.some(f => getRating(product) >= parseFloat(f.replace('rating:', '')));
    }

    let matchesFilterStock = true;
    if (stockFilters.length > 0) {
      matchesFilterStock = stockFilters.some(f => {
        const val = f.replace('stock:', '');
        const stock = getStock(product);
        switch (val) {
          case 'available': return stock > 20;
          case 'limited': return stock > 0 && stock <= 20;
          case 'out': return stock === 0;
          default: return true;
        }
      });
    }

    let matchesFilterShop = true;
    if (shopFilters.length > 0) {
      matchesFilterShop = shopFilters.some(f => (product.shop || '').toLowerCase().includes(f.replace('shop:', '').toLowerCase()));
    }

    return matchesSearch && matchesCategory && matchesFilterCategory && matchesFilterPrice && matchesFilterRating && matchesFilterStock && matchesFilterShop;
  });

  const getActiveCount = (groupKey) => {
    return activeFilters.filter(f => {
      const group = filterGroups.find(g => g.key === groupKey);
      if (!group) return false;
      return group.items.some(item => `${item.type}:${item.value}` === f);
    }).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:ml-20">
      {/* Sidebar Navigasi */}
      <aside className="hidden md:flex flex-col bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-40">
        <div className="flex flex-col items-center py-4 gap-1 mt-11 h-full">
          <div className="w-20 h-px bg-gray-300 my-3"></div>
          <nav className="flex flex-col gap-1 w-full px-2 flex-1">
            {[
              { path: '/', icon: 'fa-house', label: 'Beranda' },
              { path: '/categories', icon: 'fa-folder', label: 'Kategori' },
              { path: '/unggulan', icon: 'fa-star', label: 'Unggulan' },
              { path: '/admin', icon: 'fa-screwdriver-wrench', label: 'Admin' },
              { path: '#', icon: 'fa-circle-info', label: 'Tentang' },
              { path: '#', icon: 'fa-envelope', label: 'Kontak' },
            ].map((item) => (
              <Link key={item.label} to={item.path} className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition ${location.pathname === item.path ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}>
                {location.pathname === item.path && item.path !== '#' && (
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

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 md:px-8 lg:px-12 xl:px-20 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-blue-900 p-2 rounded-lg"><i className="fa-solid fa-mountain-sun text-white text-2xl"></i></div>
              <div className="leading-tight">
                <h1 className="text-lg font-bold text-blue-900">UMKM</h1>
                <p className="text-[10px] text-blue-700 font-semibold tracking-wider">BANYUWANGI</p>
              </div>
            </Link>
            <nav className="hidden lg:flex gap-4 xl:gap-6 text-sm font-semibold">
              <Link to="/" className="text-blue-700 hover:text-blue-900 transition">Beranda</Link>
              <Link to="/categories" className="text-gray-600 hover:text-blue-700 transition">Kategori Produk</Link>
              <Link to="/unggulan" className="text-gray-600 hover:text-blue-700 transition">Produk Unggulan</Link>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Mitra UMKM</a>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Tentang Kami</a>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Kontak</a>
            </nav>
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden w-full">
                <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory('Semua'); }} className="flex-1 px-4 py-2 bg-transparent outline-none text-sm" />
                <button className="bg-blue-700 text-white px-4 py-2 hover:bg-blue-800 transition"><i className="fa-solid fa-magnifying-glass"></i></button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => navigate('/cart')} className="relative p-2 text-gray-600 hover:text-blue-700 transition">
                <i className="fa-solid fa-cart-shopping text-lg md:text-xl"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{cartCount}</span>
                )}
              </button>
              {authLoading ? (
                <span className="text-xs md:text-sm text-gray-400">...</span>
              ) : user ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs text-gray-600">{user.email?.split('@')[0]}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs">
                  <Link to="/login" className="font-semibold text-gray-600 hover:text-blue-700">Masuk</Link>
                  <span className="text-gray-400 hidden sm:inline">/</span>
                  <Link to="/register" className="font-semibold text-gray-600 hover:text-blue-700 hidden sm:inline">Daftar</Link>
                </div>
              )}
            </div>
          </div>
          <div className="md:hidden mt-3">
            <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
              <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory('Semua'); }} className="flex-1 px-3 py-2 bg-transparent outline-none text-sm" />
              <button className="bg-blue-700 text-white px-3 py-2"><i className="fa-solid fa-magnifying-glass"></i></button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/logo.png')" }}></div>
        <div className="absolute inset-0 bg-blue-900/80 md:bg-blue-900/70"></div>
        <div className="px-4 py-12 md:py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-yellow-400 font-semibold mb-4 md:mb-5 uppercase text-sm tracking-wider">Dukung Produk Lokal Banyuwangi!</p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8 leading-tight">Temukan Kerajinan & Kuliner<br />Khas UMKM Terbaik</h2>
            <button onClick={scrollToProducts} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105 text-sm md:text-lg cursor-pointer">
              <i className="fa-solid fa-bag-shopping mr-2"></i> Belanja Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:sticky lg:top-20 space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-2">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-blue-600"></i> Filter Produk
                </h3>
                {activeFilters.length > 0 && (
                  <button onClick={() => setActiveFilters([])} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition">
                    <i className="fa-solid fa-xmark"></i> Reset ({activeFilters.length})
                  </button>
                )}
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-3 border-b border-gray-100 mb-2">
                  {activeFilters.map((filter) => {
                    let label = filter.split(':')[1];
                    filterGroups.forEach(group => {
                      const item = group.items.find(i => `${i.type}:${i.value}` === filter);
                      if (item) label = item.label;
                    });
                    return (
                      <span key={filter} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-1 rounded-full border border-blue-100">
                        {label}
                        <button onClick={() => handleFilterChange(filter)} className="hover:text-red-500 transition">
                          <i className="fa-solid fa-xmark text-[8px]"></i>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {filterGroups.map((group) => {
                const activeCount = getActiveCount(group.key);
                return (
                  <div key={group.key} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    <button onClick={() => toggleSection(group.key)} className="flex items-center justify-between w-full font-bold text-gray-800 py-2.5 text-sm hover:text-blue-600 transition group">
                      <span className="flex items-center gap-2">
                        <i className={`fa-solid ${group.icon} text-xs text-gray-400 group-hover:text-blue-500 transition`}></i>
                        {group.title}
                        {activeCount > 0 && (
                          <span className="bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{activeCount}</span>
                        )}
                      </span>
                      <i className={`fa-solid fa-chevron-${expandedSections[group.key] ? 'up' : 'down'} text-[10px] text-gray-400 transition-transform duration-200`}></i>
                    </button>

                    {expandedSections[group.key] && (
                      <div className="space-y-1.5 pb-2 pl-1">
                        {group.items.map((item) => {
                          const filterKey = `${item.type}:${item.value}`;
                          const isChecked = activeFilters.includes(filterKey);
                          return (
                            <label key={filterKey} className={`flex items-center gap-2.5 cursor-pointer group/item p-1.5 rounded-md transition ${isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                              <input type="checkbox" checked={isChecked} onChange={() => handleFilterChange(filterKey)} className="w-3.5 h-3.5 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              <span className={`text-xs transition ${isChecked ? 'text-blue-700 font-semibold' : 'text-gray-600 group-hover/item:text-blue-600'}`}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Products */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-5">Kategori Utama</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
                {categories.map((cat, i) => {
                  const isActive = selectedCategory === cat.name;
                  const count = products.filter(p => normalize(p.category) === normalize(cat.name)).length;
                  return (
                    <button key={cat.id ?? i} onClick={() => handleCategoryClick(cat.name)} className={`relative flex flex-col items-center gap-2 cursor-pointer group w-full text-left focus:outline-none transition-all ${isActive ? 'scale-105' : 'hover:scale-105'}`}>
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-all shadow-sm ${isActive ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-100 group-hover:border-blue-500'}`}>
                        <img src={cat.img || 'https://placehold.co/64/1e3a8a/ffffff/png?text=K'} alt={cat.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => { e.target.src = 'https://placehold.co/64/1e3a8a/ffffff/png?text=K'; }} />
                      </div>
                      <span className={`text-[10px] md:text-[11px] font-semibold text-center leading-tight transition-colors ${isActive ? 'text-blue-700' : 'text-gray-600 group-hover:text-blue-600'}`}>{cat.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>{count} produk</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={productsRef} className="scroll-mt-24">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base md:text-lg font-bold text-gray-800">{selectedCategory === 'Semua' ? 'Semua Produk' : `Kategori: ${selectedCategory}`}</h3>
                  {(selectedCategory !== 'Semua' || activeFilters.length > 0 || searchQuery) && (
                    <button onClick={resetFilters} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition">
                      <i className="fa-solid fa-xmark"></i> Reset
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{filteredProducts.length} produk</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                      <div className="h-32 md:h-40 bg-gray-200"></div>
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const stock = getStock(product);
                        const stockStatus = getStockStatus(product);
                        return (
                          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                            <div className="relative h-32 md:h-40 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => handleViewDetail(product.id)}>
                              <img src={product.image_url || product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = `https://placehold.co/300x300/e2e8f0/475569?text=${encodeURIComponent(product.name?.substring(0, 15) || 'Produk')}`; }} />
                              {stockStatus === 'available' && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-medium shadow"><i className="fa-solid fa-box mr-1"></i>Stok {stock}</div>
                              )}
                              {stockStatus === 'limited' && (
                                <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-medium shadow"><i className="fa-solid fa-triangle-exclamation mr-1"></i>Sisa {stock}</div>
                              )}
                              {stockStatus === 'out' && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-medium shadow"><i className="fa-solid fa-ban mr-1"></i>Habis</div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full shadow"><i className="fa-solid fa-eye mr-1"></i> Lihat Detail</span>
                              </div>
                            </div>
                            <div className="p-2 md:p-3">
                              <h4 className="font-semibold text-gray-800 text-xs mb-1 line-clamp-2 leading-tight">{product.name}</h4>
                              <p className="text-blue-700 font-bold text-sm md:text-base mb-1 md:mb-2">Rp {getPrice(product).toLocaleString('id-ID')}</p>
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1 md:mb-2">
                                <i className="fa-solid fa-store text-orange-400"></i>
                                <span className="truncate">{product.shop || 'Toko Lokal'}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-2 md:mb-3">
                                <div className="flex text-yellow-400 text-[10px]">
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fa-solid fa-star ${i < Math.floor(getRating(product)) ? '' : 'text-gray-300'}`}></i>
                                  ))}
                                </div>
                                <span className="text-[10px] text-gray-500">{getRating(product).toFixed(1)}</span>
                              </div>
                              <div className="flex gap-1 md:gap-2">
                                <button onClick={() => handleAddToCart(product)} disabled={stockStatus === 'out'}
                                  className={`flex-1 text-[10px] md:text-xs font-semibold py-1.5 md:py-2 rounded transition flex items-center justify-center gap-1 ${stockStatus === 'out' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                  <i className="fa-solid fa-cart-plus"></i>
                                  <span className="hidden xl:inline">{stockStatus === 'out' ? 'Habis' : 'Tambah'}</span>
                                </button>
                                <button onClick={() => handleViewDetail(product.id)} className="px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded hover:border-blue-500 hover:text-blue-600 transition text-[10px] md:text-xs font-semibold">
                                  <span className="hidden sm:inline">Detail</span>
                                  <i className="fa-solid fa-eye sm:hidden"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                        <i className="fa-solid fa-box-open text-5xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-sm mb-1">Tidak ada produk yang ditemukan.</p>
                        <p className="text-gray-400 text-xs mb-4">Coba ubah filter atau kata kunci pencarian Anda.</p>
                        <button onClick={resetFilters} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition">
                          <i className="fa-solid fa-rotate-left mr-1"></i> Reset Semua Filter
                        </button>
                      </div>
                    )}
                  </div>
                  {filteredProducts.length > 0 && (
                    <div className="text-center mt-4 md:mt-6">
                      <button className="bg-white border border-gray-300 text-gray-700 px-6 md:px-8 py-2 md:py-2.5 rounded-lg font-semibold text-sm hover:border-blue-500 hover:text-blue-600 transition shadow-sm">Tampilkan Lebih Banyak</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 md:mt-10 pt-6 md:pt-8 pb-4 md:pb-6">
        <div className="px-4 text-center">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-4 md:mb-6 opacity-60">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full"></div>
          </div>
          <p className="text-xs text-gray-500">© 2024 Dinas Koperasi & UMKM Banyuwangi.</p>
        </div>
      </footer>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[100] transition-all duration-300 ease-out transform translate-y-0 opacity-100">
          <i className="fa-solid fa-circle-check text-green-400 text-xl"></i>
          <div>
            <p className="font-semibold text-sm">Berhasil!</p>
            <p className="text-xs text-gray-300">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}