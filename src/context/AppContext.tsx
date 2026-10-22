import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Role, User, Toast } from '../types';
import { repository } from '../services/repository';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  refreshData: () => void;
  dataVersion: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    return (localStorage.getItem('zarulem_role') as Role) || 'manager';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  // Инициализация данных
  useEffect(() => {
    repository.initialize();
  }, []);

  // Установка пользователя по роли
  useEffect(() => {
    localStorage.setItem('zarulem_role', currentRole);
    const users = repository.getUsers();
    let user: User | undefined;
    
    if (currentRole === 'manager') {
      user = users.find(u => u.id === 'user-2'); // Алина
    } else if (currentRole === 'branch_head') {
      user = users.find(u => u.id === 'user-4'); // Игорь Петров
    } else {
      user = users.find(u => u.id === 'user-11'); // Директор
    }
    
    if (user) setCurrentUser(user);
  }, [currentRole]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshData = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  return (
    <AppContext.Provider value={{
      currentRole,
      setCurrentRole,
      currentUser,
      setCurrentUser,
      toasts,
      addToast,
      removeToast,
      refreshData,
      dataVersion,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
