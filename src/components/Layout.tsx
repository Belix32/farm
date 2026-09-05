import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn, getRoleLabel } from '../shared';
import { LogOut, Menu, X, Store, User, Truck, Shield, Stethoscope, Package, Building2, Smartphone } from 'lucide-react';
import { useState } from 'react';

const roleIcons: Record<string, any> = {
  buyer: Smartphone,
  wholesaler: Building2,
  supplier: Truck,
  security: Shield,
  vet: Stethoscope,
  picker: Package,
};

const roleColors: Record<string, string> = {
  buyer: 'text-green-600 bg-green-100',
  wholesaler: 'text-blue-600 bg-blue-100',
  supplier: 'text-orange-600 bg-orange-100',
  security: 'text-gray-600 bg-gray-100',
  vet: 'text-red-600 bg-red-100',
  picker: 'text-purple-600 bg-purple-100',
};

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <Outlet />;

  const Icon = roleIcons[user.role] || User;
  const roleColor = roleColors[user.role] || 'text-gray-600 bg-gray-100';

  const navigation = [
    { path: '/', label: 'Главная', roles: ['buyer', 'wholesaler', 'supplier', 'security', 'vet', 'picker'] },
    { path: '/catalog', label: 'Каталог', roles: ['buyer'] },
    { path: '/cart', label: 'Корзина', roles: ['buyer'] },
    { path: '/picker', label: 'Сборка заказов', roles: ['picker'] },
    { path: '/b2b', label: 'B2B Каталог', roles: ['wholesaler'] },
    { path: '/supplier', label: 'Бронирование', roles: ['supplier'] },
    { path: '/security', label: 'Планшет СКУД', roles: ['security'] },
    { path: '/vet', label: 'Ветконтроль', roles: ['vet'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">Фермерский рынок</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50">
                <Icon className={`w-4 h-4 ${roleColor.split(' ')[0]}`} />
                <span className="text-xs font-medium text-gray-700">{getRoleLabel(user.role)}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Меню"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100">
              <nav className="flex flex-col gap-2">
                {navigation.map(item => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    className={cn(
                      'px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors',
                      location.pathname === item.path
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-lg text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Выйти
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-4 py-4 pb-20">
        <Outlet />
      </main>
    </div>
  );
}