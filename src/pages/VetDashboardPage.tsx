import { useState, useEffect } from 'react';
import { demoVetChecks, demoDeliverySlots, demoUsers, demoProducts, formatDate, formatPrice, cn } from '../shared';
import { useSocket } from '../hooks/useSocket';
import { Stethoscope, CheckCircle2, AlertCircle, Clock, Truck, AlertTriangle, RefreshCw, X, Eye, MapPin } from 'lucide-react';

export function VetDashboardPage() {
  const { onVetAlert } = useSocket();
  const [checks, setChecks] = useState(demoVetChecks);
  const [selectedCheck, setSelectedCheck] = useState<typeof checks[0] | null>(null);

  useEffect(() => {
    const unsubscribe = onVetAlert((newCheck: any) => {
      setChecks(prev => {
        const exists = prev.find(c => c.id === newCheck.id);
        if (exists) {
          return prev.map(c => c.id === newCheck.id ? newCheck : c);
        }
        // Play notification sound
        if (newCheck.status === 'pending') {
          playNotificationSound();
        }
        return [...prev, newCheck];
      });
    });
    return unsubscribe;
  }, [onVetAlert]);

  const playNotificationSound = () => {
    // Simple beep using Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 300);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const handleApprove = (checkId: string) => {
    setChecks(prev => prev.map(c => {
      if (c.id === checkId) {
        const updated = { ...c, status: 'approved' as const, updatedAt: new Date() };
        // Update product availability
        const supplier = demoUsers.find(u => u.id === c.supplierId);
        if (supplier?.tenantId) {
          demoProducts
            .filter(p => p.tenantId === supplier.tenantId)
            .forEach(p => { p.inStock = true; });
        }
        return updated;
      }
      return c;
    }));
    setSelectedCheck(null);
  };

  const handleReject = (checkId: string, notes: string) => {
    setChecks(prev => prev.map(c => c.id === checkId ? { ...c, status: 'rejected' as const, notes, updatedAt: new Date() } : c));
    setSelectedCheck(null);
  };

  const handleInspect = (checkId: string) => {
    setChecks(prev => prev.map(c => c.id === checkId ? { ...c, status: 'inspecting' as const, updatedAt: new Date() } : c));
  };

  // Stats
  const stats = {
    pending: checks.filter(c => c.status === 'pending').length,
    inspecting: checks.filter(c => c.status === 'inspecting').length,
    approved: checks.filter(c => c.status === 'approved').length,
    rejected: checks.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-red-600" />
            Кабинет ветврача
          </h1>
          <p className="text-sm text-gray-500">Ветконтроль прибывшего мяса</p>
        </div>
        <button className="btn-secondary p-2" aria-label="Обновить">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alert banner for pending checks */}
      {stats.pending > 0 && (
        <div className="card p-4 bg-red-50 border-red-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800">Требуется внимание!</p>
              <p className="text-sm text-red-600">{stats.pending} фур{stats.pending > 1 ? 'ы' : ''} с мясом ожидают ветконтроля</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={AlertCircle} label="На проверке" value={stats.pending} color="bg-red-100 text-red-700" />
        <StatCard icon={Eye} label="Инспекция" value={stats.inspecting} color="bg-yellow-100 text-yellow-700" />
        <StatCard icon={CheckCircle2} label="Допущено" value={stats.approved} color="bg-green-100 text-green-700" />
        <StatCard icon={AlertTriangle} label="Отклонено" value={stats.rejected} color="bg-gray-100 text-gray-700" />
      </div>

      {/* Checks list */}
      {checks.length === 0 ? (
        <div className="card p-12 text-center">
          <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Нет поставок на контроле</h3>
          <p className="text-gray-500 mt-1">Новые фуры с мясом появятся здесь автоматически</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checks
            .sort((a, b) => {
              const statusOrder = { pending: 0, inspecting: 1, approved: 2, rejected: 3 };
              return statusOrder[a.status] - statusOrder[b.status];
            })
            .map(check => (
              <CheckCard
                key={check.id}
                check={check}
                onClick={() => setSelectedCheck(check)}
                onInspect={() => handleInspect(check.id)}
                onApprove={() => handleApprove(check.id)}
                onReject={(notes: string) => handleReject(check.id, notes)}
              />
            ))}
        </div>
      )}

      {/* Check detail modal */}
      {selectedCheck && (
        <CheckDetailModal
          check={selectedCheck}
          onClose={() => setSelectedCheck(null)}
          onInspect={() => handleInspect(selectedCheck.id)}
          onApprove={() => handleApprove(selectedCheck.id)}
          onReject={(notes: string) => handleReject(selectedCheck.id, notes)}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className={cn('p-2 rounded-lg', color.replace('text-', 'bg-'))}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">{label}</p>
    </div>
  );
}

function CheckCard({ check, onClick, onInspect, onApprove, onReject }: any) {
  const statusConfig = {
    pending: { label: 'Ожидает проверки', color: 'bg-red-100 text-red-700', icon: AlertCircle, urgent: true },
    inspecting: { label: 'На инспекции', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
    approved: { label: 'Допуск выдан', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { label: 'Отклонено', color: 'bg-gray-100 text-gray-700', icon: AlertTriangle },
  } as const;

  const config = statusConfig[check.status as keyof typeof statusConfig];
  const Icon = config.icon;
  const slot = demoDeliverySlots.find(s => s.id === check.deliverySlotId);

  return (
    <div className={cn('card p-4 hover:shadow-card-hover transition-shadow cursor-pointer', 'urgent' in config && config.urgent && 'ring-2 ring-red-200')} onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn('p-3 rounded-xl', config.color.replace('text-', 'bg-'))}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{check.supplierName}</span>
              <span className={cn('badge', config.color)}>{config.label}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span className="font-mono">{check.vehicleNumber}</span>
              {slot && <span className="text-gray-300">·</span>}
              {slot && <MapPin className="w-3 h-3" />}
              {slot && <span>Ворота {slot.gateNumber}</span>}
              {slot && <span className="text-gray-300">·</span>}
              {slot && <Clock className="w-3 h-3" />}
              {slot && <span>{slot.startTime}–{slot.endTime}</span>}
            </p>
            {check.notes && (
              <p className="text-xs text-gray-500 mt-1">{check.notes}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {check.status === 'pending' && (
            <button onClick={e => { e.stopPropagation(); onInspect(); }} className="btn-secondary text-sm">
              <Eye className="w-4 h-4 mr-1" />
              Начать
            </button>
          )}
          {check.status === 'inspecting' && (
            <>
              <button onClick={e => { e.stopPropagation(); onApprove(); }} className="btn-primary text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Допуск
              </button>
              <button onClick={e => { e.stopPropagation(); onReject('Не соответствует требованиям'); }} className="btn-secondary text-sm text-red-600 border-red-300 hover:bg-red-50">
                Отклонить
              </button>
            </>
          )}
          {check.status === 'approved' && (
            <span className="text-green-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Товары доступны для продажи
            </span>
          )}
          {check.status === 'rejected' && (
            <span className="text-gray-500 font-medium">Документы не прошли проверку</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckDetailModal({ check, onClose, onInspect, onApprove, onReject }: any) {
  const statusConfig = {
    pending: { label: 'Ожидает проверки', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    inspecting: { label: 'На инспекции', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
    approved: { label: 'Допуск выдан', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { label: 'Отклонено', color: 'bg-gray-100 text-gray-700', icon: AlertTriangle },
  } as const;

  const config = statusConfig[check.status as keyof typeof statusConfig];
  const Icon = config.icon;
  const slot = demoDeliverySlots.find(s => s.id === check.deliverySlotId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.color.replace('text-', 'bg-'))}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{check.supplierName}</p>
              <span className={cn('badge', config.color)}>{config.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Delivery info */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3">Информация о поставке</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Фура</span>
                <span className="font-mono font-medium">{check.vehicleNumber}</span>
              </div>
              {slot && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ворота</span>
                    <span className="font-medium">№{slot.gateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Слот</span>
                    <span className="font-medium">{slot.startTime}–{slot.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Дата</span>
                    <span className="font-medium">{formatDate(slot.date)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Поставщик</span>
                <span className="font-medium">{check.supplierName}</span>
              </div>
            </div>
          </div>

          {/* Products to check */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3">Товары к проверке</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {demoProducts
                .filter(p => p.tenantId === demoUsers.find(u => u.id === check.supplierId)?.tenantId)
                .map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category} · {formatPrice(product.wholesalePrice || product.price)}/{formatPrice(product.price)}</p>
                    </div>
                    <span className={product.inStock ? 'badge-green' : 'badge-yellow'}>
                      {product.inStock ? 'В наличии' : 'На проверке'}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Notes */}
          {check.notes && (
            <div className="card p-4 bg-yellow-50 border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-1">Примечания:</h4>
              <p className="text-sm text-yellow-700">{check.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {check.status === 'pending' && (
              <button onClick={() => { onInspect(); onClose(); }} className="btn-primary w-full">
                <Eye className="w-4 h-4 mr-2" />
                Начать инспекцию
              </button>
            )}
            {check.status === 'inspecting' && (
              <>
                <button onClick={() => { onApprove(); onClose(); }} className="btn-primary w-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Выдать допуск — товары готовы к продаже
                </button>
                <button
                  onClick={() => {
                    const notes = prompt('Причина отклонения:');
                    if (notes) { onReject(notes); onClose(); }
                  }}
                  className="btn-secondary w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Отклонить поставку
                </button>
              </>
            )}
            {check.status === 'approved' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-800 font-medium">✓ Допуск выдан</p>
                <p className="text-sm text-green-600 mt-1">Товары поставщика доступны для продажи на витрине</p>
              </div>
            )}
            {check.status === 'rejected' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-800 font-medium">✗ Поставка отклонена</p>
                <p className="text-sm text-red-600 mt-1">Товары не допущены к продаже</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}