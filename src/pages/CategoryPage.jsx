import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';

export default function CategoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Data Kategori dengan Ilustrasi SVG
  const categories = [
    { 
      id: 1, 
      name: 'MAKANAN & MINUMAN', 
      sub: '', 
      icon: (
        <svg viewBox="0 0 100 100" className="w-32 h-24">
          <circle cx="30" cy="35" r="20" fill="#F59E0B" opacity="0.2"/>
          <rect x="15" y="20" width="30" height="35" rx="3" fill="#D97706"/>
          <circle cx="30" cy="35" r="8" fill="#92400E"/>
          <rect x="35" y="15" width="20" height="25" rx="2" fill="#78350F"/>
          <rect x="38" y="10" width="14" height="8" rx="1" fill="#92400E"/>
          <ellipse cx="55" cy="45" rx="12" ry="8" fill="#FDE68A"/>
          <ellipse cx="55" cy="45" rx="8" ry="5" fill="#F59E0B"/>
          <path d="M 65 30 Q 75 25 80 35" stroke="#D97706" strokeWidth="3" fill="none"/>
          <circle cx="70" cy="55" r="10" fill="#FDE68A"/>
          <path d="M 65 55 Q 70 50 75 55" stroke="#D97706" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    { 
      id: 2, 
      name: 'KERAJINAN TANGAN', 
      sub: '10 Sub-kategori', 
      icon: (
        <svg viewBox="0 0 120 100" className="w-32 h-24">
          <rect x="10" y="15" width="50" height="70" rx="3" fill="#92400E"/>
          <path d="M 15 25 L 55 25 M 15 35 L 55 35 M 15 45 L 55 45 M 15 55 L 55 55 M 15 65 L 55 65" stroke="#FDE68A" strokeWidth="2"/>
          <path d="M 20 15 Q 35 40 50 15" stroke="#FDE68A" strokeWidth="3" fill="none"/>
          <ellipse cx="85" cy="30" rx="15" ry="20" fill="#78350F"/>
          <path d="M 75 20 Q 85 10 95 20" stroke="#92400E" strokeWidth="2" fill="none"/>
          <rect x="65" y="55" width="40" height="30" rx="3" fill="#B45309"/>
          <circle cx="75" cy="65" r="5" fill="#FDE68A"/>
          <path d="M 70 75 Q 85 85 100 75" stroke="#FDE68A" strokeWidth="2" fill="none"/>
          <path d="M 60 40 L 70 50" stroke="#92400E" strokeWidth="3"/>
          <ellipse cx="65" cy="35" rx="8" ry="12" fill="#FDE68A"/>
        </svg>
      )
    },
    { 
      id: 3, 
      name: 'FASHION', 
      sub: '', 
      icon: (
        <svg viewBox="0 0 120 100" className="w-32 h-24">
          <path d="M 20 20 L 35 15 L 45 25 L 55 15 L 70 20 L 65 40 L 75 45 L 70 90 L 50 90 L 50 45 L 60 40 Z" fill="#F59E0B"/>
          <path d="M 25 25 L 35 30 M 30 35 L 40 40 M 35 45 L 45 50" stroke="#92400E" strokeWidth="2"/>
          <path d="M 75 25 L 85 20 L 95 25 L 100 40 L 95 90 L 75 90 Z" fill="#0EA5E9"/>
          <path d="M 78 30 L 88 30 M 78 40 L 88 40 M 78 50 L 88 50" stroke="#FFF" strokeWidth="2"/>
          <rect x="45" y="50" width="30" height="35" rx="2" fill="#B45309"/>
          <path d="M 50 60 Q 60 65 70 60" stroke="#FDE68A" strokeWidth="2" fill="none"/>
          <circle cx="85" cy="60" r="8" fill="#F59E0B"/>
          <path d="M 80 55 L 90 65 M 90 55 L 80 65" stroke="#FFF" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      id: 4, 
      name: 'PERTANIAN & PERIKANAN', 
      sub: '', 
      icon: (
        <svg viewBox="0 0 120 100" className="w-32 h-24">
          <ellipse cx="30" cy="25" rx="15" ry="10" fill="#78350F"/>
          <ellipse cx="30" cy="25" rx="10" ry="6" fill="#92400E"/>
          <path d="M 25 15 Q 30 5 35 15" stroke="#10B981" strokeWidth="3" fill="none"/>
          <path d="M 28 12 Q 30 8 32 12" stroke="#10B981" strokeWidth="2" fill="none"/>
          <circle cx="80" cy="20" r="8" fill="#F97316"/>
          <path d="M 75 15 Q 80 10 85 15" stroke="#10B981" strokeWidth="2" fill="none"/>
          <ellipse cx="60" cy="65" rx="25" ry="15" fill="#0EA5E9"/>
          <path d="M 45 60 Q 60 70 75 60" stroke="#FFF" strokeWidth="2" fill="none"/>
          <path d="M 50 55 L 55 60 L 50 65" stroke="#FFF" strokeWidth="2" fill="none"/>
          <rect x="85" y="50" width="12" height="15" rx="2" fill="#10B981"/>
          <ellipse cx="91" cy="48" rx="8" ry="6" fill="#10B981"/>
          <path d="M 88 45 Q 91 40 94 45" stroke="#059669" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    { 
      id: 5, 
      name: 'WISATA & PENGALAMAN', 
      sub: '', 
      icon: (
        <svg viewBox="0 0 120 100" className="w-32 h-24">
          <path d="M 20 70 L 40 40 L 60 65 L 80 35 L 100 70 Z" fill="#93C5FD"/>
          <path d="M 25 70 L 40 50 L 55 68" fill="#60A5FA"/>
          <path d="M 65 70 L 80 45 L 95 70" fill="#3B82F6"/>
          <circle cx="95" cy="25" r="8" fill="#FBBF24"/>
          <circle cx="45" cy="35" r="12" fill="#3B82F6"/>
          <path d="M 40 30 L 45 35 L 50 45" stroke="#FFF" strokeWidth="2" fill="none"/>
          <circle cx="48" cy="32" r="3" fill="#FFF"/>
        </svg>
      )
    },
    { 
      id: 6, 
      name: 'HERBAL & KESEHATAN', 
      sub: '', 
      icon: (
        <svg viewBox="0 0 120 100" className="w-32 h-24">
          <rect x="20" y="30" width="25" height="50" rx="3" fill="#D97706"/>
          <rect x="23" y="33" width="19" height="20" rx="2" fill="#FDE68A"/>
          <path d="M 28 40 L 37 40 M 28 45 L 37 45 M 28 50 L 34 50" stroke="#92400E" strokeWidth="2"/>
          <rect x="55" y="25" width="25" height="55" rx="3" fill="#059669"/>
          <rect x="58" y="28" width="19" height="25" rx="2" fill="#6EE7B7"/>
          <path d="M 63 35 L 72 35 M 63 40 L 72 40 M 63 45 L 69 45" stroke="#047857" strokeWidth="2"/>
          <circle cx="95" cy="45" r="18" fill="#3B82F6"/>
          <path d="M 88 45 L 95 38 L 102 45 L 95 52 Z" fill="#FFF"/>
          <path d="M 95 38 L 95 52 M 88 45 L 102 45" stroke="#3B82F6" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      id: 7, 
      name: 'DEKORASI RUMAH', 
      sub: '', 
      icon: (
        <svg viewBox="0 0 120 100" className="w-32 h-24">
          <rect x="15" y="40" width="35" height="45" rx="2" fill="#92400E"/>
          <path d="M 15 40 L 32 25 L 50 40" fill="#B45309"/>
          <path d="M 20 50 L 45 50 M 20 60 L 45 60 M 20 70 L 45 70" stroke="#FDE68A" strokeWidth="2"/>
          <rect x="65" y="35" width="30" height="50" rx="2" fill="#FDE68A"/>
          <path d="M 68 35 L 80 25 L 92 35" fill="#F59E0B"/>
          <path d="M 70 45 L 90 45 M 70 55 L 90 55 M 70 65 L 90 65" stroke="#92400E" strokeWidth="2"/>
          <rect x="73" y="72" width="14" height="13" fill="#92400E"/>
        </svg>
      )
    },
    { 
      id: 8, 
      name: 'ALAT MUSIK & SENI', 
      sub: '', 
      icon: (
        <svg viewBox="0 0 120 100" className="w-32 h-24">
          <rect x="15" y="20" width="8" height="65" fill="#92400E"/>
          <rect x="28" y="20" width="8" height="65" fill="#92400E"/>
          <rect x="41" y="20" width="8" height="65" fill="#92400E"/>
          <path d="M 15 30 L 23 30 M 15 40 L 23 40 M 15 50 L 23 50" stroke="#FDE68A" strokeWidth="2"/>
          <path d="M 28 30 L 36 30 M 28 40 L 36 40 M 28 50 L 36 50" stroke="#FDE68A" strokeWidth="2"/>
          <path d="M 41 30 L 49 30 M 41 40 L 49 40 M 41 50 L 49 50" stroke="#FDE68A" strokeWidth="2"/>
          <ellipse cx="85" cy="50" rx="20" ry="25" fill="#DC2626"/>
          <path d="M 75 40 Q 85 30 95 40" stroke="#FDE68A" strokeWidth="2" fill="none"/>
          <circle cx="78" cy="48" r="4" fill="#FFF"/>
          <circle cx="92" cy="48" r="4" fill="#FFF"/>
          <path d="M 80 58 Q 85 62 90 58" stroke="#FFF" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    { 
      id: 9, 
      name: 'KOSMETIK LOKAL', 
      sub: '', 
      icon: (
        <svg viewBox="0 0 120 100" className="w-32 h-24">
          <rect x="20" y="25" width="20" height="55" rx="3" fill="#10B981"/>
          <rect x="23" y="28" width="14" height="20" rx="2" fill="#6EE7B7"/>
          <path d="M 26 35 L 34 35 M 26 40 L 34 40" stroke="#059669" strokeWidth="2"/>
          <ellipse cx="30" cy="22" rx="8" ry="5" fill="#10B981"/>
          <rect x="55" y="35" width="25" height="40" rx="2" fill="#F472B6"/>
          <rect x="58" y="38" width="19" height="15" rx="2" fill="#FBCFE8"/>
          <path d="M 63 45 L 72 45" stroke="#EC4899" strokeWidth="2"/>
          <ellipse cx="67" cy="30" rx="10" ry="8" fill="#FBCFE8"/>
          <path d="M 62 28 Q 67 23 72 28" stroke="#F472B6" strokeWidth="2" fill="none"/>
          <rect x="88" y="45" width="15" height="30" rx="2" fill="#A78BFA"/>
          <ellipse cx="95" cy="42" rx="6" ry="4" fill="#C4B5FD"/>
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:ml-20">
      
      {/* ===== SIDEBAR NAVIGASI KIRI (FIXED) ===== */}
      <aside className="hidden md:flex flex-col bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-40">
        <div className="flex flex-col items-center py-4 gap-1 mt-11 h-full">
          <div className="w-20 h-px bg-gray-300 my-3"></div>
          
          {/* Main Navigation */}
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
                key={item.label} // ✅ DIPERBAIKI: Menggunakan label yang unik
                to={item.path}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition ${
                  location.pathname === item.path
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                {/* ✅ DIPERBAIKI: Hanya tampilkan indikator jika path cocok DAN bukan '#' */}
                {location.pathname === item.path && item.path !== '#' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-blue-600 rounded-r"></div>
                )}
                <i className={`fa-solid ${item.icon} text-xl`}></i>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Actions - Bantuan & Logout */}
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
        {/* ✅ DIPERBAIKI: Padding responsif sama seperti Landing.jsx (bukan px-60) */}
        <div className="px-4 md:px-8 lg:px-12 xl:px-20 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo - Selalu muncul */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-blue-900 p-2 rounded-lg">
                <i className="fa-solid fa-mountain-sun text-white text-2xl"></i>
              </div>
              <div className="leading-tight">
                <h1 className="text-lg font-bold text-blue-900">UMKM</h1>
                <p className="text-[10px] text-blue-700 font-semibold tracking-wider">BANYUWANGI</p>
              </div>
            </Link>

            {/* Desktop Navigation - Hidden di mobile */}
            <nav className="hidden lg:flex gap-4 xl:gap-6 text-sm font-semibold">
              <Link to="/" className="text-gray-600 hover:text-blue-700 transition">Beranda</Link>
              <Link to="/categories" className="text-blue-700 border-b-2 border-blue-700 pb-0.5">Kategori Produk</Link>
              <Link to="/unggulan" className="text-gray-600 hover:text-blue-700 transition">Produk Unggulan</Link>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Mitra UMKM</a>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Tentang Kami</a>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition">Kontak</a>
            </nav>

            {/* Search - Hidden di mobile, muncul di tablet+ */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden w-full">
                <input 
                  type="text" 
                  placeholder="Cari produk..." 
                  className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
                />
                <button className="bg-blue-700 text-white px-4 py-2 hover:bg-blue-800 transition">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>

            {/* Actions - Cart & Auth */}
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => navigate('/cart')} className="relative p-2 text-gray-600 hover:text-blue-700 transition">
                <i className="fa-solid fa-cart-shopping text-lg md:text-xl"></i>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
              </button>
              
              {loading ? (
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

          {/* Mobile Search - Hanya muncul di mobile */}
          <div className="md:hidden mt-3">
            <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
              <input 
                type="text" 
                placeholder="Cari..." 
                className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
              />
              <button className="bg-blue-700 text-white px-3 py-2">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="px-4 md:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Daftar Lengkap Kategori Produk</h1>
          <p className="text-gray-500">Jelajahi berbagai kategori produk UMKM Banyuwangi</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group p-6"
            >
              {/* Icon Area */}
              <div className="flex items-center justify-center mb-4">
                {cat.icon}
              </div>

              {/* Info Area */}
              <div className="text-center">
                <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1 uppercase tracking-wide">
                  {cat.name}
                </h3>
                {cat.sub && (
                  <p className="text-xs text-gray-400">
                    {cat.sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-gray-200 mt-16 pt-10 pb-6">
        <div className="px-4 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full opacity-60"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-full opacity-60"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-full opacity-60"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-full opacity-60"></div>
          </div>
          <p className="text-xs text-gray-500 mb-2">© 2024 Dinas Koperasi & UMKM Banyuwangi.</p>
        </div>
      </footer>
    </div>
  );
}