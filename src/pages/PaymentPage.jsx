import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate('/cart');
    } else {
      setCartItems(cart);
    }
  }, [navigate]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = () => {
    if (!selectedMethod) {
      alert('⚠️ Silakan pilih metode pembayaran terlebih dahulu!');
      return;
    }
    
    setIsProcessing(true);
    // Simulasi proses pembayaran (1.5 detik)
    setTimeout(() => {
      alert(`✅ Pembayaran berhasil via ${selectedMethod.toUpperCase()}!`);
      localStorage.removeItem('cart');
      navigate('/');
    }, 1500);
  };

  const paymentMethods = [
    { id: 'qris', name: 'QRIS', icon: 'fa-qrcode', color: 'bg-blue-50 border-blue-500 text-blue-700', desc: 'Scan QR dari e-wallet atau mobile banking' },
    { id: 'tunai', name: 'Tunai (COD)', icon: 'fa-money-bill-wave', color: 'bg-green-50 border-green-500 text-green-700', desc: 'Bayar langsung saat barang diterima' },
    { id: 'bank', name: 'Transfer Bank', icon: 'fa-building-columns', color: 'bg-purple-50 border-purple-500 text-purple-700', desc: 'BCA, Mandiri, BNI, BRI, dll' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:ml-20">
      {/* ===== SIDEBAR (Sama seperti halaman lain) ===== */}
      <aside className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-40">
        <div className="flex flex-col items-center py-4 gap-1 mt-11 h-full">
          <div className="w-20 h-px bg-gray-300 my-3"></div>
          <nav className="flex flex-col gap-1 w-full px-2 flex-1">
            {[
              { path: '/', icon: 'fa-house', label: 'Beranda' },
              { path: '/categories', icon: 'fa-folder', label: 'Kategori' },
              { path: '/cart', icon: 'fa-cart-shopping', label: 'Keranjang' },
            ].map((item) => (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 p-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition">
                <i className={`fa-solid ${item.icon} text-xl`}></i>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* ===== HEADER ===== */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-900 p-2 rounded-lg"><i className="fa-solid fa-mountain-sun text-white text-xl"></i></div>
              <div><h1 className="text-lg font-bold text-blue-900">UMKM</h1><p className="text-[10px] text-blue-700 font-semibold">BANYUWANGI</p></div>
            </Link>
            <h2 className="text-xl font-bold text-gray-800 hidden md:block">Pembayaran</h2>
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-blue-700"><i className="fa-solid fa-arrow-left text-xl"></i></button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="px-4 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Pilihan Metode Pembayaran */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Pilih Metode Pembayaran</h3>
              <div className="grid gap-4">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedMethod === method.id 
                        ? `${method.color} border-current shadow-md` 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      selectedMethod === method.id ? 'bg-white/50' : 'bg-gray-100'
                    }`}>
                      <i className={`fa-solid ${method.icon}`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base">{method.name}</h4>
                      <p className="text-sm opacity-80">{method.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === method.id ? 'border-current bg-current' : 'border-gray-300'
                    }`}>
                      {selectedMethod === method.id && <i className="fa-solid fa-check text-white text-xs"></i>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>
              
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate w-2/3">{item.name} x{item.quantity}</span>
                    <span className="font-semibold whitespace-nowrap">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkir</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-blue-700">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full mt-6 font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isProcessing ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Memproses...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock text-sm"></i> Bayar Sekarang
                  </>
                )}
              </button>
              
              <p className="text-center text-xs text-gray-500 mt-3">
                <i className="fa-solid fa-shield-halved mr-1"></i> Transaksi aman & terenkripsi
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}