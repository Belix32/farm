import type {
  User,
  Tenant,
  Product,
  DeliverySlot,
  VetCheck,
  GateEvent,
  Order,
  B2BInvoice
} from '../types';

// Demo users for each role
export const demoUsers: User[] = [
  { id: 'u1', phone: '+79001234567', name: 'Иван Петров', role: 'buyer' },
  { id: 'u2', phone: '+79001234568', name: 'ООО "Ресторан "Уютный"', role: 'wholesaler', isLegalEntity: true },
  { id: 'u3', phone: '+79001234569', name: 'ИП Сидоров (Мясной комбинат)', role: 'supplier', tenantId: 't1' },
  { id: 'u4', phone: '+79001234570', name: 'Сергей Иванов (Охрана)', role: 'security' },
  { id: 'u5', phone: '+79001234571', name: 'Др. Козлова (Ветврач)', role: 'vet' },
  { id: 'u6', phone: '+79001234572', name: 'Алексей Смирнов (Сборщик)', role: 'picker' },
];

// Demo tenants (shops)
export const demoTenants: Tenant[] = [
  {
    id: 't1',
    name: 'Мясная лавка',
    category: 'meat',
    description: 'Свежее мясо от местных ферм. Говядина, свинина, ягнятина.',
    imageUrl: 'https://images.unsplash.com/photo-1607617814078-7a2f4b9e0c1b?w=400',
    isActive: true
  },
  {
    id: 't2',
    name: 'Овощи и Фрукты',
    category: 'vegetables',
    description: 'Сезонные овощи и фрукты с полей Брянской области.',
    imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400',
    isActive: true
  },
  {
    id: 't3',
    name: 'Хлебный дворик',
    category: 'bakery',
    description: 'Традиционный хлеб, булки, пирожки на закваске.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    isActive: true
  }
];

