import { useState, useEffect } from 'react';
import { demoOrders, demoProducts, formatPrice, getUnitLabel, cn, formatDate } from '../shared';
import { useSocket } from '../hooks/useSocket';
import { Package, CheckCircle2, MapPin, Bell, RefreshCw, Clock } from 'lucide-react';

export function PickerDashboardPage() {
  const { onOrderUpdate, emitOrderReady } = useSocket();
  const [orders, setOrders] = useState(demoOrders.filter(o => ['paid', 'preparing', 'ready'].includes(o.status)));
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    const unsubscribe = onOrderUpdate((updatedOrder: any) => {
      setOrders(prev => {
        const exists = prev.find(o => o.id === updatedOrder.id);
        if (exists) {
          return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        }
        return [...prev, updatedOrder];
      });
    });
    return unsubscribe;
  }, [onOrderUpdate]);

  const handleStatusChange = (orderId: string, newStatus: typeof orders[0]['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o));
    if (newStatus === 'ready') {
      emitOrderReady(orderId);
    }
  };

  const handlePickupComplete = (orderId: string) => {
    handleStatusChange(orderId, 'completed');
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  // Filter orders by status for tabs
  const statusTabs = [
    { key: 'paid', label: 'Новые', count: orders.filter(o => o.status === 'paid').length },
    { key: 'preparing', label: 'В сборке', count: orders.filter(o => o.status === 'preparing').length },
    { key: 'ready', label: 'Готовы к выдаче', count: orders.filter(o => o.status === 'ready').length },
  ];

  const [activeTab, setActiveTab] = useState<'paid' | 'preparing' | 'ready'>('paid');
  const filteredOrders = orders.filter(o => o.status === activeTab);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Дашборд сборщика</h1>
          <p className="text-sm text-gray-500">Управление выдачей заказов Click & Collect</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{orders.length} заказов</span>
          <button className="btn-secondary p-2" aria-label="Обновить">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn('ml-2 px-2 py-0.5 rounded-full text-xs', activeTab === tab.key ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Заказов нет</h3>
          <p className="text-gray-500 mt-1">Новые заказы появятся здесь автоматически</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Order detail modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowOrderDetail(false)}
          onStatusChange={handleStatusChange}
          onPickupComplete={handlePickupComplete}
        />
      )}
    </div>
  );
}

function OrderCard({ order, onClick, onStatusChange }: any) {
  const statusConfig = {
    paid: { label: 'Новый', color: 'bg-blue-100 text-blue-700', icon: Bell },
    preparing: { label: 'В сборке', color: 'bg-orange-100 text-orange-700', icon: Package },
    ready: { label: 'Готов к выдаче', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.paid;
  const Icon = config.icon;

  const nextStatus = order.status === 'paid' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'completed';

  return (
    <div className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', config.color.replace('text-', 'bg-').replace('700', '100'))}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-900">#{order.id.replace('ord-', '')}</span>
              <span className={cn('badge', config.color)}>{config.label}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{order.items.length} товаров · {formatPrice(order.totalAmount)}</p>
            {order.pickupSpot && (
              <p className="text-sm text-green-600 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Место {order.pickupSpot}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onStatusChange(order.id, nextStatus); }}
            className="btn-secondary text-sm"
            disabled={order.status === 'ready'}
          >
            {order.status === 'ready' ? 'Выдать' : 'Далее →'}
          </button>
        </div>
      </div>

      {/* Quick items preview */}
      <div className="mt-3 flex flex-wrap gap-2">
        {order.items.slice(0, 3).map((item: typeof order.items[0]) => (
          <span key={item.id} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
            {item.productName} ×{item.quantity}
          </span>
        ))}
        {order.items.length > 3 && (
          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">
            +{order.items.length - 3} еще
          </span>
        )}
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange, onPickupComplete }: any) {
  const statusConfig = {
    paid: { label: 'Новый', color: 'bg-blue-100 text-blue-700' },
    preparing: { label: 'В сборке', color: 'bg-orange-100 text-orange-700' },
    ready: { label: 'Готов к выдаче', color: 'bg-green-100 text-green-700' },
    completed: { label: 'Выдан', color: 'bg-gray-100 text-gray-700' },
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.paid;
  const nextStatus = order.status === 'paid' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <span className="font-mono font-semibold text-gray-900">#{order.id.replace('ord-', '')}</span>
            <span className={cn('badge ml-2', config.color)}>{config.label}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {/* Customer info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">Место выдачи: {order.pickupSpot || 'Не указано'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Создан: {formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            <h3 className="font-medium text-gray-900">Состав заказа</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {order.items.map((item: typeof order.items[0]) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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

          {/* Split payments */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Сплит-платеж:</h4>
            <div className="space-y-1 text-sm">
              {order.splitPayments.map((split: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-green-700">{split.tenantName}</span>
                  <span className="font-semibold text-green-900">{formatPrice(split.amount)}</span>
                </div>
              ))}
              <div className="border-t border-green-200 pt-1 flex justify-between font-bold text-green-900">
                <span>Итого</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            {order.status !== 'completed' && (
              <button
                onClick={() => { onStatusChange(order.id, nextStatus); onClose(); }}
                className="btn-primary w-full"
              >
                {order.status === 'ready' ? 'Заказ выдан покупателю' : `Перевести в "${nextStatus === 'preparing' ? 'В сборке' : nextStatus === 'ready' ? 'Готов к выдаче' : 'Выдан'}"`}
              </button>
            )}
            {order.status === 'ready' && (
              <button
                onClick={() => { onPickupComplete(order.id); }}
                className="btn-primary w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Подтвердить выдачу
              </button>
            )}
            {order.status === 'completed' && (
              <p className="text-center text-green-600 font-medium">Заказ успешно выдан покупателю</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}