import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '../shared';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: User['role']) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<User['role'], User> = {
  buyer: { id: 'u1', phone: '+79001234567', name: 'Иван Петров', role: 'buyer' },
  wholesaler: { id: 'u2', phone: '+79001234568', name: 'ООО "Ресторан "Уютный"', role: 'wholesaler', isLegalEntity: true },
  supplier: { id: 'u3', phone: '+79001234569', name: 'ИП Сидоров (Мясной комбинат)', role: 'supplier', tenantId: 't1' },
  security: { id: 'u4', phone: '+79001234570', name: 'Сергей Иванов (Охрана)', role: 'security' },
  vet: { id: 'u5', phone: '+79001234571', name: 'Др. Козлова (Ветврач)', role: 'vet' },
  picker: { id: 'u6', phone: '+79001234572', name: 'Алексей Смирнов (Сборщик)', role: 'picker' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved demo session
    const savedRole = localStorage.getItem('demoRole') as User['role'] | null;
    if (savedRole && DEMO_USERS[savedRole]) {
      setUser(DEMO_USERS[savedRole]);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (role: User['role']) => {
    const demoUser = DEMO_USERS[role];
    if (demoUser) {
      localStorage.setItem('demoRole', role);
      setUser(demoUser);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('demoRole');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}