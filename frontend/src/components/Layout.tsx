import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuth';
import { Bus, Users, MapPin, Calendar, LayoutDashboard, LogOut, FileText, BarChart, CreditCard, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Buses', path: '/buses', icon: Bus },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Conductors', path: '/conductors', icon: Users },
    { name: 'Trips', path: '/trips', icon: MapPin },
    { name: 'Daily Entries', path: '/dailies', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      
      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out`}>
        <div className="p-5 flex items-center justify-center border-b border-gray-800">
          <div className="font-bold text-xl text-white text-center">
            Bus Opv
            <div className="text-xs text-gray-400 font-medium uppercase mt-1">Management</div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <link.icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold mr-3">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-sm font-medium text-gray-300 truncate">{user?.name}</div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center space-x-2 text-red-400 hover:bg-red-500 hover:text-white w-full py-2 rounded-md transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
