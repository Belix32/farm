import { useState, useEffect } from 'react';
import { demoGateEvents, demoDeliverySlots, cn } from '../shared';
import { useSocket } from '../hooks/useSocket';
import { Truck, CheckCircle2, Clock, MapPin, Shield, RefreshCw, X } from 'lucide-react';

export function SecurityDashboardPage() {
  const { onGateEvent } = useSocket();
  const [events, setEvents] = useState(demoGateEvents);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = onGateEvent((newEvent: any) => {
      setEvents(prev => {
        const exists = prev.find(e => e.id === newEvent.id);
        if (exists) {
          return prev.map(e => e.id === newEvent.id ? newEvent : e);
        }
        return [...prev, newEvent];
      });
    });
    return unsubscribe;
  }, [onGateEvent]);

  // Filter events for current hour + next hour
  const relevantEvents = events.filter(e => {
    const eventHour = parseInt(e.expectedTime.split(':')[0]);
    return eventHour >= currentHour && eventHour <= currentHour + 1;
  });

  const statusConfig = {
    expected: { label: 'Ожидается', color: 'bg-blue-100 text-blue-700', icon: Clock },
    arrived: { label: 'Прибыла', color: 'bg-yellow-100 text-yellow-700', icon: Truck },
    allowed: { label: 'Пропущена', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    completed: { label: 'Завершено', color: 'bg-gray-100 text-gray-700', icon: Shield },
  };

  const handleAllow = (eventId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const updated = { ...e, status: 'allowed' as const, actualTime: new Date().toTimeString().slice(0, 5) };
        // Notify vet if meat delivery
        return updated;
      }
      return e;
    }));
  };

  const handleComplete = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'completed' as const } : e));
  };

  const handleArrived = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'arrived' as const } : e));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Планшет охраны (СКУД)</h1>
          <p className="text-sm text-gray-500">Учет фур на въезде · Час: {currentHour}:00–{currentHour + 1}:00</p>
        </div>
        <button className="btn-secondary p-2" aria-label="Обновить">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Clock} label="Ожидается" value={relevantEvents.filter(e => e.status === 'expected').length} color="bg-blue-100 text-blue-700" />
        <StatCard icon={Truck} label="Прибыло" value={relevantEvents.filter(e => e.status === 'arrived').length} color="bg-yellow-100 text-yellow-700" />
        <StatCard icon={CheckCircle2} label="Пропущено" value={relevantEvents.filter(e => ['allowed', 'completed'].includes(e.status)).length} color="bg-green-100 text-green-700" />
      </div>

      {/* Events list */}
      {relevantEvents.length === 0 ? (
        <div className="card p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Нет фур в текущем часе</h3>
          <p className="text-gray-500 mt-1">Следующие поставки появятся автоматически</p>
        </div>
      ) : (
        <div className="space-y-3">
          {relevantEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              config={statusConfig[event.status]}
              onAllow={() => handleAllow(event.id)}
              onComplete={() => handleComplete(event.id)}
              onArrived={() => handleArrived(event.id)}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      {/* Upcoming schedule */}
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Расписание на сегодня</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {demoDeliverySlots
            .filter(s => s.date === new Date().toISOString().split('T')[0] && s.isBooked)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(slot => (
              <div key={slot.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{slot.supplierName}</p>
                    <p className="text-sm text-gray-500">Ворота {slot.gateNumber} · {slot.startTime}–{slot.endTime} · {slot.vehicleNumber}</p>
                  </div>
                </div>
                <span className={cn('badge', slot.isBooked ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500')}>
                  Забронирован
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          config={statusConfig[selectedEvent.status]}
          onClose={() => setSelectedEvent(null)}
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

function EventCard({ event, config, onAllow, onComplete, onArrived, onClick }: any) {
  const Icon = config.icon;

  return (
    <div className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn('p-3 rounded-xl', config.color.replace('text-', 'bg-'))}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{event.supplierName}</span>
              <span className={cn('badge', config.color)}>{config.label}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span className="font-mono">{event.vehicleNumber}</span>
              <span className="text-gray-300">·</span>
              <MapPin className="w-3 h-3" />
              <span>Ворота {event.gateNumber}</span>
              <span className="text-gray-300">·</span>
              <Clock className="w-3 h-3" />
              <span>{event.expectedTime}</span>
              {event.actualTime && <span className="text-green-600"> (факт: {event.actualTime})</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {event.status === 'expected' && (
            <button onClick={e => { e.stopPropagation(); onArrived(); }} className="btn-secondary text-sm">
              Прибыла
            </button>
          )}
          {event.status === 'arrived' && (
            <button onClick={e => { e.stopPropagation(); onAllow(); }} className="btn-primary text-sm">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Пропустить
            </button>
          )}
          {event.status === 'allowed' && (
            <button onClick={e => { e.stopPropagation(); onComplete(); }} className="btn-secondary text-sm">
              Завершить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EventDetailModal({ event, config, onClose }: any) {
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md max-h-[80vh] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.color.replace('text-', 'bg-'))}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{event.supplierName}</p>
              <span className={cn('badge', config.color)}>{config.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Фура</p>
              <p className="font-mono font-medium text-gray-900">{event.vehicleNumber}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Ворота</p>
              <p className="font-medium text-gray-900">№{event.gateNumber}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Ожидалось</p>
              <p className="font-medium text-gray-900">{event.expectedTime}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Факт</p>
              <p className="font-medium text-gray-900">{event.actualTime || '—'}</p>
            </div>
          </div>

          {event.status === 'arrived' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">Фура прибыла на территорию. Нажмите «Пропустить» для открытия шлагбаума.</p>
            </div>
          )}

          {event.status === 'allowed' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">Шлагбаум открыт. Фура проехала на технический дебаркадер.</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">ID события: {event.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}