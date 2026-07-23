import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      navigate('/'); // ✅ Redirect ke Beranda
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`, // ✅ Redirect ke Beranda
      },
    });
    if (error) alert('Error Google Login: ' + error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4"><i className="fa-solid fa-user-lock text-4xl text-blue-600"></i></div>
          <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang</h2>
          <p className="text-blue-100 text-sm">Login ke Katalog UMKM Banyuwangi</p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2"><i className="fa-solid fa-envelope mr-2 text-blue-600"></i>Email</label>
              <div className="relative">
                <input type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
                <i className="fa-solid fa-at absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2"><i className="fa-solid fa-lock mr-2 text-blue-600"></i>Password</label>
              <div className="relative">
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
                <i className="fa-solid fa-key absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Memproses...</span> : <span className="flex items-center justify-center"><i className="fa-solid fa-right-to-bracket mr-2"></i>Login</span>}
            </button>
          </form>

          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-medium"><i className="fa-solid fa-share-nodes mr-2"></i>Atau login dengan</span></div></div>

          <button onClick={handleGoogleLogin} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group">
            <i className="fa-brands fa-google text-red-500 text-xl group-hover:scale-110 transition-transform"></i>
            <span>Continue with Google</span>
          </button>

          <p className="text-center mt-8 text-gray-600">Belum punya akun? <Link to="/register" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition">Daftar Sekarang</Link></p>
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center"><p className="text-xs text-gray-500"><i className="fa-solid fa-shield-halved mr-1 text-green-500"></i>Login aman dengan enkripsi SSL</p></div>
      </div>
    </div>
  );
}