import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { KPICard, ProgressBar, StatusBadge } from '../../components/ui';
import { Award, TrendingUp, ShoppingCart, Target, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { calculateManagerKPI, calculateBonus, formatCurrency, getTodayStr, getCurrentMonth } from '../../lib/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ManagerHomeProps {
  onNavigate: (page: string) => void;
}

export default function ManagerHome({ onNavigate }: ManagerHomeProps) {
  const { currentUser, dataVersion } = useApp();
  
  const data = useMemo(() => {
    if (!currentUser) return null;
    
    const branch = repository.getBranch(currentUser.branchId);
    const reports = repository.getReportsByUser(currentUser.id);
    const currentMonth = getCurrentMonth();
    const monthReports = reports.filter(r => r.date.startsWith(currentMonth));
    const todayStr = getTodayStr();
    const todayReport = reports.find(r => r.date === todayStr);
    const rules = repository.getBonusRules();
    
    const kpi = calculateManagerKPI(monthReports, branch?.plan || 25);
    const bonus = calculateBonus(kpi.totalSales, branch?.plan || 25, kpi.conversion, rules);
    
    // Данные для графика
    const chartData = monthReports
      .filter(r => r.status === 'APPROVED')
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => {
        const totals = { sales: 0, qualifiedLeads: 0 };
        totals.sales = r.data.incomingLine.sales + r.data.tilda.sales + r.data.vkDesertir.sales + r.data.messengers.sales;
        totals.qualifiedLeads = r.data.incomingLine.qualifiedLeads + r.data.tilda.qualifiedLeads + r.data.vkDesertir.qualifiedLeads + r.data.messengers.qualifiedLeads;
        return {
          date: r.date.slice(5),
          sales: totals.sales,
          conversion: totals.qualifiedLeads > 0 ? ((totals.sales / totals.qualifiedLeads) * 100).toFixed(1) : 0,
        };
      });

    const recentReports = reports
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return { branch, kpi, bonus, todayReport, chartData, recentReports };
  }, [currentUser, dataVersion]);

  if (!data || !currentUser) return null;

  const { branch, kpi, bonus, todayReport, chartData, recentReports } = data;
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">{greeting}, {currentUser.name}!</h1>
        <p className="text-[#64748B] mt-1">Филиал: {branch?.name}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Моя премия" 
          value={formatCurrency(bonus.amount)} 
          icon={<Award size={20} className="text-white" />}
          color="bg-[#2563EB]"
        />
        <KPICard 
          title="Моя конверсия" 
          value={`${kpi.conversion.toFixed(1)}%`}
          icon={<TrendingUp size={20} className="text-white" />}
          color={kpi.conversion > 20 ? 'bg-[#16A34A]' : kpi.conversion >= 10 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'}
        />
        <KPICard 
          title="Продажи за месяц" 
          value={String(kpi.totalSales)}
          icon={<ShoppingCart size={20} className="text-white" />}
          color="bg-[#7C3AED]"
        />
        <KPICard 
          title="Выполнение плана" 
          value={`${kpi.planCompletion.toFixed(0)}%`}
          subtitle={`из ${branch?.plan || 25} договоров`}
          icon={<Target size={20} className="text-white" />}
          color="bg-[#0891B2]"
        />
      </div>

      {/* Progress Bar */}
      <ProgressBar 
        current={kpi.totalSales} 
        total={branch?.plan || 25} 
        label="Выполнение плана продаж"
      />

      {/* Today's Report Status */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <h3 className="text-sm font-medium text-[#0F172A] mb-3">Статус отчёта за сегодня</h3>
        {todayReport ? (
          <div className="flex items-center gap-3">
            {todayReport.status === 'APPROVED' ? (
              <>
                <CheckCircle2 size={20} className="text-[#16A34A]" />
                <span className="text-sm text-[#16A34A] font-medium">Отчёт подтверждён</span>
                <StatusBadge status={todayReport.status} />
              </>
            ) : todayReport.status === 'SUBMITTED' ? (
              <>
                <Clock size={20} className="text-[#2563EB]" />
                <span className="text-sm text-[#2563EB] font-medium">Отчёт на проверке</span>
                <StatusBadge status={todayReport.status} />
              </>
            ) : todayReport.status === 'REJECTED' ? (
              <>
                <AlertTriangle size={20} className="text-[#DC2626]" />
                <span className="text-sm text-[#DC2626] font-medium">Возвращён на исправление</span>
                <StatusBadge status={todayReport.status} />
                <button onClick={() => onNavigate('report-new')} className="ml-auto text-sm text-[#2563EB] hover:underline">
                  Исправить
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-[#64748B]">Черновик сохранён</span>
                <StatusBadge status={todayReport.status} />
                <button onClick={() => onNavigate('report-new')} className="ml-auto text-sm text-[#2563EB] hover:underline">
                  Продолжить
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-[#F59E0B]" />
            <span className="text-sm text-[#F59E0B] font-medium">Отчёт ещё не сдан</span>
            <button 
              onClick={() => onNavigate('report-new')}
              className="ml-auto px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
            >
              Заполнить отчёт
            </button>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h3 className="text-sm font-medium text-[#0F172A] mb-4">Продажи по дням</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" fill="#2563EB" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#64748B] text-center py-8">Нет данных</p>
          )}
        </div>

        {/* Conversion Chart */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h3 className="text-sm font-medium text-[#0F172A] mb-4">Динамика конверсии</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="conversion" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#64748B] text-center py-8">Нет данных</p>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[#0F172A]">Последние отчёты</h3>
          <button onClick={() => onNavigate('reports')} className="text-sm text-[#2563EB] hover:underline">
            Все отчёты →
          </button>
        </div>
        <div className="space-y-2">
          {recentReports.map(report => (
            <div key={report.id} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
              <span className="text-sm text-[#0F172A]">{new Date(report.date).toLocaleDateString('ru-RU')}</span>
              <StatusBadge status={report.status} />
            </div>
          ))}
          {recentReports.length === 0 && (
            <p className="text-sm text-[#64748B] text-center py-4">Нет отчётов</p>
          )}
        </div>
      </div>
    </div>
  );
}
