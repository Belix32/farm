import { useState } from 'react';
import { demoDeliverySlots, demoUsers, formatDate } from '../shared';
import { Truck, CheckCircle2, Plus, AlertCircle } from 'lucide-react';

export function SupplierBookingPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('А123БВ45');
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const slotsForDate = demoDeliverySlots.filter(s => s.date === selectedDate);
  const userSupplier = demoUsers.find(u => u.role === 'supplier');

  const gates = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleBook = async (slotId: string) => {
    setBookingSlot(slotId);
    setShowConfirm(true);
  };

  const confirmBooking = () => {
    const slot = demoDeliverySlots.find(s => s.id === bookingSlot);
    if (slot && userSupplier) {
      slot.isBooked = true;
      slot.bookedBy = userSupplier.id;
      slot.supplierName = userSupplier.name;
      slot.vehicleNumber = vehicleNumber;
      setBookingSuccess(true);
      setShowConfirm(false);
      setBookingSlot(null);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Слот забронирован!</h2>
          <p className="text-gray-500 mt-2">Охранник увидит вашу фуру в планшете СКУД</p>
          <button onClick={() => setBookingSuccess(false)} className="btn-primary mt-6 w-full sm:w-auto">
            Забронировать еще
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Бронирование ворот</h1>
          <p className="text-sm text-gray-500">Выберите дату, ворота и 30-минутный слот</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input w-auto"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Vehicle info */}
      <div className="card p-4">
        <h3 className="font-medium text-gray-900 mb-3">Ваши данные</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Поставщик</label>
            <p className="font-medium text-gray-900">{userSupplier?.name}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Номер фуры</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="А123БВ45"
              className="input font-mono text-center"
              maxLength={9}
            />
          </div>
        </div>
      </div>

      {/* Calendar view - gates as columns, time slots as rows */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Свободные слоты на {formatDate(selectedDate)}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Время</th>
                {gates.map(gate => (
                  <th key={gate} className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>Ворота {gate}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'].map((time, timeIndex) => (
                <tr key={time} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium text-gray-700 w-24">
                    {time}–{timeIndex < 15 ? ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'][timeIndex] : '16:00'}
                  </td>
                  {gates.map(gate => {
                    const slot = slotsForDate.find(s => s.gateNumber === gate && s.startTime === time);
                    const isBooked = slot?.isBooked;
                    const isMyBooking = slot?.bookedBy === userSupplier?.id;

                    return (
                      <td key={gate} className="p-1">
                        {slot ? (
                          <SlotCell
                            slot={slot}
                            isMyBooking={isMyBooking}
                            onClick={() => !isBooked && handleBook(slot.id)}
                          />
                        ) : (
                          <div className="h-20 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                            Свободно
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
            <span className="text-green-700">Свободен</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
            <span className="text-blue-700">Ваш слот</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded opacity-50" />
            <span className="text-gray-500">Занят другим</span>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && bookingSlot && (
        <ConfirmModal
          slot={demoDeliverySlots.find(s => s.id === bookingSlot)!}
          vehicleNumber={vehicleNumber}
          onConfirm={confirmBooking}
          onCancel={() => { setShowConfirm(false); setBookingSlot(null); }}
        />
      )}
    </div>
  );
}

function SlotCell({ slot, isMyBooking, onClick }: any) {
  if (slot.isBooked && !isMyBooking) {
    return (
      <div className="h-20 bg-gray-100 border border-gray-300 rounded-lg opacity-50 flex flex-col items-center justify-center p-2 text-center">
        <AlertCircle className="w-5 h-5 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">Занято</span>
        <span className="text-xs text-gray-400">{slot.supplierName}</span>
        <span className="text-xs text-gray-400 font-mono">{slot.vehicleNumber}</span>
      </div>
    );
  }

  if (isMyBooking) {
    return (
      <div className="h-20 bg-blue-50 border-2 border-blue-400 rounded-lg flex flex-col items-center justify-center p-2 text-center">
        <CheckCircle2 className="w-5 h-5 text-blue-600" />
        <span className="text-xs text-blue-700 font-medium">Ваш слот</span>
        <span className="text-xs text-blue-600 font-mono">{slot.vehicleNumber}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="h-20 w-full bg-green-50 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-100 transition-colors flex flex-col items-center justify-center p-2 text-center"
    >
      <Plus className="w-5 h-5 text-green-500" />
      <span className="text-sm text-green-700 font-medium">Забронировать</span>
      <span className="text-xs text-green-500">30 мин</span>
    </button>
  );
}

function ConfirmModal({ slot, vehicleNumber, onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 animate-slide-up">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Подтвердить бронь?</h3>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Дата</span>
            <span className="font-medium">{formatDate(slot.date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Ворота</span>
            <span className="font-medium">№{slot.gateNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Время</span>
            <span className="font-medium">{slot.startTime}–{slot.endTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Фура</span>
            <span className="font-mono font-medium">{vehicleNumber}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Отмена</button>
          <button onClick={onConfirm} className="btn-primary flex-1">Подтвердить</button>
        </div>
      </div>
    </div>
  );
}