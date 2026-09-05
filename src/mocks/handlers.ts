// MSW Handlers for API mocking
import { http, HttpResponse } from 'msw';
import {
  demoUsers,
  demoTenants,
  demoProducts,
  demoDeliverySlots,
  demoVetChecks,
  demoGateEvents,
  demoOrders,
  demoB2BInvoice,
  getDeliverySlotsByDate,
  getVetCheckBySlot,
  getGateEventsForCurrentHour,
} from '../shared';

export const handlers = [
  // Auth
  http.post('/api/auth/demo-login', async ({ request }) => {
    const { role } = await request.json() as { role: string };
    const user = demoUsers.find(u => u.role === role);
    if (!user) {
      return HttpResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    return HttpResponse.json({ user, token: `demo-token-${role}` });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Extract role from token
    const role = authHeader.replace('Bearer demo-token-', '');
    const user = demoUsers.find(u => u.role === role);
    if (!user) {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return HttpResponse.json({ user });
  }),

  // Tenants/Shops
  http.get('/api/tenants', () => {
    return HttpResponse.json(demoTenants.filter(t => t.isActive));
  }),

  http.get('/api/tenants/:id', ({ params }) => {
    const tenant = demoTenants.find(t => t.id === params.id);
    if (!tenant) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(tenant);
  }),

  // Products
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');
    const category = url.searchParams.get('category');
    const isWholesale = url.searchParams.get('wholesale') === 'true';

    let products = demoProducts.filter(p => p.inStock);

    if (tenantId) {
      products = products.filter(p => p.tenantId === tenantId);
    }
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // For wholesale, add wholesale prices
    if (isWholesale) {
      products = products.map(p => ({
        ...p,
        price: p.wholesalePrice ?? p.price,
        unit: p.unit,
      }));
    }

    return HttpResponse.json(products);
  }),

  http.get('/api/products/:id', ({ params }) => {
    const product = demoProducts.find(p => p.id === params.id);
    if (!product) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // Cart/Orders
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json() as {
      items: Array<{ productId: string; quantity: number }>;
      deliveryMethod: 'courier' | 'pickup';
      pickupSpot?: string;
    };

    // Calculate totals and split payments
    const items = body.items.map(item => {
      const product = demoProducts.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const tenant = demoTenants.find(t => t.id === product.tenantId);
      return {
        id: `oi-${Date.now()}-${Math.random()}`,
        productId: product.id,
        productName: product.name,
        tenantId: product.tenantId,
        tenantName: tenant?.name || 'Unknown',
        quantity: item.quantity,
        price: product.price,
        unit: product.unit,
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const splitPayments = items.reduce((acc, item) => {
      const existing = acc.find(s => s.tenantId === item.tenantId);
      if (existing) {
        existing.amount += item.price * item.quantity;
      } else {
        acc.push({ tenantId: item.tenantId, tenantName: item.tenantName, amount: item.price * item.quantity });
      }
      return acc;
    }, [] as Array<{ tenantId: string; tenantName: string; amount: number }>);

    const newOrder = {
      id: `ord-${Date.now()}`,
      userId: 'u1', // Demo user
      items,
      status: 'paid' as const,
      deliveryMethod: body.deliveryMethod,
      pickupSpot: body.pickupSpot,
      totalAmount,
      splitPayments,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    demoOrders.push(newOrder);

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  http.get('/api/orders', () => {
    return HttpResponse.json(demoOrders);
  }),

  http.get('/api/orders/:id', ({ params }) => {
    const order = demoOrders.find(o => o.id === params.id);
    if (!order) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(order);
  }),

  http.patch('/api/orders/:id/status', async ({ params, request }) => {
    const { status } = await request.json() as { status: string };
    const order = demoOrders.find(o => o.id === params.id);
    if (!order) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    order.status = status as any;
    order.updatedAt = new Date();
    return HttpResponse.json(order);
  }),

  // Payments (mock ЮKassa)
  http.post('/api/payments/create', async ({ request }) => {
    const { orderId } = await request.json() as { orderId: string };
    const order = demoOrders.find(o => o.id === orderId);
    if (!order) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Mock payment response
    return HttpResponse.json({
      confirmationUrl: `https://yoomoney.ru/checkout/payments/v2/contract?orderId=${orderId}`,
      paymentId: `pay-${Date.now()}`,
      amount: order.totalAmount,
      splitPayments: order.splitPayments,
    });
  }),

  http.post('/api/payments/webhook', () => {
    // Mock webhook handler
    return HttpResponse.json({ success: true });
  }),

  // Delivery slots (Logistics)
  http.get('/api/delivery-slots', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    return HttpResponse.json(getDeliverySlotsByDate(date));
  }),

  http.post('/api/delivery-slots/book', async ({ request }) => {
    const { slotId, supplierId, vehicleNumber } = await request.json() as {
      slotId: string;
      supplierId: string;
      vehicleNumber: string;
    };

    const slot = demoDeliverySlots.find(s => s.id === slotId);
    if (!slot) {
      return HttpResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    if (slot.isBooked) {
      return HttpResponse.json({ error: 'Slot already booked' }, { status: 400 });
    }

    const supplier = demoUsers.find(u => u.id === supplierId);
    slot.isBooked = true;
    slot.bookedBy = supplierId;
    slot.supplierName = supplier?.name;
    slot.vehicleNumber = vehicleNumber;

    // Create vet check for meat suppliers
    if (supplier?.tenantId) {
      const tenant = demoTenants.find(t => t.id === supplier.tenantId);
      if (tenant?.category === 'meat') {
        demoVetChecks.push({
          id: `vc-${Date.now()}`,
          deliverySlotId: slotId,
          supplierId,
          supplierName: supplier.name,
          vehicleNumber,
          status: 'pending',
          notes: 'Ожидает прибытия',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return HttpResponse.json(slot);
  }),

  // Vet checks
  http.get('/api/vet/checks', () => {
    return HttpResponse.json(demoVetChecks);
  }),

  http.get('/api/vet/checks/:slotId', ({ params }) => {
    const slotId = Array.isArray(params.slotId) ? params.slotId[0] : params.slotId;
    const check = getVetCheckBySlot(slotId);
    if (!check) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(check);
  }),

  http.patch('/api/vet/checks/:id', async ({ params, request }) => {
    const { status, notes } = await request.json() as { status: string; notes?: string };
    const check = demoVetChecks.find(v => v.id === params.id);
    if (!check) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    check.status = status as any;
    check.notes = notes;
    check.updatedAt = new Date();

    // Update product availability if approved
    if (status === 'approved') {
      const slot = demoDeliverySlots.find(s => s.id === check.deliverySlotId);
      if (slot) {
        // Products from this supplier become available
        const products = demoProducts.filter(p => p.tenantId === demoUsers.find(u => u.id === check.supplierId)?.tenantId);
        products.forEach(p => { p.inStock = true; });
      }
    }

    return HttpResponse.json(check);
  }),

  // Security / Gates
  http.get('/api/gates/events', () => {
    return HttpResponse.json(getGateEventsForCurrentHour());
  }),

  http.patch('/api/gates/events/:id/allow', ({ params }) => {
    const event = demoGateEvents.find(e => e.id === params.id);
    if (!event) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    event.status = 'allowed';
    event.actualTime = new Date().toTimeString().slice(0, 5);
    return HttpResponse.json(event);
  }),

  // B2B
  http.get('/api/b2b/invoice/:orderId', () => {
    return HttpResponse.json(demoB2BInvoice);
  }),

  http.post('/api/b2b/invoice/generate', async ({ request }) => {
    const { orderId, companyName, companyINN, companyAddress } = await request.json() as {
      orderId: string;
      companyName: string;
      companyINN: string;
      companyAddress: string;
    };

    const order = demoOrders.find(o => o.id === orderId);
    if (!order) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const invoice = {
      id: `inv-${Date.now()}`,
      orderId,
      companyName,
      companyINN,
      companyAddress,
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        total: item.price * item.quantity,
      })),
      totalAmount: order.totalAmount,
      vatAmount: Math.round(order.totalAmount * 0.18),
      createdAt: new Date(),
    };

    return HttpResponse.json(invoice, { status: 201 });
  }),

  // Delivery (Яндекс.Доставки mock)
  http.post('/api/delivery/courier', () => {
    return HttpResponse.json({
      courierId: `courier-${Date.now()}`,
      status: 'assigned',
      estimatedArrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
  }),
];