import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { CartItem, Product, Tenant } from '../shared';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsByTenant: () => Record<string, { tenant: Tenant; items: CartItem[]; subtotal: number }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('demoCart');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage
  useCallback(() => {
    localStorage.setItem('demoCart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { productId: product.id, quantity, price: product.price }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId));
      return;
    }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const getItemsByTenant = useCallback(() => {
    const grouped: Record<string, { tenant: Tenant; items: CartItem[]; subtotal: number }> = {};
    items.forEach(item => {
      // For demo, we'll use a mock tenant lookup
      if (!grouped[item.productId]) {
        grouped[item.productId] = { tenant: { id: '', name: '', category: 'other', description: '', imageUrl: '', isActive: true }, items: [], subtotal: 0 };
      }
      grouped[item.productId].items.push(item);
      grouped[item.productId].subtotal += item.price * item.quantity;
    });
    return grouped;
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, getItemsByTenant }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}