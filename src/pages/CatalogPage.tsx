import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { demoTenants, demoProducts } from '../shared';
import { useCart } from '../hooks/useCart';
import { formatPrice, getUnitLabel } from '../shared';
import { Store, Plus, ShoppingCart, Filter, X } from 'lucide-react';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem, getTotalItems } = useCart();
  const [selectedTenant, setSelectedTenant] = useState<string | null>(searchParams.get('shop'));
  const [searchQuery, setSearchQuery] = useState('');

  const tenantId = searchParams.get('shop');
  if (tenantId && !selectedTenant) {
    setSelectedTenant(tenantId);
  }

  // Get products
  let products = demoProducts.filter(p => p.inStock);
  if (selectedTenant) {
    products = products.filter(p => p.tenantId === selectedTenant);
  }
  if (searchQuery) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Group by tenant if no tenant selected
  const groupedProducts = selectedTenant
    ? { [selectedTenant]: products }
    : products.reduce((acc, p) => {
        if (!acc[p.tenantId]) acc[p.tenantId] = [];
        acc[p.tenantId].push(p);
        return acc;
      }, {} as Record<string, typeof products>);

  const handleAddToCart = (product: typeof products[0]) => {
    addItem(product, 1);
    // Toast notification would go here
  };

  const clearFilters = () => {
    setSelectedTenant(null);
    setSearchQuery('');
    setSearchParams({});
  };

  const hasFilters = selectedTenant || searchQuery;

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Каталог товаров</h1>
          <p className="text-sm text-gray-500">Выберите магазин или поищите товар</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="btn-secondary relative">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Корзина
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="card p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            <option value="">Все магазины</option>
            {demoTenants.filter(t => t.isActive).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
            <X className="w-3 h-3" />
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Products */}
      {Object.keys(groupedProducts).length === 0 ? (
        <div className="card p-12 text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Товары не найдены</h3>
          <p className="text-gray-500 mt-1">Попробуйте изменить поиск или выбрать другой магазин</p>
        </div>
      ) : (
        <>
          {Object.entries(groupedProducts).map(([tenantId, tenantProducts]) => {
            const tenant = demoTenants.find(t => t.id === tenantId);
            if (!tenant || tenantProducts.length === 0) return null;

            return (
              <section key={tenantId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Link to={`/catalog?shop=${tenantId}`} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${tenant.imageUrl})` }} />
                    <div>
                      <h2 className="font-semibold text-gray-900">{tenant.name}</h2>
                      <p className="text-xs text-gray-500">{tenantProducts.length} товаров</p>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tenantProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
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

function ProductCard({ product, onAddToCart }: { product: typeof demoProducts[0]; onAddToCart: (p: typeof product) => void }) {
  return (
    <Link to={`/catalog?shop=${product.tenantId}`} className="card overflow-hidden hover:shadow-card-hover transition-shadow group" onClick={e => e.preventDefault()}>
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-green-700">{formatPrice(product.price)}</span>
            <span className="text-gray-500 ml-1">/{getUnitLabel(product.unit)}</span>
          </div>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
            className="btn-primary p-2"
            disabled={!product.inStock}
            aria-label={`Добавить ${product.name} в корзину`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}