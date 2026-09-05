import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Truck, Store, Shield, Stethoscope, Package, Smartphone, Building2 } from 'lucide-react';
import { demoUsers } from '../shared';

const roles = [
  { role: 'buyer' as const, label: 'Покупатель (B2C)', icon: Smartphone, description: 'Каталог, корзина, Click & Collect', color: 'bg-green-100 text-green-700' },
  { role: 'wholesaler' as const, label: 'Оптовик (B2B)', icon: Building2, description: 'Оптовый каталог, счет на оплату', color: 'bg-blue-100 text-blue-700' },
  { role: 'supplier' as const, label: 'Поставщик', icon: Truck, description: 'Бронирование ворот и слотов', color: 'bg-orange-100 text-orange-700' },
  { role: 'security' as const, label: 'Охранник (СКУД)', icon: Shield, description: 'Планшет пропуска фур', color: 'bg-gray-100 text-gray-700' },
  { role: 'vet' as const, label: 'Ветврач', icon: Stethoscope, description: 'Ветконтроль прибывшего мяса', color: 'bg-red-100 text-red-700' },
  { role: 'picker' as const, label: 'Сборщик заказов', icon: Package, description: 'Дашборд выдачи на парковке', color: 'bg-purple-100 text-purple-700' },
];

export function DemoLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (role: string) => {
    await login(role as any);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4 safe-area-inset-bottom safe-area-inset-top">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Фермерский рынок Брянск</h1>
          <p className="text-gray-500 mt-1">Демо-вход для инвестора</p>
        </div>

        {/* Role cards */}
        <div className="space-y-3" role="list" aria-label="Выбор роли для демо-входа">
          {roles.map(({ role, label, icon: Icon, description, color }) => {
            const user = demoUsers.find(u => u.role === role);
            return (
              <button
                key={role}
                onClick={() => handleLogin(role)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-gray-50 transition-all text-left"
                role="listitem"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{label}</h3>
                    <p className="text-sm text-gray-500 truncate">{description}</p>
                    {user && (
                      <p className="text-xs text-gray-400 mt-1">{user.name}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Demo hint */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Демо-сценарий:</span> выберите роль «Покупатель» на смартфоне,
            а «Сборщик» / «Охранник» / «Ветврач» — на ноутбуке.
          </p>
        </div>
      </div>
    </div>
  );
}