import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { repository } from '../services/repository';
import { 
  LayoutDashboard, FileText, BarChart3, Award, BookOpen, User, 
  Users, CheckSquare, Building2, Settings, ClipboardList, 
  Menu, X, ChevronDown, LogOut, RotateCcw
} from 'lucide-react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const managerMenu = [
  { id: 'home', label: 'Главная', icon: LayoutDashboard },
  { id: 'report-new', label: 'Сдать отчёт', icon: FileText },
  { id: 'reports', label: 'Мои отчёты', icon: ClipboardList },
  { id: 'metrics', label: 'Мои показатели', icon: BarChart3 },
  { id: 'bonus', label: 'Моя премия', icon: Award },
  { id: 'knowledge', label: 'База знаний', icon: BookOpen },
  { id: 'profile', label: 'Профиль', icon: User },
];

const branchHeadMenu = [
  { id: 'home', label: 'Главная филиала', icon: LayoutDashboard },
  { id: 'review', label: 'Проверка отчётов', icon: CheckSquare },
  { id: 'managers', label: 'Менеджеры', icon: Users },
  { id: 'analytics', label: 'Аналитика филиала', icon: BarChart3 },
  { id: 'plans', label: 'Планы и KPI', icon: ClipboardList },
  { id: 'bonuses', label: 'Премии', icon: Award },
  { id: 'knowledge', label: 'База знаний', icon: BookOpen },
];

const directorMenu = [
  { id: 'home', label: 'Обзор сети', icon: LayoutDashboard },
  { id: 'branches', label: 'Филиалы', icon: Building2 },
  { id: 'employees', label: 'Сотрудники', icon: Users },
  { id: 'analytics', label: 'Аналитика сети', icon: BarChart3 },
  { id: 'plans', label: 'Планы и KPI', icon: ClipboardList },
  { id: 'bonus-fund', label: 'Фонд премий', icon: Award },
  { id: 'reports', label: 'Отчёты', icon: FileText },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

const roleLabels: Record<Role, string> = {
  manager: 'Менеджер',
  branch_head: 'Руководитель',
  director: 'Директор',
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { currentRole, setCurrentRole, currentUser, addToast, refreshData } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const menu = currentRole === 'manager' ? managerMenu 
    : currentRole === 'branch_head' ? branchHeadMenu 
    : directorMenu;

  const branchName = currentUser ? repository.getBranch(currentUser.branchId)?.name : '';

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    setRoleDropdownOpen(false);
    onNavigate('home');
  };

  const handleReset = () => {
    repository.resetAll();
    refreshData();
    addToast('Демонстрационные данные сброшены', 'success');
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Overlay для мобильного */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ЗР</span>
            </div>
            <span className="font-bold text-[#0F172A] text-lg">ЗА РУЛЁМ</span>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                currentPage === item.id 
                  ? 'bg-[#2563EB]/10 text-[#2563EB]' 
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#E2E8F0]">
          <button 
            onClick={handleReset}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Сбросить данные
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-[#64748B]" />
          </button>

          {/* Branch name */}
          <div className="hidden sm:block">
            <span className="text-sm text-[#64748B]">Филиал: </span>
            <span className="text-sm font-medium text-[#0F172A]">{branchName}</span>
          </div>

          <div className="flex-1" />

          {/* Role switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F1F5F9] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${
                currentRole === 'manager' ? 'bg-[#2563EB]' : 
                currentRole === 'branch_head' ? 'bg-[#F59E0B]' : 'bg-[#16A34A]'
              }`} />
              {roleLabels[currentRole]}
              <ChevronDown size={14} />
            </button>
            
            {roleDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50">
                <div className="px-3 py-2 text-xs text-[#64748B] border-b border-[#E2E8F0]">
                  Переключение роли (прототип)
                </div>
                {(['manager', 'branch_head', 'director'] as Role[]).map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#F1F5F9] flex items-center gap-2 ${
                      currentRole === role ? 'text-[#2563EB] font-medium' : 'text-[#0F172A]'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      role === 'manager' ? 'bg-[#2563EB]' : 
                      role === 'branch_head' ? 'bg-[#F59E0B]' : 'bg-[#16A34A]'
                    }`} />
                    {roleLabels[role]}
                    {role === 'manager' && <span className="text-xs text-[#64748B] ml-auto">Алина</span>}
                    {role === 'branch_head' && <span className="text-xs text-[#64748B] ml-auto">Игорь П.</span>}
                    {role === 'director' && <span className="text-xs text-[#64748B] ml-auto">Алексей</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
              <User size={16} className="text-[#2563EB]" />
            </div>
            <span className="hidden md:block text-sm font-medium text-[#0F172A]">
              {currentUser?.name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
