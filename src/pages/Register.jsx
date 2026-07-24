import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

      const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    // 1. Error nyata (misal password terlalu pendek, format email salah)
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // 2. ✅ DETEKSI SUKSES PALSU: email sudah pernah terdaftar sebelumnya
    //    (Supabase tidak membuat user baru, tapi juga tidak kasih error)
    if (data?.user?.identities && data.user.identities.length === 0) {
      alert('Email ini sudah terdaftar sebelumnya. Silakan login, atau pakai email lain.');
      navigate('/login');
      setLoading(false);
      return;
    }

    // 3. User BENAR-BENAR baru dibuat
    if (data.session) {
      // Akun langsung aktif (konfirmasi email mati) → ke halaman login
      alert('Registrasi berhasil! Silakan login dengan akun kamu.');
    } else {
      // Konfirmasi email nyala → suruh cek email
      alert('Registrasi berhasil! Cek email kamu untuk konfirmasi, lalu login.');
    }
    navigate('/login'); 
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-teal-600 to-cyan-600 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <i className="fa-solid fa-user-plus text-4xl text-green-600"></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Buat Akun Baru
          </h2>
          <p className="text-green-100 text-sm">
            Bergabung dengan UMKM Banyuwangi
          </p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fa-solid fa-envelope mr-2 text-green-600"></i>
                Email
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="nama@email.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                />
                <i className="fa-solid fa-at absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fa-solid fa-lock mr-2 text-green-600"></i>
                Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Minimal 6 karakter" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  minLength="6"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                />
                <i className="fa-solid fa-key absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-user-plus mr-2"></i>
                  Daftar Akun
                </span>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Sudah punya akun?{' '}
            <Link 
              to="/login" 
              className="text-green-600 font-bold hover:text-green-800 hover:underline transition"
            >
              Login disini
            </Link>
          </p>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            <i className="fa-solid fa-shield-halved mr-1 text-green-500"></i>
            Akun terlindungi dengan enkripsi
          </p>
        </div>
      </div>
    </div>
  );
}