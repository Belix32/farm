import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { Play, Pause, RotateCcw, Zap, Truck, CheckCircle2, Clock, AlertTriangle, Bell, X } from 'lucide-react';
import { demoGateEvents, demoDeliverySlots, demoVetChecks, demoOrders, cn } from '../shared';
import { useSocket } from '../hooks/useSocket';

const DEMO_SCENARIOS = [
  { id: 'truck-arrival', label: 'Прибытие фуры', icon: Truck, delay: 2000 },
  { id: 'gate-open', label: 'Открытие шлагбаума', icon: CheckCircle2, delay: 3000 },
  { id: 'vet-alert', label: 'Алерт ветврача', icon: AlertTriangle, delay: 4000 },
  { id: 'picker-notify', label: 'Уведомление сборщика', icon: Bell, delay: 5000 },
];

export function DemoController({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { onGateEvent, onVetAlert, emitOrderReady, emitPickupArrived } = useSocket();
  const { showToast } = useToast();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [simulatedEvents, setSimulatedEvents] = useState<string[]>([]);

  const runScenario = useCallback(async (scenarioId: string) => {
    setActiveScenario(scenarioId);
    setRunning(true);
    setStep(0);
    setSimulatedEvents([]);

    switch (scenarioId) {
      case 'truck-arrival':
        // 1. Фура прибывает
        setSimulatedEvents(prev => [...prev, '🚛 Фура ИП Сидоров (А123БВ45) прибыла к воротам №3']);
        await new Promise(r => setTimeout(r, 1000));
        
        // 2. Охранник видит фуру
        setSimulatedEvents(prev => [...prev, '🛡️ Охранник: фура в планшете СКУД']);
        await new Promise(r => setTimeout(r, 1000));
        
        // 3. Нажатие "Прибыла"
        setSimulatedEvents(prev => [...prev, '✅ Охранник нажал "Прибыла"']);
        // Emit gate event
        const event = demoGateEvents.find(e => e.gateNumber === 3 && e.vehicleNumber === 'В456ГД78');
        if (event) {
          // Simulate socket event
        }
        await new Promise(r => setTimeout(r, 1000));
        
        // 4. Нажатие "Пропустить"
        setSimulatedEvents(prev => [...prev, '🚪 Охранник нажал "Пропустить" — шлагбаум открыт']);
        await new Promise(r => setTimeout(r, 1000));
        
        // 5. Вет-алерт
        setSimulatedEvents(prev => [...prev, '🔔 Ветврач: алерт о прибытии мяса']);
        const vetCheck = demoVetChecks.find(v => v.deliverySlotId === 'ds3');
        if (vetCheck) {
          // Simulate vet alert
        }
        await new Promise(r => setTimeout(r, 1000));
        
        // 6. Ветврач выдает допуск
        setSimulatedEvents(prev => [...prev, '✅ Ветврач: "Допуск выдан" — товары доступны']);
        await new Promise(r => setTimeout(r, 1000));
        
        // 7. Сборщик уведомление
        setSimulatedEvents(prev => [...prev, '📦 Сборщик: уведомление о заказе #102']);
        emitPickupArrived('ord-1', '№2');
        await new Promise(r => setTimeout(r, 1000));
        
        // 8. Заказ готов
        setSimulatedEvents(prev => [...prev, '✅ Заказ #102 готов к выдаче на месте №2']);
        break;
    }
    setRunning(false);
    setActiveScenario(null);
    showToast({ type: 'success', title: 'Демо-сценарий завершён!', duration: 3000 });
  }, [showToast]);

  const runFullDemo = useCallback(async () => {
    await runScenario('truck-arrival');
  }, [runScenario]);

  const resetDemo = useCallback(() => {
    setSimulatedEvents([]);
    setActiveScenario(null);
    setRunning(false);
    setStep(0);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Демо-контроллер</p>
              <p className="text-xs text-gray-500">Авто-симуляция для инвестора</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Quick scenarios */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Быстрые сценарии
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_SCENARIOS.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => runScenario(s.id)}
                    disabled={running}
                    className="p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">~{s.delay / 1000}с</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full demo */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={runFullDemo}
              disabled={running}
              className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
            >
              {running ? (
                <>
                  <Play className="w-5 h-5 animate-spin" />
                  Запускается полный сценарий...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Запустить полный демо-сценарий (2 минуты)
                </>
              )}
            </button>
            <button onClick={resetDemo} className="btn-secondary w-full mt-2" disabled={!simulatedEvents.length}>
              Сбросить лог
            </button>
          </div>

          {/* Event log */}
          {simulatedEvents.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Лог событий</h4>
                <span className="text-xs text-gray-500">{simulatedEvents.length} событий</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {simulatedEvents.map((event, i) => (
                  <div key={i} className="text-xs p-2 bg-gray-50 rounded-lg font-mono text-gray-700 animate-fade-in">
                    {event}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status indicator */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Статус:</span>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              running ? 'bg-purple-100 text-purple-700 animate-pulse' : 'bg-green-100 text-green-700'
            )}>
              {running ? '🔄 Запущено' : '✅ Готово'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}