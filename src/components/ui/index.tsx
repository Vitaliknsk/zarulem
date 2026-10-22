import React from 'react';
import { useApp } from '../../context/AppContext';
import { Toast } from '../../types';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();
  
  const icons: Record<Toast['type'], React.ReactNode> = {
    success: <CheckCircle2 size={18} className="text-[#16A34A]" />,
    error: <AlertCircle size={18} className="text-[#DC2626]" />,
    warning: <AlertTriangle size={18} className="text-[#F59E0B]" />,
    info: <Info size={18} className="text-[#2563EB]" />,
  };

  const bgColors: Record<Toast['type'], string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map((toast: Toast) => (
        <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[toast.type]} animate-slide-in`}>
          {icons[toast.type]}
          <span className="text-sm text-[#0F172A] flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-[#64748B] hover:text-[#0F172A]">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// KPI Card
interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}

export function KPICard({ title, value, subtitle, icon, color = 'bg-[#2563EB]' }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#64748B] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
          {subtitle && <p className="text-xs text-[#64748B] mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Progress Bar
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const remaining = Math.max(total - current, 0);
  
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#0F172A]">{label || 'Прогресс'}</span>
        <span className="text-sm text-[#64748B]">{current} из {total}</span>
      </div>
      <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            percent >= 80 ? 'bg-[#16A34A]' : percent >= 50 ? 'bg-[#F59E0B]' : 'bg-[#2563EB]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-[#64748B]">{percent.toFixed(0)}%</span>
        <span className="text-xs text-[#64748B]">Осталось {remaining}</span>
      </div>
    </div>
  );
}

// Status Badge
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Черновик', className: 'bg-gray-100 text-gray-700' },
    SUBMITTED: { label: 'На проверке', className: 'bg-blue-100 text-blue-700' },
    APPROVED: { label: 'Подтверждён', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Возвращён', className: 'bg-red-100 text-red-700' },
  };
  
  const { label, className } = config[status] || config.DRAFT;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };
  
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-[#0F172A] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#64748B] mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// Skeleton
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E2E8F0] rounded ${className}`} />;
}
