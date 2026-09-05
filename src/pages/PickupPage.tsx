import { useParams, Link } from 'react-router-dom';
import { demoOrders, demoProducts } from '../shared';
import { formatPrice, getUnitLabel, cn } from '../shared';
import { Package, MapPin, Truck, CheckCircle2, ArrowLeft, Bell } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useEffect, useState } from 'react';

export function PickupPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { emitPickupArrived } = useSocket();
  const [order, setOrder] = useState(() => demoOrders.find(o => o.id === orderId) || demoOrders[0]);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const found = demoOrders.find(o => o.id === orderId);
    if (found) setOrder(found);
  }, [orderId]);

  const handleArrived = () => {
    setArrived(true);
    emitPickupArrived(orderId || '', '№2');
    // Update order status
    setOrder(prev => ({ ...prev, status: 'ready' }));
  };

  const statusConfig = {
    pending: { label: 'Ожидает оплаты', color: 'bg-yellow-100 text-yellow-700' },
    paid: { label: 'Оплачен', color: 'bg-blue-100 text-blue-700' },
    preparing: { label: 'Готовится', color: 'bg-orange-100 text-orange-700' },
    ready: { label: 'Готов к выдаче', color: 'bg-green-100 text-green-700' },
    completed: { label: 'Выдан', color: 'bg-gray-100 text-gray-700' },
    cancelled: { label: 'Отменён', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Click & Collect</h1>
            <p className="text-sm text-gray-500">Заказ {order.id.replace('ord-', '#')}</p>
          </div>
          <span className={cn('badge', config.color)}>{config.label}</span>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Ваше место: <span className="font-mono">№2</span></p>
              <p className="text-sm text-green-600">Сборщик увидит вашу геолокацию</p>
            </div>
          </div>

          {!arrived ? (
            <button
              onClick={handleArrived}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Я на парковке, место №2 — вызвать сборщика
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Уведомление отправлено сборщику!</span>
            </div>
          )}
        </div>
      </div>

      {/* What happens next */}
      <div className="card p-4">
        <h3 className="font-medium text-gray-900 mb-3">Что происходит дальше</h3>
        <div className="space-y-3">
          <StepRow step={1} icon={Bell} title="Вы нажали кнопку" desc="Сборщик получил push-уведомление с вашим заказом и местом парковки" completed={arrived} />
          <StepRow step={2} icon={Package} title="Сборка заказа" desc="Сборщик проходит по магазинам, собирает товары по списку" completed={order.status === 'ready' || order.status === 'completed'} />
          <StepRow step={3} icon={Truck} title="Подъезд к машине" desc="Сборщик привозит заказ к вашему багажнику на месте №2" completed={order.status === 'completed'} />
          <StepRow step={4} icon={CheckCircle2} title="Передача и завершение" desc="Проверяете товары, подтверждаете получение — заказ закрыт" completed={order.status === 'completed'} />
        </div>
      </div>

      {/* Order details */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Состав заказа</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map(item => (
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
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between font-bold">
          <span>Итого</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      {/* Split payments */}
      <div className="card p-4 bg-green-50 border-green-200">
        <h3 className="font-medium text-green-800 mb-2">Платеж распределен между арендаторами:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {order.splitPayments.map((split, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-green-700">{split.tenantName}</span>
              <span className="font-semibold text-green-900">{formatPrice(split.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <Link to="/" className="btn-secondary w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        На главную
      </Link>
    </div>
  );
}

function StepRow({ step, icon: Icon, title, desc, completed }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
          completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
        )}>
          {completed ? <CheckCircle2 className="w-5 h-5" /> : step}
        </div>
        <div className={cn('w-0.5 h-8 mt-1', completed ? 'bg-green-500' : 'bg-gray-200')} />
      </div>
      <div className="flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', completed ? 'text-green-600' : 'text-gray-400')} />
          <span className={cn('font-medium', completed ? 'text-gray-900' : 'text-gray-500')}>{title}</span>
        </div>
        <p className="text-sm text-gray-500 ml-6">{desc}</p>
      </div>
    </div>
  );
}