// Demo products
export const demoProducts: Product[] = [
  // Мясная лавка
  { id: 'p1', tenantId: 't1', name: 'Говядина (вырезка)', description: 'Премиальная говядина, сушка 21 день', price: 85000, wholesalePrice: 72000, unit: 'kg', minWholesaleQty: 10, imageUrl: 'https://images.unsplash.com/photo-1600500063376-8858644fb9e5?w=400', inStock: true, category: 'meat' },
  { id: 'p2', tenantId: 't1', name: 'Свинина (шея)', description: 'Нежная свинина для жарки и тушения', price: 42000, wholesalePrice: 35000, unit: 'kg', minWholesaleQty: 15, imageUrl: 'https://images.unsplash.com/photo-1614937090409-2bdec4b1e3d5?w=400', inStock: true, category: 'meat' },
  { id: 'p3', tenantId: 't1', name: 'Ягнятина (караре)', description: 'Молодая ягнятина, идеально для гриля', price: 120000, wholesalePrice: 100000, unit: 'kg', minWholesaleQty: 5, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', inStock: true, category: 'meat' },
  { id: 'p4', tenantId: 't1', name: 'Полутушь говяжья', description: 'Для глубокой заморозки, оптовая партия', price: 450000, wholesalePrice: 380000, unit: 'half_carcass', minWholesaleQty: 1, imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400', inStock: true, category: 'meat' },

  // Овощи и Фрукты
  { id: 'p5', tenantId: 't2', name: 'Помидоры розовые', description: 'Сладкие, мясистые, с куста', price: 28000, wholesalePrice: 22000, unit: 'kg', minWholesaleQty: 20, imageUrl: 'https://images.unsplash.com/photo-1546470427-e7b2d8d5c8e7?w=400', inStock: true, category: 'vegetables' },
  { id: 'p6', tenantId: 't2', name: 'Огурцы хрустящие', description: 'Идеальные для салатов и заготовок', price: 18000, wholesalePrice: 14000, unit: 'kg', minWholesaleQty: 25, imageUrl: 'https://images.unsplash.com/photo-1449385547850-5d4d0d4b3c4e?w=400', inStock: true, category: 'vegetables' },
  { id: 'p7', tenantId: 't2', name: 'Картофель ранний', description: 'Молодой картофель, тонкая кожура', price: 12000, wholesalePrice: 8000, unit: 'kg', minWholesaleQty: 50, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', inStock: true, category: 'vegetables' },
  { id: 'p8', tenantId: 't2', name: 'Яблоки Г vieil Smith', description: 'Кисле-сладкие, хрустящие', price: 15000, wholesalePrice: 11000, unit: 'kg', minWholesaleQty: 30, imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', inStock: true, category: 'vegetables' },

  // Хлебный дворик
  { id: 'p9', tenantId: 't3', name: 'Хлеб бородинский', description: 'На закваске, с кориандром и маком', price: 8500, wholesalePrice: 6500, unit: 'piece', minWholesaleQty: 50, imageUrl: 'https://images.unsplash.com/photo-1585471149623-1e5d8e5b3f4d?w=400', inStock: true, category: 'bakery' },
  { id: 'p10', tenantId: 't3', name: 'Батон нарезной', description: 'Классический белый хлеб', price: 5500, wholesalePrice: 4200, unit: 'piece', minWholesaleQty: 100, imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bf73?w=400', inStock: true, category: 'bakery' },
  { id: 'p11', tenantId: 't3', name: 'Пирожки с капустой', description: 'Домашние, с наваристой капустой', price: 12000, wholesalePrice: 9000, unit: 'piece', minWholesaleQty: 30, imageUrl: 'https://images.unsplash.com/photo-1618070670585-3d2f4b1e5a3b?w=400', inStock: true, category: 'bakery' },
  { id: 'p12', tenantId: 't3', name: 'Круассаны масляные', description: 'Французские, слоеные, 6 шт в коробке', price: 35000, wholesalePrice: 28000, unit: 'box', minWholesaleQty: 10, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', inStock: true, category: 'bakery' },
];

// Demo delivery slots for gates
export const demoDeliverySlots: DeliverySlot[] = [
  { id: 'ds1', gateNumber: 1, startTime: '08:00', endTime: '08:30', date: '2026-09-05', isBooked: true, bookedBy: 'u3', supplierName: 'ИП Сидоров', vehicleNumber: 'А123БВ45' },
  { id: 'ds2', gateNumber: 2, startTime: '08:30', endTime: '09:00', date: '2026-09-05', isBooked: false },
  { id: 'ds3', gateNumber: 3, startTime: '10:00', endTime: '10:30', date: '2026-09-05', isBooked: true, bookedBy: 'u3', supplierName: 'ИП Сидоров', vehicleNumber: 'В456ГД78' },
  { id: 'ds4', gateNumber: 4, startTime: '10:30', endTime: '11:00', date: '2026-09-05', isBooked: false },
  { id: 'ds5', gateNumber: 5, startTime: '11:00', endTime: '11:30', date: '2026-09-05', isBooked: false },
  { id: 'ds6', gateNumber: 1, startTime: '12:00', endTime: '12:30', date: '2026-09-05', isBooked: false },
  { id: 'ds7', gateNumber: 2, startTime: '12:30', endTime: '13:00', date: '2026-09-05', isBooked: false },
  { id: 'ds8', gateNumber: 3, startTime: '14:00', endTime: '14:30', date: '2026-09-05', isBooked: false },
  { id: 'ds9', gateNumber: 4, startTime: '14:30', endTime: '15:00', date: '2026-09-05', isBooked: false },
  { id: 'ds10', gateNumber: 5, startTime: '15:00', endTime: '15:30', date: '2026-09-05', isBooked: false },
];

// Demo vet checks
export const demoVetChecks: VetCheck[] = [
  { id: 'vc1', deliverySlotId: 'ds1', supplierId: 'u3', supplierName: 'ИП Сидоров', vehicleNumber: 'А123БВ45', status: 'approved', notes: 'Ветсопроводительная в порядке', createdAt: new Date('2026-09-05T07:55:00'), updatedAt: new Date('2026-09-05T08:10:00') },
  { id: 'vc2', deliverySlotId: 'ds3', supplierId: 'u3', supplierName: 'ИП Сидоров', vehicleNumber: 'В456ГД78', status: 'pending', notes: 'Ожидает прибытия', createdAt: new Date('2026-09-05T09:00:00'), updatedAt: new Date('2026-09-05T09:00:00') },
];

// Demo gate events for security tablet
export const demoGateEvents: GateEvent[] = [
  { id: 'ge1', gateNumber: 1, vehicleNumber: 'А123БВ45', supplierName: 'ИП Сидоров', status: 'completed', expectedTime: '08:00', actualTime: '08:05' },
  { id: 'ge2', gateNumber: 3, vehicleNumber: 'В456ГД78', supplierName: 'ИП Сидоров', status: 'expected', expectedTime: '10:00' },
  { id: 'ge3', gateNumber: 2, vehicleNumber: 'Е789ЖЗ90', supplierName: 'ООО АгроФерма', status: 'expected', expectedTime: '11:00' },
];

// Demo orders
export const demoOrders: Order[] = [
  {
    id: 'ord1',
    userId: 'u1',
    items: [
      { id: 'oi1', productId: 'p1', productName: 'Говядина (вырезка)', tenantId: 't1', tenantName: 'Мясная лавка', quantity: 1, price: 85000, unit: 'kg' },
      { id: 'oi2', productId: 'p9', productName: 'Хлеб бородинский', tenantId: 't3', tenantName: 'Хлебный дворик', quantity: 2, price: 8500, unit: 'piece' },
    ],
    status: 'ready',
    deliveryMethod: 'pickup',
    pickupSpot: '№2',
    totalAmount: 102000,
    splitPayments: [
      { tenantId: 't1', tenantName: 'Мясная лавка', amount: 85000 },
      { tenantId: 't3', tenantName: 'Хлебный дворик', amount: 17000 },
    ],
    createdAt: new Date('2026-09-05T09:30:00'),
    updatedAt: new Date('2026-09-05T09:45:00'),
  },
];

// Demo B2B invoice
export const demoB2BInvoice: B2BInvoice = {
  id: 'inv1',
  orderId: 'ord-b2b-1',
  companyName: 'ООО "Ресторан "Уютный"',
  companyINN: '7701234567',
  companyAddress: 'г. Брянск, ул. Советская, 45',
  items: [
    { productName: 'Полутушь говяжья', quantity: 2, unit: 'half_carcass', price: 380000, total: 760000 },
    { productName: 'Помидоры розовые', quantity: 50, unit: 'kg', price: 22000, total: 1100000 },
    { productName: 'Круассаны масляные', quantity: 20, unit: 'box', price: 28000, total: 560000 },
  ],
  totalAmount: 2420000,
  vatAmount: 435600,
  createdAt: new Date('2026-09-05T10:00:00'),
};

// Helper functions
export function getTenantById(id: string): Tenant | undefined {
  return demoTenants.find(t => t.id === id);
}

export function getProductById(id: string): Product | undefined {
  return demoProducts.find(p => p.id === id);
}

export function getProductsByTenant(tenantId: string): Product[] {
  return demoProducts.filter(p => p.tenantId === tenantId && p.inStock);
}

export function getUserByPhone(phone: string): User | undefined {
  return demoUsers.find(u => u.phone === phone);
}

export function getDeliverySlotsByDate(date: string): DeliverySlot[] {
  return demoDeliverySlots.filter(s => s.date === date);
}

export function getVetCheckBySlot(slotId: string): VetCheck | undefined {
  return demoVetChecks.find(v => v.deliverySlotId === slotId);
}

export function getGateEventsForCurrentHour(): GateEvent[] {
  const now = new Date();
  const currentHour = now.getHours();
  return demoGateEvents.filter(e => {
    const expectedHour = parseInt(e.expectedTime.split(':')[0]);
    return expectedHour === currentHour || e.status === 'expected';
  });
}