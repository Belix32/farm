import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { demoTenants } from '../shared';
import { Store, Truck, Building2, Shield, Stethoscope, Package, Smartphone } from 'lucide-react';

const features = [
  { icon: Smartphone, title: 'B2C Маркетплейс', desc: 'Каталог магазинов, умная корзина, оплата через ЮKassa' },
  { icon: Package, title: 'Click & Collect', desc: 'Заказ онлайн — получение в багажнике на парковке' },
  { icon: Building2, title: 'B2B Хаб для HoReCa', desc: 'Оптовые цены, счета для юрлиц, доставка фурой' },
  { icon: Truck, title: 'Логистика поставщиков', desc: 'Бронирование ворот, тайм-слоты, учет фур' },
  { icon: Shield, title: 'Планшет охраны (СКУД)', desc: 'Список ожидаемых машин, кнопка «Пропустить»' },
  { icon: Stethoscope, title: 'Ветконтроль', desc: 'Уведомление при заезде мяса, выдача допуска' },
];

const demoScenario = [
  { step: 1, title: 'Покупатель', desc: 'Выбирает товары, оплачивает тестовой картой, выбирает «Выдача на парковке», нажимает «Я на месте №2»', icon: Smartphone },
  { step: 2, title: 'Сборщик', desc: 'Мгновенно получает push-уведомление с заказом #102, собирает продукты, передает в багажник', icon: Package },
  { step: 3, title: 'Поставщик', desc: 'Бронирует ворота №3 на 10:00 через календарь', icon: Truck },
  { step: 4, title: 'Охранник', desc: 'Видит фуру в планшете СКУД, нажимает «Пропустить»', icon: Shield },
  { step: 5, title: 'Ветврач', desc: 'Получает алерт о прибытии мяса, проверяет документы, выдает допуск', icon: Stethoscope },
];

export function HomePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">Добро пожаловать, {user.name}!</h1>
              <p className="text-green-100 mt-1">Роль: <span className="font-medium">{getRoleLabel(user.role)}</span></p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Store className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Quick actions based on role */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрый доступ</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getQuickActions(user.role).map(action => (
              <Link
                key={action.path}
                to={action.path}
                className="card p-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="p-2 bg-green-100 rounded-lg mb-3">
                  <action.icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">{action.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Demo scenario */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Демо-сценарий для инвестора</h2>
          <div className="space-y-3">
            {demoScenario.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-bold text-sm">{step}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">{title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-6">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features overview */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Возможности платформы</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-4 hover:shadow-card-hover transition-shadow">
                <div className="p-2 bg-gray-100 rounded-lg mb-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Not logged in - landing page
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-600 mb-6">
          <Store className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Единая цифровая платформа фермерского рынка</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
          Маркетплейс, Click & Collect, B2B-закупки, логистика фур и ветконтроль — в одном PWA приложении
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="btn-primary w-full sm:w-auto">
            Войти для демо
          </Link>
        </div>
      </div>

      {/* Demo scenario preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Как работает демо (2 устройства)</h2>
        <div className="space-y-4">
          {demoScenario.map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-700 font-bold text-sm">{step}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">{title}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-6">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Модули платформы</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-4 hover:shadow-card-hover transition-shadow">
              <div className="p-2 bg-gray-100 rounded-lg mb-3">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tenants preview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Демо-магазины на платформе</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {demoTenants.map(tenant => (
            <Link key={tenant.id} to="/catalog" className="card overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={tenant.imageUrl}
                  alt={tenant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-semibold">{tenant.name}</h3>
                  <p className="text-xs opacity-90">{tenant.category}</p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-600 line-clamp-2">{tenant.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    buyer: 'Покупатель',
    wholesaler: 'Оптовик (B2B)',
    supplier: 'Поставщик',
    security: 'Охранник (СКУД)',
    vet: 'Ветврач',
    picker: 'Сборщик',
  };
  return labels[role] || role;
}

function getQuickActions(role: string) {
  const actions: Record<string, Array<{ path: string; label: string; desc: string; icon: any }>> = {
    buyer: [
      { path: '/catalog', label: 'Каталог', desc: 'Выбрать товары', icon: Store },
      { path: '/cart', label: 'Корзина', desc: 'Оформить заказ', icon: Package },
    ],
    wholesaler: [
      { path: '/b2b', label: 'Оптовый каталог', desc: 'Цены по объемам', icon: Building2 },
      { path: '/b2b/checkout', label: 'Счет на оплату', desc: 'PDF для бухгалтерии', icon: Package },
    ],
    supplier: [
      { path: '/supplier', label: 'Бронирование', desc: 'Выбрать ворота и слот', icon: Truck },
    ],
    security: [
      { path: '/security', label: 'Планшет СКУД', desc: 'Пропуск фур', icon: Shield },
    ],
    vet: [
      { path: '/vet', label: 'Ветконтроль', desc: 'Проверка мяса', icon: Stethoscope },
    ],
    picker: [
      { path: '/picker', label: 'Дашборд сборщика', desc: 'Выдача заказов', icon: Package },
    ],
  };
  return actions[role] || [];
}