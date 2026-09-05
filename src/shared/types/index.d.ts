export type UserRole = 'buyer' | 'wholesaler' | 'supplier' | 'security' | 'vet' | 'picker';
export interface User {
    id: string;
    phone: string;
    name: string;
    role: UserRole;
    tenantId?: string;
    isLegalEntity?: boolean;
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
    price: number;
    wholesalePrice?: number;
    unit: 'kg' | 'piece' | 'box' | 'pallet' | 'half_carcass';
    minWholesaleQty?: number;
    imageUrl: string;
    inStock: boolean;
    category: string;
}
export interface CartItem {
    productId: string;
    quantity: number;
    price: number;
}
export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    status: OrderStatus;
    deliveryMethod: 'courier' | 'pickup';
    pickupSpot?: string;
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
export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export interface SplitPayment {
    tenantId: string;
    tenantName: string;
    amount: number;
}
export interface DeliverySlot {
    id: string;
    gateNumber: number;
    startTime: string;
    endTime: string;
    date: string;
    isBooked: boolean;
    bookedBy?: string;
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
//# sourceMappingURL=index.d.ts.map