import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { demoTenants, demoProducts, formatPrice, getUnitLabel } from '../shared';
import { Building2, Package, Search, X, ShoppingCart } from 'lucide-react';

export function B2BCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTenant, setSelectedTenant] = useState<string | null>(searchParams.get('shop'));
  const [searchQuery, setSearchQuery] = useState('');

  const tenantId = searchParams.get('shop');
  if (tenantId && !selectedTenant) {
    setSelectedTenant(tenantId);
  }

  // Get products with wholesale prices
  let products = demoProducts.filter(p => p.inStock && p.wholesalePrice);
  if (selectedTenant) {
    products = products.filter(p => p.tenantId === selectedTenant);
  }
  if (searchQuery) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const groupedProducts = selectedTenant
    ? { [selectedTenant]: products }
    : products.reduce((acc, p) => {
        if (!acc[p.tenantId]) acc[p.tenantId] = [];
        acc[p.tenantId].push(p);
        return acc;
      }, {} as Record<string, typeof products>);

  const clearFilters = () => {
    setSelectedTenant(null);
    setSearchQuery('');
    setSearchParams({});
  };

  const hasFilters = selectedTenant || searchQuery;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Оптовый каталог (B2B)</h1>
          <p className="text-sm text-gray-500">Цены за объем: коробки, паллеты, полутуши</p>
        </div>
        <Link to="/b2b/checkout" className="btn-primary flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Оформить заказ
        </Link>
      </div>

      {/* Info banner */}
      <div className="card p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">B2B режим активен</p>
            <p>Показаны оптовые цены (если задано minWholesaleQty). Единицы измерения: кг, коробки, паллеты, полутуши.</p>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="card p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={selectedTenant || ''}
            onChange={e => {
              const val = e.target.value;
              setSelectedTenant(val || null);
              setSearchParams(val ? { shop: val } : {});
            }}
            className="input w-full sm:w-48"
          >
            <option value="">Все поставщики</option>
            {demoTenants.filter(t => t.isActive).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <X className="w-3 h-3" />
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Products */}
      {Object.keys(groupedProducts).length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Товары не найдены</h3>
          <p className="text-gray-500 mt-1">Попробуйте изменить поиск или выбрать другого поставщика</p>
        </div>
      ) : (
        <>
          {Object.entries(groupedProducts).map(([tenantId, tenantProducts]) => {
            const tenant = demoTenants.find(t => t.id === tenantId);
            if (!tenant || tenantProducts.length === 0) return null;

            return (
              <section key={tenantId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Link to={`/b2b?shop=${tenantId}`} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${tenant.imageUrl})` }} />
                    <div>
                      <h2 className="font-semibold text-gray-900">{tenant.name}</h2>
                      <p className="text-xs text-gray-500">{tenantProducts.length} оптовых позиций</p>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tenantProducts.map(product => (
                    <B2BProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

function B2BProductCard({ product }: { product: typeof demoProducts[0] }) {
  const hasWholesale = !!(product.wholesalePrice && product.minWholesaleQty);
  const minWholesaleQty = product.minWholesaleQty ?? 0;
  const displayPrice = hasWholesale ? (product.wholesalePrice ?? product.price) : product.price;
  const displayUnit = product.unit;

  return (
    <div className="card overflow-hidden hover:shadow-card-hover transition-shadow">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">Нет в наличии</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
        <div className="mt-3 space-y-1">
          {hasWholesale && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Опт</span>
              <span>от {minWholesaleQty} {getUnitLabel(product.unit)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-700">{formatPrice(displayPrice)}</span>
              <span className="text-gray-500 ml-1">/{getUnitLabel(displayUnit)}</span>
            </div>
            {hasWholesale && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}/{getUnitLabel(product.unit)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}