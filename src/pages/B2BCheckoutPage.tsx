import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, cn } from '../shared';
import { Building2, FileText, Truck, Package, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';

export function B2BCheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');
  const [formData, setFormData] = useState({
    companyName: 'ООО "Ресторан "Уютный"',
    companyINN: '7701234567',
    companyAddress: 'г. Брянск, ул. Советская, 45',
    contactPerson: 'Иванов Иван Иванович',
    contactPhone: '+7 900 123 45 68',
    deliveryMethod: 'self-pickup' as 'self-pickup' | 'freight',
    notes: '',
  });
  const [generating, setGenerating] = useState(false);

  // Mock order items for B2B
  const items = [
    { productName: 'Полутушь говяжья', quantity: 2, unit: 'half_carcass', price: 380000, total: 760000 },
    { productName: 'Помидоры розовые', quantity: 50, unit: 'kg', price: 22000, total: 1100000 },
    { productName: 'Круассаны масляные', quantity: 20, unit: 'box', price: 28000, total: 560000 },
  ];

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const vat = Math.round(subtotal * 0.18);
  const total = subtotal + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('preview');
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(false);
    setStep('success');
  };

  const downloadPDF = () => {
    // In real app, would generate actual PDF
    alert('PDF счет скачан (демо)');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        {['form', 'preview', 'success'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step === s || (['form', 'preview'].indexOf(step) > i)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-500'
            )}>
              {step === s || (['form', 'preview'].indexOf(step) > i) ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </div>
            {i < 2 && <div className={cn('w-20 h-0.5 mx-2', ['form', 'preview'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      {step === 'form' && (
        <FormStep formData={formData} setFormData={setFormData} onSubmit={handleSubmit} total={total} />
      )}

      {step === 'preview' && (
        <PreviewStep
          formData={formData}
          items={items}
          subtotal={subtotal}
          vat={vat}
          total={total}
          onBack={() => setStep('form')}
          onGenerate={handleGeneratePDF}
          generating={generating}
        />
      )}

      {step === 'success' && (
        <SuccessStep onDownload={downloadPDF} onNew={() => { setStep('form'); navigate('/b2b'); }} />
      )}
    </div>
  );
}

function FormStep({ formData, setFormData, onSubmit, total }: { formData: any; setFormData: any; onSubmit: any; total: number }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-green-600" />
          Реквизиты организации
        </h3>
        <div className="space-y-3">
          <InputField label="Название организации" name="companyName" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} required />
          <InputField label="ИНН" name="companyINN" value={formData.companyINN} onChange={e => setFormData({ ...formData, companyINN: e.target.value })} required />
          <InputField label="Юридический адрес" name="companyAddress" value={formData.companyAddress} onChange={e => setFormData({ ...formData, companyAddress: e.target.value })} required multiline />
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          Контактное лицо
        </h3>
        <div className="space-y-3">
          <InputField label="ФИО" name="contactPerson" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} required />
          <InputField label="Телефон" name="contactPhone" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} required type="tel" />
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-green-600" />
          Способ отгрузки
        </h3>
        <div className="space-y-3">
          <label className={cn(
            'relative p-4 rounded-xl border-2 cursor-pointer transition-colors',
            formData.deliveryMethod === 'self-pickup'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          )}>
            <input type="radio" name="deliveryMethod" value="self-pickup" checked={formData.deliveryMethod === 'self-pickup'} onChange={e => setFormData({ ...formData, deliveryMethod: e.target.value as any })} className="sr-only" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Самовывоз с технического дебаркадера</p>
                <p className="text-sm text-gray-500">Заберем собственным транспортом</p>
              </div>
            </div>
          </label>
          <label className={cn(
            'relative p-4 rounded-xl border-2 cursor-pointer transition-colors',
            formData.deliveryMethod === 'freight'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          )}>
            <input type="radio" name="deliveryMethod" value="freight" checked={formData.deliveryMethod === 'freight'} onChange={e => setFormData({ ...formData, deliveryMethod: e.target.value as any })} className="sr-only" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Truck className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Грузовая доставка</p>
                <p className="text-sm text-gray-500">Требуется фура/рефрижератор</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Комментарии к заказу</h3>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="input"
          placeholder="Особые требования к упаковке, срокам доставки и т.д."
        />
      </div>

      <div className="card p-4 bg-gray-50">
        <div className="flex justify-between text-lg font-bold mb-3">
          <span>Итого к оплате (с НДС 18%)</span>
          <span className="text-green-700">{formatPrice(total)}</span>
        </div>
        <button type="submit" className="btn-primary w-full">
          Продолжить к предварительному счету
        </button>
      </div>
    </form>
  );
}

function PreviewStep({ formData, items, subtotal, vat, total, onBack, onGenerate, generating }: any) {
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Предварительный счет</h3>

        {/* Company info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-bold text-gray-900">{formData.companyName}</p>
          <p className="text-sm text-gray-600">ИНН: {formData.companyINN}</p>
          <p className="text-sm text-gray-600">{formData.companyAddress}</p>
          <p className="text-sm text-gray-600">Контакт: {formData.contactPerson}, {formData.contactPhone}</p>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-2">Товар</th>
                <th className="pb-2 text-right">Кол-во</th>
                <th className="pb-2 text-right">Ед.</th>
                <th className="pb-2 text-right">Цена</th>
                <th className="pb-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{item.productName}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-500">{item.unit}</td>
                  <td className="py-2 text-right">{formatPrice(item.price)}</td>
                  <td className="py-2 text-right font-medium">{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-right">
          <div className="flex justify-between">
            <span className="text-gray-600">Подытог</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">НДС (18%)</span>
            <span className="font-medium">{formatPrice(vat)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
            <span>Всего к оплате</span>
            <span className="text-green-700">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1">Назад</button>
        <button onClick={onGenerate} disabled={generating} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {generating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Генерация...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Сгенерировать PDF счет
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SuccessStep({ onDownload, onNew }: any) {
  return (
    <div className="space-y-4 text-center">
      <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">Счет сформирован!</h3>
      <p className="text-gray-500 mt-2">Предварительный счет №INV-DEMO-001 готов к отправке покупателю</p>

      <div className="card p-4 bg-green-50 border-green-200">
        <button onClick={onDownload} className="btn-primary w-full mb-3 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Скачать PDF счет
        </button>
        <p className="text-sm text-green-700">Счет содержит все реквизиты для оплаты юрлицом</p>
      </div>

      <button onClick={onNew} className="btn-secondary w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Новый заказ
      </button>
    </div>
  );
}

function InputField({ label, name, value, onChange, required, type = 'text', multiline }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; required?: boolean; type?: string; multiline?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {multiline ? (
        <textarea name={name} value={value} onChange={onChange} rows={3} className="input" required={required} />
      ) : (
        <input name={name} type={type} value={value} onChange={onChange} className="input" required={required} />
      )}
    </div>
  );
}