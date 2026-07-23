import { Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Admin */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-blue-900 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <Link to="/admin" className="block px-6 py-3 hover:bg-blue-800">
            <i className="fa-solid fa-box mr-2"></i> Produk
          </Link>
          <Link to="/admin/categories" className="block px-6 py-3 hover:bg-blue-800">
            <i className="fa-solid fa-folder mr-2"></i> Kategori
          </Link>
          <Link to="/" className="block px-6 py-3 hover:bg-blue-800">
            <i className="fa-solid fa-home mr-2"></i> Ke Website
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Dashboard Admin</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            <i className="fa-solid fa-sign-out-alt mr-2"></i> Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet /> {/* Dashboard content akan muncul di sini */}
        </main>
      </div>
    </div>
  );
}