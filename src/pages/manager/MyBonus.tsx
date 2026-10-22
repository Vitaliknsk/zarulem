import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { calculateManagerKPI, calculateBonus, formatCurrency, getCurrentMonth } from '../../lib/calculations';
import { Award, CheckCircle2, Clock, TrendingUp, Target } from 'lucide-react';

export default function MyBonus() {
  const { currentUser, dataVersion } = useApp();

  const data = useMemo(() => {
    if (!currentUser) return null;
    const branch = repository.getBranch(currentUser.branchId);
    const reports = repository.getReportsByUser(currentUser.id);
    const currentMonth = getCurrentMonth();
    const monthReports = reports.filter(r => r.date.startsWith(currentMonth));
    const approvedReports = monthReports.filter(r => r.status === 'APPROVED');
    const pendingReports = monthReports.filter(r => r.status === 'SUBMITTED');
    
    const kpi = calculateManagerKPI(approvedReports, branch?.plan || 25);
    const rules = repository.getBonusRules();
    const bonus = calculateBonus(kpi.totalSales, branch?.plan || 25, kpi.conversion, rules);

    return { kpi, bonus, branch, approvedCount: approvedReports.length, pendingCount: pendingReports.length };
  }, [currentUser, dataVersion]);

  if (!data) return null;
  const { kpi, bonus, branch, approvedCount, pendingCount } = data;

  const monthName = new Date().toLocaleDateString('ru-RU', { month: 'long' });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Моя премия</h1>
        <p className="text-[#64748B] mt-1">Расчёт мотивации за текущий месяц</p>
      </div>

      {/* Main Bonus Card */}
      <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Award size={24} />
          <span className="text-sm opacity-80">Моя премия за {monthName}</span>
        </div>
        <p className="text-4xl font-bold">{formatCurrency(bonus.amount)}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm opacity-80">
          <span>Подтверждённых отчётов: {approvedCount}</span>
          <span>На проверке: {pendingCount}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Расшифровка расчёта</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Фиксированная ставка за продажу</p>
                <p className="text-xs text-[#64748B]">{kpi.totalSales} × {formatCurrency(bonus.breakdown.fixedPerSale / Math.max(kpi.totalSales, 1))}</p>
              </div>
            </div>
            <span className="font-semibold text-[#0F172A]">{formatCurrency(bonus.breakdown.fixedPerSale)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Target size={16} className="text-[#16A34A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Бонус за выполнение плана</p>
                <p className="text-xs text-[#64748B]">Выполнение: {kpi.planCompletion.toFixed(0)}%</p>
              </div>
            </div>
            <span className="font-semibold text-[#0F172A]">{formatCurrency(bonus.breakdown.planBonus)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award size={16} className="text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Бонус за конверсию</p>
                <p className="text-xs text-[#64748B]">Конверсия: {kpi.conversion.toFixed(1)}%</p>
              </div>
            </div>
            <span className="font-semibold text-[#0F172A]">{formatCurrency(bonus.breakdown.conversionBonus)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={16} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Ступенчатый бонус</p>
                <p className="text-xs text-[#64748B]">Продажи: {kpi.totalSales}</p>
              </div>
            </div>
            <span className="font-semibold text-[#0F172A]">{formatCurrency(bonus.breakdown.stepBonus)}</span>
          </div>

          <div className="flex items-center justify-between py-3 bg-[#F8FAFC] rounded-lg px-4 -mx-2">
            <span className="font-semibold text-[#0F172A]">ИТОГО</span>
            <span className="text-xl font-bold text-[#2563EB]">{formatCurrency(bonus.amount)}</span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>Примечание:</strong> Сумма является демонстрационной и рассчитана по текущим правилам премирования. 
          Окончательная премия утверждается руководителем филиала по итогам месяца.
        </p>
      </div>
    </div>
  );
}
