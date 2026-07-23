import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

// Kategori cadangan kalau tabel database belum ada
const DEFAULT_CATEGORIES = [
  { id: null, name: 'Makanan & Minuman', img: '/images/makanan-minuman.png' },
  { id: null, name: 'Kerajinan Tangan Batik, Tenun', img: '/images/kerajinan-tangan.png' },
  { id: null, name: 'Fashion Batik, Tenun', img: '/images/fashion.png' },
  { id: null, name: 'Pertanian & Perikanan', img: '/images/pertanian.png' },
  { id: null, name: 'Lainnya', img: '/images/lainnya.png' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Kategori dari database
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    shop: '',
    category: 'Makanan & Minuman',
    description: '',
    stock: '',
    rating: '4.5',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const BUCKET_NAME = 'product-images';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProducts(data);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      alert('Gagal memuat data produk: ' + getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ambil kategori dari database
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) setCategories(data);
    } catch (err) {
      console.warn('⚠️ Gagal memuat kategori, pakai default:', err);
    }
  };

  // ✅ TAMBAH kategori baru
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return alert('Nama kategori tidak boleh kosong!');
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return alert(`Kategori "${name}" sudah ada!`);
    }
    setAddingCategory(true);
    try {
      const { data, error } = await supabase.from('categories').insert({ name, img: '' }).select().single();
      if (error) throw error;
      setCategories(prev => [...prev, data]);
      setNewCategory('');
      alert(`✅ Kategori "${name}" berhasil ditambahkan!`);
    } catch (err) {
      console.error('❌ Error add category:', err);
      alert('Gagal menambah kategori: ' + getFriendlyError(err));
    } finally {
      setAddingCategory(false);
    }
  };

  // ✅ HAPUS kategori
  const handleDeleteCategory = async (cat) => {
    if (!cat.id) return alert('Kategori bawaan tidak dapat dihapus dari sini.');
    const used = products.some(p => p.category === cat.name);
    if (!confirm(used ? `⚠️ Kategori "${cat.name}" masih dipakai produk. Tetap hapus?` : `Hapus kategori "${cat.name}"?`)) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id);
      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      if (formData.category === cat.name) {
        const fallback = categories.find(c => c.id !== cat.id)?.name || 'Lainnya';
        setFormData(prev => ({ ...prev, category: fallback }));
      }
      alert('✅ Kategori dihapus!');
    } catch (err) {
      alert('Gagal hapus kategori: ' + getFriendlyError(err));
    }
  };

  const getFriendlyError = (error) => {
    const msg = (error?.message || '').toLowerCase();
    if (msg.includes('does not exist') && msg.includes('categories')) {
      return 'Tabel "categories" belum ada. Jalankan SQL pembuatan tabel categories di Supabase.';
    }
    if (msg.includes('row-level security') || msg.includes('violates row-level')) {
      return 'Ditolak oleh keamanan (RLS). Jalankan SQL setup terlebih dahulu.';
    }
    if (msg.includes('bucket not found') || msg.includes('bucket does not exist')) {
      return 'Bucket "product-images" belum ada. Buat bucket publik di Supabase Storage.';
    }
    if (msg.includes('duplicate') || msg.includes('unique constraint')) return 'Data serupa sudah ada.';
    if (msg.includes('not-null') || msg.includes('null value')) return 'Ada field wajib yang kosong.';
    return error?.message || 'Terjadi kesalahan.';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const adjustStock = (delta) => {
    setFormData(prev => {
      const current = Math.floor(Number(prev.stock)) || 0;
      return { ...prev, stock: Math.max(0, current + delta).toString() };
    });
  };
  const addStock = (amount) => {
    setFormData(prev => {
      const current = Math.floor(Number(prev.stock)) || 0;
      return { ...prev, stock: (current + amount).toString() };
    });
  };
  const resetStock = () => setFormData(prev => ({ ...prev, stock: '0' }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('File harus berupa gambar!');
      if (file.size > 5 * 1024 * 1024) return alert('Ukuran gambar maksimal 5MB!');
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Nama produk wajib diisi!');
    if (!formData.shop.trim()) return alert('Nama toko wajib diisi!');
    if (formData.price === '' || safeNumber(formData.price) <= 0) return alert('Harga wajib diisi dan lebih dari 0!');
    if (formData.stock === '') return alert('Stok wajib diisi!');
    if (safeNumber(formData.stock) < 0) return alert('Stok tidak boleh negatif!');
    if (!imageFile && !editingProduct) return alert('Pilih gambar terlebih dahulu!');

    if (!editingProduct) {
      const dup = products.some(p => (p.name || '').trim().toLowerCase() === formData.name.trim().toLowerCase());
      if (dup && !confirm(`Produk "${formData.name.trim()}" sepertinya sudah ada. Tetap tambahkan?`)) return;
    }

    setUploading(true);
    try {
      let imageUrl = editingProduct?.image_url || '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error('Upload gambar gagal: ' + uploadError.message);
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const productData = {
        name: formData.name.trim(),
        price: Math.floor(safeNumber(formData.price, 0)),
        shop: formData.shop.trim() || 'Toko Lokal',
        category: formData.category || 'Lainnya',
        description: formData.description.trim() || '',
        stock: Math.floor(safeNumber(formData.stock, 0)),
        rating: Math.min(5, Math.max(1, safeNumber(formData.rating, 4.5))),
        image_url: imageUrl || '',
        user_id: user?.id || null,
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw new Error('Update gagal: ' + error.message);
        alert('✅ Produk berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw new Error('Insert gagal: ' + error.message);
        alert('✅ Produk berhasil ditambahkan!');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Gagal menyimpan produk: ' + getFriendlyError(error));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price?.toString() ?? '',
      shop: product.shop || '',
      category: product.category || 'Makanan & Minuman',
      description: product.description || '',
      stock: product.stock?.toString() ?? '',
      rating: product.rating?.toString() || '4.5',
    });
    setImagePreview(product.image_url || null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    const product = products.find(p => p.id === productId);
    if (product?.image_url && product.image_url.includes(BUCKET_NAME)) {
      try {
        const fileName = decodeURIComponent(product.image_url.split('/').pop().split('?')[0]);
        await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      } catch (e) { console.warn('⚠️ Gagal hapus gambar (diabaikan):', e); }
    }
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      alert('✅ Produk berhasil dihapus!');
      fetchProducts();
    } catch (error) {
      alert('Gagal menghapus produk: ' + getFriendlyError(error));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', price: '', shop: '',
      category: categories[0]?.name || 'Makanan & Minuman',
      description: '', stock: '', rating: '4.5',
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            <i className="fa-solid fa-gauge-high mr-2"></i>Dashboard Admin
          </h1>
          <button onClick={() => navigate('/')} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition">
            <i className="fa-solid fa-arrow-left mr-1"></i> Kembali
          </button>
        </div>

        {/* ✅✅✅ CARD KELOLA KATEGORI ✅✅✅ */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700 mb-1">🏷️ Kelola Kategori</h2>
          <p className="text-xs text-gray-500 mb-4">Tambah jenis kategori baru untuk produk Anda.</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
              placeholder="Nama kategori baru, misal: Oleh-oleh Khas, Minuman Herbal..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleAddCategory}
              disabled={addingCategory}
              className={`px-5 py-2 rounded-md font-semibold text-white text-sm transition flex items-center justify-center gap-2 ${addingCategory ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {addingCategory ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-plus"></i>}
              Tambah Kategori
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat.id ?? cat.name} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100">
                {cat.name}
                <button onClick={() => handleDeleteCategory(cat)} className="hover:text-red-500 transition" title="Hapus kategori">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Form Tambah / Edit Produk */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">{editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}</h2>
            {editingProduct && (
              <button onClick={resetForm} className="text-sm text-red-600 hover:text-red-800 font-medium">
                <i className="fa-solid fa-xmark mr-1"></i> Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Contoh: Kopi Osing Robusta (250g)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) <span className="text-red-500">*</span></label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="45000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko <span className="text-red-500">*</span></label>
                <input type="text" name="shop" value={formData.shop} onChange={handleInputChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Toko: Kopi Cap Merak" />
              </div>

              {/* ✅ DROPDOWN KATEGORI DINAMIS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                <select name="category" value={formData.category} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  {categories.map((cat) => (
                    <option key={cat.id ?? cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1"><i className="fa-solid fa-circle-info mr-1"></i>Kategori baru? Tambah di card "Kelola Kategori" di atas.</p>
              </div>

              {/* ✅ STOK INTERAKTIF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Produk <span className="text-red-500">*</span></label>
                <div className="flex items-stretch">
                  <button type="button" onClick={() => adjustStock(-1)} className="px-3 bg-gray-100 hover:bg-gray-200 rounded-l-md border border-gray-300 text-gray-700 font-bold transition"><i className="fa-solid fa-minus"></i></button>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" step="1"
                    className="flex-1 px-2 py-2 border-y border-gray-300 text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" />
                  <button type="button" onClick={() => adjustStock(1)} className="px-3 bg-gray-100 hover:bg-gray-200 rounded-r-md border border-gray-300 text-gray-700 font-bold transition"><i className="fa-solid fa-plus"></i></button>
                </div>
                <div className="flex gap-1 mt-1.5">
                  {[10, 50, 100].map((n) => (
                    <button key={n} type="button" onClick={() => addStock(n)} className="flex-1 text-[11px] py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold transition">+{n}</button>
                  ))}
                  <button type="button" onClick={resetStock} className="flex-1 text-[11px] py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold transition">Reset</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} min="1" max="5" step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="4.5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Produk</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Deskripsi singkat produk..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk {!editingProduct && <span className="text-red-500">*</span>}</label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {imageFile && <p className="text-xs text-green-600 mt-1">✅ File: {imageFile.name}</p>}
                  {!imageFile && editingProduct && <p className="text-xs text-gray-500 mt-1">Gambar lama dipertahankan jika tidak upload baru.</p>}
                </div>
                {imagePreview && (
                  <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/80/e2e8f0/475569?text=?'; }} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={uploading}
                className={`flex-1 py-3 rounded-md font-semibold text-white transition flex items-center justify-center gap-2 ${uploading ? 'bg-gray-400 cursor-not-allowed' : editingProduct ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {uploading ? (<><i className="fa-solid fa-circle-notch fa-spin"></i><span>Memproses...</span></>)
                  : editingProduct ? (<><i className="fa-solid fa-floppy-disk"></i><span>Update Data</span></>)
                  : (<><i className="fa-solid fa-floppy-disk"></i><span>Simpan Data</span></>)}
              </button>
              {editingProduct && (
                <button type="button" onClick={resetForm} className="px-6 py-3 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition">Batal</button>
              )}
            </div>
          </form>
        </div>

        {/* Daftar Produk */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">📦 Daftar Produk ({products.length})</h2>
            <button onClick={fetchProducts} className="text-sm text-blue-600 hover:text-blue-800 font-medium"><i className="fa-solid fa-rotate-right mr-1"></i> Refresh</button>
          </div>
          {loading ? (
            <div className="text-center py-8"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-600 mb-3"></i><p className="text-gray-500">Memuat data produk...</p></div>
          ) : products.length === 0 ? (
            <div className="text-center py-12"><i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3"></i><p className="text-gray-500">Belum ada produk.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Gambar</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Harga</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Kategori</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Stok</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const stock = Number(product.stock) || 0;
                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition">
                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3"><img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" onError={(e) => { e.target.src = 'https://placehold.co/50/e2e8f0/475569?text=?'; }} /></td>
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{product.name}</td>
                        <td className="px-4 py-3 text-blue-700 font-semibold">Rp {(Number(product.price) || 0).toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{product.category}</span></td>
                        <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${stock === 0 ? 'bg-red-100 text-red-700' : stock <= 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{stock}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition" title="Edit"><i className="fa-solid fa-pen-to-square"></i></button>
                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded transition" title="Hapus"><i className="fa-solid fa-trash-can"></i></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}