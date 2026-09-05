// Shared types for the farmer market demo

export type UserRole = 
  | 'buyer'           // Покупатель (B2C)
  | 'wholesaler'      // Оптовик (B2B)
  | 'supplier'        // Поставщик
  | 'security'        // Охранник (СКУД)
  | 'vet'             // Ветврач
  | 'picker';         // Сборщик заказов

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  tenantId?: string;  // Для арендаторов/поставщиков
  isLegalEntity?: boolean; // Для B2B доступа
}

export interface Tenant {
  id: string;
  name: string;
  category: 'meat' | 'vegetables' | 'bakery' | 'dairy' | 'other';
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;        // Розничная цена (копейки)
  wholesalePrice?: number; // Оптовая цена (копейки)
  unit: 'kg' | 'piece' | 'box' | 'pallet' | 'half_carcass';
  minWholesaleQty?: number; // Мин. кол-во для опта
  imageUrl: string;
  inStock: boolean;
  category: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number; // Цена на момент добавления
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryMethod: 'courier' | 'pickup';
  pickupSpot?: string; // Номер места на парковке
  totalAmount: number;
  splitPayments: SplitPayment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  tenantId: string;
  tenantName: string;
  quantity: number;
  price: number;
  unit: string;
}

export type OrderStatus = 
  | 'pending'       // Ожидает оплаты
  | 'paid'          // Оплачен
  | 'preparing'     // Готовится
  | 'ready'         // Готов к выдаче
  | 'completed'     // Выдан
  | 'cancelled';    // Отменен

export interface SplitPayment {
  tenantId: string;
  tenantName: string;
  amount: number;
}

export interface DeliverySlot {
  id: string;
  gateNumber: number; // 1-10
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  date: string;       // YYYY-MM-DD
  isBooked: boolean;
  bookedBy?: string;  // supplierId
  supplierName?: string;
  vehicleNumber?: string;
}

export interface VetCheck {
  id: string;
  deliverySlotId: string;
  supplierId: string;
  supplierName: string;
  vehicleNumber: string;
  status: 'pending' | 'inspecting' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GateEvent {
  id: string;
  gateNumber: number;
  vehicleNumber: string;
  supplierName: string;
  status: 'expected' | 'arrived' | 'allowed' | 'completed';
  expectedTime: string;
  actualTime?: string;
}

export interface B2BInvoice {
  id: string;
  orderId: string;
  companyName: string;
  companyINN: string;
  companyAddress: string;
  items: B2BInvoiceItem[];
  totalAmount: number;
  vatAmount: number;
  createdAt: Date;
}

export interface B2BInvoiceItem {
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  steps: string[];
}