import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', icon: 'fa-house', label: 'Beranda' },
    { path: '/categories', icon: 'fa-grid-2', label: 'Kategori' },
    { path: '#', icon: 'fa-star', label: 'Unggulan' },
    { path: '#', icon: 'fa-handshake', label: 'Mitra' },
    { path: '#', icon: 'fa-circle-info', label: 'Tentang' },
    { path: '#', icon: 'fa-envelope', label: 'Kontak' },
  ];

  const bottomItems = [
    { icon: 'fa-circle-question', label: 'Bantuan' },
    { icon: 'fa-gear', label: 'Pengaturan' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-40">
      <div className="flex flex-col items-center py-6 gap-2 h-full">
        {/* Logo */}
        <Link to="/" className="p-2 mb-4">
          <div className="bg-blue-900 p-2.5 rounded-xl shadow-sm">
            <i className="fa-solid fa-mountain-sun text-white text-xl"></i>
          </div>
        </Link>

        <div className="w-10 h-px bg-gray-200 mb-4"></div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1 w-full px-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xl`}></i>
              <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="flex flex-col gap-1 w-full px-2 mb-4">
          {bottomItems.map((item, idx) => (
            <a
              key={idx}
              href="#"
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition"
            >
              <i className={`fa-solid ${item.icon} text-xl`}></i>
              <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}