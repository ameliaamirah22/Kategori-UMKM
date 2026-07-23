import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate('/cart');
    } else {
      setCartItems(cart);
    }
  }, [navigate]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePayNow = () => {
    const trxId = `TRX-${Date.now().toString().slice(-8)}`;
    setTransactionId(trxId);
    setShowReceipt(true);
    localStorage.removeItem('cart'); // Kosongkan keranjang setelah bayar
  };

  const handlePrint = () => {
    window.print();
  };

  // ===== TAMPILAN NOTA THERMAL =====
  if (showReceipt) {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4">
        {/* CSS Khusus Print agar hasil seperti thermal roll */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .thermal-receipt, .thermal-receipt * { visibility: visible; }
            .thermal-receipt { position: absolute; left: 0; top: 0; width: 80mm; box-shadow: none; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            @page { margin: 0; size: 80mm auto; }
          }
        `}</style>

        <div className="thermal-receipt bg-white w-80 shadow-2xl relative">
          {/* Efek Zigzag Kertas Atas */}
          <div className="absolute -top-2 left-0 w-full h-4 bg-gray-200" 
               style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }}>
          </div>

          <div className="p-6 pt-8 text-xs text-gray-800 font-mono leading-tight">
            <div className="text-center mb-4">
              <h2 className="font-bold text-base tracking-widest">UMKM BANYUWANGI</h2>
              <p>Jl. Jenderal Sudirman No. 123</p>
              <p>Banyuwangi, Jawa Timur</p>
              <p>Telp: 0812-3456-7890</p>
            </div>

            <div className="border-t-2 border-dashed border-gray-400 my-3"></div>

            <div className="flex justify-between mb-1">
              <span>No: {transactionId}</span>
              <span>{new Date().toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Kasir: {user?.email?.split('@')[0] || 'Guest'}</span>
              <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Metode: {paymentMethod.toUpperCase()}</span>
            </div>

            <div className="border-t-2 border-dashed border-gray-400 my-3"></div>

            {cartItems.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="font-bold leading-tight mb-1">{item.name}</div>
                <div className="flex justify-between">
                  <span>{item.quantity} x {item.price.toLocaleString('id-ID')}</span>
                  <span>{(item.quantity * item.price).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}

            <div className="border-t-2 border-dashed border-gray-400 my-3"></div>

            <div className="flex justify-between font-bold text-sm mb-1">
              <span>TOTAL ITEM</span>
              <span>{totalItems} Pcs</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2">
              <span>TOTAL BAYAR</span>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>

            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

            <div className="text-center mt-4">
              <p className="font-bold text-sm">*** TERIMA KASIH ***</p>
              <p className="mt-2">Barang yang sudah dibeli</p>
              <p>tidak dapat ditukar/dikembalikan</p>
              <p className="mt-4 text-[10px] text-gray-500">Simpan struk ini sebagai bukti pembayaran yang sah</p>
            </div>
          </div>

          {/* Efek Zigzag Kertas Bawah */}
          <div className="absolute -bottom-2 left-0 w-full h-4 bg-gray-200" 
               style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}>
          </div>
        </div>

        {/* Tombol Aksi (Tidak akan ikut ter-print) */}
        <div className="no-print fixed bottom-8 flex gap-4">
          <button onClick={handlePrint} className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition">
            <i className="fa-solid fa-print"></i> Cetak Struk
          </button>
          <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition">
            <i className="fa-solid fa-house"></i> Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // ===== TAMPILAN HALAMAN CHECKOUT (Sebelum Bayar) =====
  return (
    <div className="min-h-screen bg-gray-50 font-sans md:ml-20">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 md:px-8 lg:px-12 xl:px-20 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-900 p-2 rounded-lg"><i className="fa-solid fa-mountain-sun text-white text-xl"></i></div>
              <div>
                <h1 className="text-lg font-bold text-blue-900">UMKM</h1>
                <p className="text-[10px] text-blue-700 font-semibold">BANYUWANGI</p>
              </div>
            </Link>
            <h2 className="text-xl font-bold text-gray-800 hidden sm:block">Checkout</h2>
            <Link to="/cart" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2">
              <i className="fa-solid fa-arrow-left"></i> Kembali
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const imageUrl = item.image_url || item.img || 'https://via.placeholder.com/100';
                  return (
                    <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="font-bold text-gray-800">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t-2 border-dashed border-gray-300 mt-6 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total Tagihan</span>
                  <span className="text-2xl font-bold text-blue-700">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Metode Pembayaran</h3>
              
              <div className="space-y-3 mb-6">
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">Transfer Bank</p>
                    <p className="text-xs text-gray-500">BCA, Mandiri, BNI</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'ewallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="payment" value="ewallet" checked={paymentMethod === 'ewallet'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">E-Wallet</p>
                    <p className="text-xs text-gray-500">GoPay, OVO, Dana, ShopeePay</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">COD (Bayar di Tempat)</p>
                    <p className="text-xs text-gray-500">Tunai saat barang diterima</p>
                  </div>
                </label>
              </div>

              <button onClick={handlePayNow} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition shadow-md flex items-center justify-center gap-2">
                <i className="fa-solid fa-lock"></i> Bayar Sekarang
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-3">
                <i className="fa-solid fa-shield-halved mr-1"></i> Transaksi Anda aman dan terenkripsi
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}