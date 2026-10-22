import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { calculateManagerKPI, calculateBonus, formatCurrency, getCurrentMonth } from '../../lib/calculations';
import { Users, User, Award } from 'lucide-react';

export default function BranchManagers() {
  const { currentUser, dataVersion } = useApp();

  const data = useMemo(() => {
    if (!currentUser) return null;
    const managers = repository.getManagersByBranch(currentUser.branchId);
    const branch = repository.getBranch(currentUser.branchId);
    const currentMonth = getCurrentMonth();
    const rules = repository.getBonusRules();
    const perManagerPlan = Math.round((branch?.plan || 20) / managers.length);

    const managerData = managers.map(m => {
      const reports = repository.getReportsByUser(m.id).filter(r => r.date.startsWith(currentMonth) && r.status === 'APPROVED');
      const kpi = calculateManagerKPI(reports, perManagerPlan);
      const bonus = calculateBonus(kpi.totalSales, perManagerPlan, kpi.conversion, rules);
      const allReports = repository.getReportsByUser(m.id);
      const pendingCount = allReports.filter(r => r.status === 'SUBMITTED').length;
      return { manager: m, kpi, bonus, pendingCount };
    });

    return { managerData, perManagerPlan };
  }, [currentUser, dataVersion]);

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Менеджеры</h1>
        <p className="text-[#64748B] mt-1">Сотрудники филиала и их показатели</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.managerData.map(({ manager, kpi, bonus, pendingCount }) => (
          <div key={manager.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
                <User size={18} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="font-medium text-[#0F172A]">{manager.name}</p>
                <p className="text-xs text-[#64748B]">Менеджер</p>
              </div>
              {pendingCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium rounded-full">
                  {pendingCount} на проверке
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#F8FAFC] rounded-lg p-2">
                <p className="text-[#64748B] text-xs">Продажи</p>
                <p className="font-semibold text-[#0F172A]">{kpi.totalSales}</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2">
                <p className="text-[#64748B] text-xs">Конверсия</p>
                <p className={`font-semibold ${kpi.conversion > 20 ? 'text-[#16A34A]' : kpi.conversion >= 10 ? 'text-[#F59E0B]' : 'text-[#DC2626]'}`}>
                  {kpi.totalQualifiedLeads > 0 ? `${kpi.conversion.toFixed(1)}%` : '—'}
                </p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2">
                <p className="text-[#64748B] text-xs">План</p>
                <p className="font-semibold text-[#0F172A]">{kpi.planCompletion.toFixed(0)}%</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2">
                <p className="text-[#64748B] text-xs">Премия</p>
                <p className="font-semibold text-[#2563EB]">{formatCurrency(bonus.amount)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
