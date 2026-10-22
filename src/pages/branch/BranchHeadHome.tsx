import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { calculateBranchKPI, calculateManagerKPI, calculateBonus, formatCurrency, getCurrentMonth } from '../../lib/calculations';
import { KPICard, ProgressBar, StatusBadge, Modal } from '../../components/ui';
import { Building2, Users, ShoppingCart, TrendingUp, Award, AlertTriangle, CheckSquare, ClipboardList } from 'lucide-react';
import { Report, ReportStatus } from '../../types';
import { useState } from 'react';
import { calculateReportTotals, calculateConversion, formatDate } from '../../lib/calculations';

interface BranchHeadHomeProps {
  onNavigate: (page: string) => void;
}

export default function BranchHeadHome({ onNavigate }: BranchHeadHomeProps) {
  const { currentUser, dataVersion } = useApp();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const data = useMemo(() => {
    if (!currentUser) return null;
    const branch = repository.getBranch(currentUser.branchId);
    const managers = repository.getManagersByBranch(currentUser.branchId);
    const allReports = repository.getReportsByBranch(currentUser.branchId);
    const currentMonth = getCurrentMonth();
    const monthReports = allReports.filter(r => r.date.startsWith(currentMonth));
    const approvedReports = monthReports.filter(r => r.status === 'APPROVED');
    const pendingReports = monthReports.filter(r => r.status === 'SUBMITTED');
    
    const branchKPI = calculateBranchKPI(approvedReports, branch?.plan || 20);
    const rules = repository.getBonusRules();
    
    // Per-manager stats
    const managerStats = managers.map(m => {
      const mReports = monthReports.filter(r => r.userId === m.id && r.status === 'APPROVED');
      const kpi = calculateManagerKPI(mReports, Math.round((branch?.plan || 20) / managers.length));
      const bonus = calculateBonus(kpi.totalSales, Math.round((branch?.plan || 20) / managers.length), kpi.conversion, rules);
      return { manager: m, kpi, bonus };
    });

    const totalBonus = managerStats.reduce((sum, s) => sum + s.bonus.amount, 0);

    return { branch, managers, branchKPI, managerStats, pendingCount: pendingReports.length, totalBonus };
  }, [currentUser, dataVersion]);

  if (!data) return null;
  const { branch, branchKPI, managerStats, pendingCount, totalBonus } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <Building2 size={24} className="text-[#2563EB]" />
          {branch?.name}
        </h1>
        <p className="text-[#64748B] mt-1">Панель руководителя филиала</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Продажи филиала" value={String(branchKPI.totalSales)} icon={<ShoppingCart size={20} className="text-white" />} color="bg-[#2563EB]" />
        <KPICard title="Конверсия" value={`${branchKPI.conversion.toFixed(1)}%`} icon={<TrendingUp size={20} className="text-white" />} color={branchKPI.conversion > 20 ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'} />
        <KPICard title="Выполнение плана" value={`${branchKPI.planCompletion.toFixed(0)}%`} icon={<ClipboardList size={20} className="text-white" />} color="bg-[#7C3AED]" />
        <KPICard title="Фонд премий" value={formatCurrency(totalBonus)} icon={<Award size={20} className="text-white" />} color="bg-[#0891B2]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Сотрудников" value={String(data.managers.length)} icon={<Users size={20} className="text-white" />} color="bg-[#64748B]" />
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('review')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">На проверке</p>
              <p className="text-2xl font-bold text-[#F59E0B]">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
              <CheckSquare size={20} className="text-[#F59E0B]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">План филиала</p>
              <p className="text-2xl font-bold text-[#0F172A]">{branch?.plan}</p>
            </div>
            <div className="w-10 h-10 bg-[#2563EB]/10 rounded-lg flex items-center justify-center">
              <ClipboardList size={20} className="text-[#2563EB]" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar current={branchKPI.totalSales} total={branch?.plan || 20} label="Выполнение плана филиала" />

      {/* Manager Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-medium text-[#0F172A]">Менеджеры филиала</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Имя</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Квал. лиды</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Продажи</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Конверсия</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">План</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Премия</th>
              </tr>
            </thead>
            <tbody>
              {managerStats.map(({ manager, kpi, bonus }) => (
                <tr key={manager.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{manager.name}</td>
                  <td className="px-4 py-3 text-[#0F172A]">{kpi.totalQualifiedLeads}</td>
                  <td className="px-4 py-3 text-[#0F172A]">{kpi.totalSales}</td>
                  <td className="px-4 py-3">
                    <span className={kpi.conversion > 20 ? 'text-[#16A34A] font-medium' : kpi.conversion >= 10 ? 'text-[#F59E0B] font-medium' : 'text-[#DC2626] font-medium'}>
                      {kpi.totalQualifiedLeads > 0 ? `${kpi.conversion.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#0F172A]">{kpi.planCompletion.toFixed(0)}%</td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{formatCurrency(bonus.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
