import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { demoProducts, demoTenants, formatPrice, cn } from '../shared';
import { CreditCard, Truck, Package, CheckCircle2, ArrowLeft, Lock, AlertCircle } from 'lucide-react';

export function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<'delivery' | 'payment' | 'split' | 'success'>('delivery');
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup'>('pickup');
  const [pickupSpot, setPickupSpot] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Корзина пуста</h2>
        <Link to="/catalog" className="btn-primary mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Добавить товары
        </Link>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  const handlePayment = async () => {
    setPaymentProcessing(true);
    // Simulate ЮKassa payment
    await new Promise(r => setTimeout(r, 2000));
    setPaymentProcessing(false);
    
    // Show split payments visualization
    setStep('split');
  };

  const handleComplete = () => {
    clearCart();
    navigate('/order/demo-order/success');
  };

  // Calculate split payments
  const splitPayments = items.reduce((acc, item) => {
    const product = demoProducts.find(p => p.id === item.productId);
    const tenantId = product?.tenantId || 'unknown';
    if (!acc[tenantId]) {
      const tenant = demoTenants.find(t => t.id === tenantId);
      acc[tenantId] = { tenantName: tenant?.name || 'Unknown', amount: 0 };
    }
    acc[tenantId].amount += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { tenantName: string; amount: number }>);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Progress steps */}
      <div className="flex items-center justify-between mb-6">
        {['delivery', 'payment', 'split', 'success'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step === s || (['delivery', 'payment', 'split'].indexOf(step) > i)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-500'
            )}>
              {step === s || (['delivery', 'payment', 'split'].indexOf(step) > i) ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && <div className={cn('w-16 h-0.5 mx-2', ['delivery', 'payment', 'split'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="card overflow-hidden">
        {step === 'delivery' && (
          <DeliveryStep
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            pickupSpot={pickupSpot}
            setPickupSpot={setPickupSpot}
            onNext={() => setStep('payment')}
          />
        )}
        {step === 'payment' && (
          <PaymentStep
            totalPrice={totalPrice}
            onPay={handlePayment}
            processing={paymentProcessing}
          />
        )}
        {step === 'split' && (
          <SplitStep
            splitPayments={splitPayments}
            totalPrice={totalPrice}
            onNext={handleComplete}
          />
        )}
        {step === 'success' && (
          <SuccessStep onDone={handleComplete} />
        )}
      </div>
    </div>
  );
}

function DeliveryStep({ deliveryMethod, setDeliveryMethod, pickupSpot, setPickupSpot, onNext }: any) {
  return (
    <div className="p-4 space-y-4">
      <div className="px-4 pt-4">
        <h3 className="font-semibold text-gray-900">Способ получения</h3>
        <p className="text-sm text-gray-500 mt-1">Выберите как получите заказ</p>
      </div>

      <div className="px-4 space-y-3">
        <label className={cn(
          'relative p-4 rounded-xl border-2 cursor-pointer transition-colors',
          deliveryMethod === 'pickup'
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 hover:border-green-300'
        )}>
          <input type="radio" name="delivery" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="sr-only" />
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Click & Collect (на парковке)</span>
                <span className="badge-green">Бесплатно</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Заберите заказ сами, мы подъедем к багажнику</p>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </label>

        <label className={cn(
          'relative p-4 rounded-xl border-2 cursor-pointer transition-colors',
          deliveryMethod === 'courier'
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 hover:border-green-300'
        )}>
          <input type="radio" name="delivery" value="courier" checked={deliveryMethod === 'courier'} onChange={() => setDeliveryMethod('courier')} className="sr-only" />
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Truck className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Доставка курьером</span>
                <span className="badge-gray">От 200₽</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Яндекс.Доставка привозит к двери</p>
            </div>
          </div>
        </label>
      </div>

      {deliveryMethod === 'pickup' && (
        <div className="px-4 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ваше место на парковке</label>
          <input
            type="text"
            value={pickupSpot}
            onChange={e => setPickupSpot(e.target.value)}
            placeholder="Например: №2, А-5, Ворота 3"
            className="input"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">Номер места поможет сборщику быстро вас найти</p>
        </div>
      )}

      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <button onClick={onNext} className="btn-primary w-full" disabled={deliveryMethod === 'pickup' && !pickupSpot.trim()}>
          Перейти к оплате
        </button>
      </div>
    </div>
  );
}

function PaymentStep({ totalPrice, onPay, processing }: any) {
  return (
    <div className="p-4 space-y-4">
      <div className="px-4 pt-4">
        <h3 className="font-semibold text-gray-900">Оплата</h3>
        <p className="text-sm text-gray-500 mt-1">Тестовая оплата через ЮKassa</p>
      </div>

      <div className="px-4 space-y-3">
        <div className="card p-4 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Тестовая карта ЮKassa</p>
              <p className="text-sm text-gray-500">Номер: 5555 5555 5555 4444</p>
              <p className="text-xs text-gray-400">Любая дата / любой CVC</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">К оплате</p>
          <p className="text-2xl font-bold text-green-700">{formatPrice(totalPrice)}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Платеж защищен ЮKassa. Сплит-платежи распределятся автоматически.</span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <button onClick={onPay} disabled={processing} className="btn-primary w-full">
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Обработка...
            </>
          ) : (
            'Оплатить тестовой картой'
          )}
        </button>
      </div>
    </div>
  );
}

function SplitStep({ splitPayments, totalPrice, onNext }: { splitPayments: Record<string, { tenantName: string; amount: number }>; totalPrice: number; onNext: () => void }) {
  return (
    <div className="p-4 space-y-4">
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 text-green-700 mb-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Оплата прошла успешно!</span>
        </div>
        <p className="text-sm text-gray-500">Платеж виртуально разделен между арендаторами:</p>
      </div>

      <div className="px-4 space-y-2">
        {Object.entries(splitPayments).map(([, { tenantName, amount }]) => (
          <div key={tenantName} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">{tenantName}</span>
            </div>
            <span className="font-bold text-green-700">{formatPrice(amount)}</span>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-lg font-bold mb-3">
          <span>Всего</span>
          <span className="text-green-700">{formatPrice(totalPrice)}</span>
        </div>
        <button onClick={onNext} className="btn-primary w-full">
          Заказ оформлен, перейти к получению
        </button>
      </div>
    </div>
  );
}

function SuccessStep({ onDone }: any) {
  return (
    <div className="p-8 text-center">
      <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">Заказ оформлен!</h3>
      <p className="text-gray-500 mt-2">Номер заказа: <span className="font-mono font-medium">#ORD-DEMO-102</span></p>
      <p className="text-sm text-gray-400 mt-4">Сборщик уже получил уведомление и готовит ваш заказ</p>
      <button onClick={onDone} className="btn-primary mt-6 w-full sm:w-auto">
        К заказу на парковке
      </button>
    </div>
  );
}