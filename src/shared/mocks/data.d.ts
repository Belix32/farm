import type { User, Tenant, Product, DeliverySlot, VetCheck, GateEvent, Order, B2BInvoice } from '../types';
export declare const demoUsers: User[];
export declare const demoTenants: Tenant[];
export declare const demoProducts: Product[];
export declare const demoDeliverySlots: DeliverySlot[];
export declare const demoVetChecks: VetCheck[];
export declare const demoGateEvents: GateEvent[];
export declare const demoOrders: Order[];
export declare const demoB2BInvoice: B2BInvoice;
export declare function getTenantById(id: string): Tenant | undefined;
export declare function getProductById(id: string): Product | undefined;
export declare function getProductsByTenant(tenantId: string): Product[];
export declare function getUserByPhone(phone: string): User | undefined;
export declare function getDeliverySlotsByDate(date: string): DeliverySlot[];
export declare function getVetCheckBySlot(slotId: string): VetCheck | undefined;
export declare function getGateEventsForCurrentHour(): GateEvent[];
//# sourceMappingURL=data.d.ts.map