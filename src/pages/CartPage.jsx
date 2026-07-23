import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [stockMap, setStockMap] = useState({}); // id produk -> stok tersedia di DB
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
    if (cart.length > 0) fetchStocks(cart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ambil stok terbaru dari database untuk produk yang ada di keranjang
  const fetchStocks = async (cart) => {
    const ids = cart.map(i => i.id);
    const { data, error } = await supabase.from('products').select('id, stock').in('id', ids);
    if (error) { console.error('❌ Gagal ambil stok:', error); return; }
    const map = {};
    data.forEach(p => { map[p.id] = Number(p.stock) || 0; });
    setStockMap(map);
  };

  // ✅ Update stok di database secara relatif (+/-), kembalikan stok baru
  const adjustProductStock = async (productId, delta) => {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (error) { console.error('❌ Gagal baca stok:', error); return null; }

    const current = Number(data.stock) || 0;
    const newStock = Math.max(0, current + delta);

    const { error: upErr } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (upErr) console.error('❌ Gagal update stok:', upErr);
    return newStock;
  };

  // ✅ Ubah quantity (+1 kurangi stok DB, -1 kembalikan stok DB)
  const updateQuantity = async (productId, change) => {
    const item = cartItems.find(i => i.id === productId);
    if (!item) return;

    if (change > 0) {
      // Tambah quantity → pastikan stok masih ada, lalu kurangi stok DB
      const available = stockMap[productId] ?? 0;
      if (available <= 0) {
        alert('Stok produk tidak mencukupi!');
        return;
      }
      const newStock = await adjustProductStock(productId, -1);
      if (newStock !== null) setStockMap(prev => ({ ...prev, [productId]: newStock }));
    } else {
      // Kurangi quantity → kembalikan stok DB (quantity minimal 1)
      if (item.quantity <= 1) return;
      const newStock = await adjustProductStock(productId, +1);
      if (newStock !== null) setStockMap(prev => ({ ...prev, [productId]: newStock }));
    }

    const updatedCart = cartItems.map(i =>
      i.id === productId ? { ...i, quantity: Math.max(1, i.quantity + change) } : i
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // ✅ Hapus item → kembalikan stok sebanyak quantity
  const removeItem = async (productId) => {
    const item = cartItems.find(i => i.id === productId);
    if (item) {
      const newStock = await adjustProductStock(productId, item.quantity);
      if (newStock !== null) setStockMap(prev => ({ ...prev, [productId]: newStock }));
    }
    const updatedCart = cartItems.filter(i => i.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
              { path: '/cart', icon: 'fa-cart-shopping', label: 'Keranjang' },
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
            <h2 className="text-xl font-bold text-gray-800 hidden sm:block">Keranjang Belanja</h2>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              <i className="fa-solid fa-house text-xl"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-cart-shopping text-6xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Keranjang Masih Kosong</h3>
            <p className="text-gray-500 mb-6">Yuk, mulai belanja produk UMKM Banyuwangi!</p>
            <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition">
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Daftar Produk */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{cartItems.length} Produk dalam Keranjang</h3>

                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const imageUrl = item.image_url || item.img || 'https://placehold.co/100/e2e8f0/475569?text=Produk';
                    const sisaStok = stockMap[item.id];

                    return (
                      <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-4 last:border-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100/e2e8f0/475569?text=Produk'; }} />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{item.shop || 'Toko Lokal'}</p>
                          <p className="text-blue-700 font-bold">Rp {(Number(item.price) || 0).toLocaleString('id-ID')}</p>
                          {/* ✅ Info sisa stok */}
                          <p className={`text-[10px] mt-1 ${sisaStok === 0 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                            {sisaStok === undefined ? 'Memuat stok...' : sisaStok === 0 ? 'Stok di toko habis' : `Sisa stok di toko: ${sisaStok}`}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-gray-200 transition">
                              <i className="fa-solid fa-minus text-xs"></i>
                            </button>
                            <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                            {/* ✅ Tombol + nonaktif jika stok di toko habis */}
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={sisaStok === 0}
                              className={`w-8 h-8 rounded flex items-center justify-center transition ${sisaStok === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-200'}`}
                            >
                              <i className="fa-solid fa-plus text-xs"></i>
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">
                            <i className="fa-solid fa-trash mr-1"></i> Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ringkasan Pesanan */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Produk</span>
                    <span className="font-semibold">{totalItems} item</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkir</span>
                    <span className="font-semibold text-green-600">Gratis</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-700">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* ✅ Satu tombol checkout (yang duplikat dihapus) */}
                <button onClick={() => navigate('/checkout')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                  <i className="fa-solid fa-credit-card mr-2"></i> Lanjut ke Pembayaran
                </button>
                <button onClick={() => navigate('/')} className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg transition text-sm">
                  <i className="fa-solid fa-arrow-left mr-2"></i> Lanjut Belanja
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}