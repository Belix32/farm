import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { demoProducts, demoTenants, formatPrice, getUnitLabel, cn } from '../shared';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Truck, Package } from 'lucide-react';

export function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Корзина пуста</h2>
        <p className="text-gray-500 mt-2">Добавьте товары из каталога</p>
        <Link to="/catalog" className="btn-primary mt-6 inline-flex">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Перейти в каталог
        </Link>
      </div>
    );
  }

  // Group items by tenant
  const itemsByTenant = items.reduce((acc, item) => {
    const product = demoProducts.find(p => p.id === item.productId);
    const tenantId = product?.tenantId || 'unknown';
    if (!acc[tenantId]) {
      acc[tenantId] = { tenant: demoTenants.find(t => t.id === tenantId), items: [], subtotal: 0 };
    }
    acc[tenantId].items.push({ ...item, product });
    acc[tenantId].subtotal += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { tenant: typeof demoTenants[0] | undefined; items: Array<typeof items[0] & { product?: typeof demoProducts[0] }>; subtotal: number }>);

  const totalPrice = getTotalPrice();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Корзина ({items.length})</h1>
        <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700">Очистить</button>
      </div>

      {/* Items grouped by tenant */}
      <div className="space-y-4">
        {Object.entries(itemsByTenant).map(([tenantId, group]) => (
          <div key={tenantId} className="card overflow-hidden">
            {/* Tenant header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
              {group.tenant && (
                <div className="w-8 h-8 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${group.tenant.imageUrl})` }} />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{group.tenant?.name || 'Неизвестный магазин'}</h3>
                <p className="text-xs text-gray-500">{group.items.length} товаров · {formatPrice(group.subtotal)}</p>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
              {group.items.map(({ product, ...item }) => (
                <div key={item.productId} className="p-4 flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {product?.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{product?.name || 'Товар'}</h4>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} / {getUnitLabel(product?.unit || 'piece')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 rounded border border-gray-300 hover:bg-gray-100"
                      aria-label="Уменьшить количество"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 rounded border border-gray-300 hover:bg-gray-100"
                      aria-label="Увеличить количество"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 ml-2"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tenant subtotal */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <span className="font-medium text-gray-900">Итого: {formatPrice(group.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery method */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Способ получения</h3>
        <div className="grid grid-cols-2 gap-3">
          <DeliveryOption
            id="courier"
            icon={Truck}
            title="Доставка курьером"
            desc="Яндекс.Доставка к двери"
            price="От 200₽"
          />
          <DeliveryOption
            id="pickup"
            icon={Package}
            title="Click & Collect"
            desc="Заберу сам на парковке"
            price="Бесплатно"
            recommended
          />
        </div>
      </div>

      {/* Total and checkout */}
      <div className="card p-4 sticky bottom-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Товары</span>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Доставка</span>
            <span className="font-medium">Бесплатно</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
            <span>Итого</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
        <Link to="/checkout" className="btn-primary w-full">
          Оформить заказ
        </Link>
      </div>
    </div>
  );
}

function DeliveryOption({ id, icon: Icon, title, desc, price, recommended }: {
  id: string;
  icon: any;
  title: string;
  desc: string;
  price: string;
  recommended?: boolean;
}) {
  return (
    <label className={cn(
      'relative p-4 rounded-xl border-2 cursor-pointer transition-colors',
      recommended
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-green-300'
    )}>
      <input type="radio" name="delivery" value={id} className="sr-only" defaultChecked={recommended} />
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', recommended ? 'bg-green-100' : 'bg-gray-100')}>
          <Icon className={cn('w-5 h-5', recommended ? 'text-green-600' : 'text-gray-600')} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{title}</span>
            {recommended && <span className="badge-green">Рекомендуем</span>}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
        </div>
        <span className="text-sm font-medium text-gray-700">{price}</span>
      </div>
      {recommended && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        </div>
      )}
    </label>
  );
}