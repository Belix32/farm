import { useParams, Link } from 'react-router-dom';
import { demoOrders, demoProducts } from '../shared';
import { formatPrice, getUnitLabel, formatDate, cn } from '../shared';
import { CheckCircle2, Package, Truck, MapPin, Clock, ArrowLeft } from 'lucide-react';

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const order = demoOrders.find(o => o.id === id) || demoOrders[0];

  const statusConfig = {
    pending: { label: 'Ожидает оплаты', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    paid: { label: 'Оплачен', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
    preparing: { label: 'Готовится', color: 'bg-orange-100 text-orange-700', icon: Package },
    ready: { label: 'Готов к выдаче', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    completed: { label: 'Выдан', color: 'bg-gray-100 text-gray-700', icon: CheckCircle2 },
    cancelled: { label: 'Отменён', color: 'bg-red-100 text-red-700', icon: Package },
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const DeliveryIcon = order.deliveryMethod === 'pickup' ? Package : Truck;
  const deliveryMethodLabel = order.deliveryMethod === 'pickup' ? 'Click & Collect (парковка)' : 'Доставка курьером';

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-3 rounded-xl', config.color.replace('text-', 'bg-').replace('700', '100'))}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Заказ {order.id.replace('ord-', '#')}</h1>
            <span className={cn('badge mt-1', config.color.replace('text-', 'bg-').replace('700', '100').replace('bg-', ''))}>
              {config.label}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <DeliveryIcon className="w-4 h-4" />
            <span>{deliveryMethodLabel}</span>
          </div>
          {order.pickupSpot && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Место {order.pickupSpot}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="card p-4">
        <h3 className="font-medium text-gray-900 mb-3">Статус выполнения</h3>
        <div className="space-y-3">
          {[
            { key: 'paid', label: 'Оплачен', time: order.createdAt },
            { key: 'preparing', label: 'Сборка', time: order.status !== 'paid' && order.status !== 'pending' ? order.updatedAt : null },
            { key: 'ready', label: 'Готов к выдаче', time: ['ready', 'completed'].includes(order.status) ? order.updatedAt : null },
            { key: 'completed', label: 'Выдан', time: order.status === 'completed' ? order.updatedAt : null },
          ].map((step, i) => {
            const isActive = ['paid', 'preparing', 'ready', 'completed'].indexOf(order.status) >= i;
            
            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  )}>
                    {isActive ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>
                  {i < 3 && <div className={cn('w-0.5 h-8 mt-1', isActive && i < 3 ? 'bg-green-500' : 'bg-gray-200')} />}
                </div>
                <div className="flex-1 pt-1">
                  <div className={cn('font-medium', isActive ? 'text-gray-900' : 'text-gray-500')}>{step.label}</div>
                  {step.time && <div className="text-xs text-gray-400">{formatDate(step.time)}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order items grouped by tenant */}
      <div className="space-y-4">
        {Object.entries(
          order.items.reduce((acc, item) => {
            if (!acc[item.tenantId]) {
              acc[item.tenantId] = { tenantName: item.tenantName, items: [], subtotal: 0 };
            }
            acc[item.tenantId].items.push(item);
            acc[item.tenantId].subtotal += item.price * item.quantity;
            return acc;
          }, {} as Record<string, { tenantName: string; items: typeof order.items; subtotal: number }>)
        ).map(([tenantId, group]) => (
          <div key={tenantId} className="card overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">{group.tenantName}</span>
              </div>
              <span className="font-semibold text-gray-900">{formatPrice(group.subtotal)}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {group.items.map(item => (
                <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.productId && (() => {
                      const p = demoProducts.find(p => p.id === item.productId);
                      return p ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : null;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-sm text-gray-500">{item.quantity} × {formatPrice(item.price)} / {getUnitLabel(item.unit)}</p>
                  </div>
                  <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Split payments visualization */}
      <div className="card p-4 bg-green-50 border-green-200">
        <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Сплит-платеж (виртуальное разделение)
        </h3>
        <div className="space-y-2">
          {order.splitPayments.map((split, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-green-700">{split.tenantName}</span>
              <span className="font-semibold text-green-900">{formatPrice(split.amount)}</span>
            </div>
          ))}
          <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-green-900">
            <span>Итого</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/picker" className="btn-primary flex-1">
          <Package className="w-4 h-4 mr-2" />
          Дашборд сборщика
        </Link>
        <Link to="/catalog" className="btn-secondary flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Продолжить покупки
        </Link>
      </div>
    </div>
  );
}