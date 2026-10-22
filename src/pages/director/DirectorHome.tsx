import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { KPICard } from '../../components/ui';
import { calculateBranchKPI, calculateConversion, calculateBonus, formatCurrency, getCurrentMonth } from '../../lib/calculations';
import { Building2, Users, ShoppingCart, TrendingUp, Award, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface DirectorHomeProps {
  onNavigate: (page: string) => void;
}

export default function DirectorHome({ onNavigate }: DirectorHomeProps) {
  const { dataVersion } = useApp();

  const data = useMemo(() => {
    const branches = repository.getBranches();
    const allUsers = repository.getUsers();
    const allReports = repository.getReports();
    const currentMonth = getCurrentMonth();
    const monthReports = allReports.filter(r => r.date.startsWith(currentMonth));
    const approvedReports = monthReports.filter(r => r.status === 'APPROVED');
    const managers = allUsers.filter(u => u.role === 'manager');
    const rules = repository.getBonusRules();

    // Aggregate by branch
    const branchStats = branches.map(branch => {
      const branchReports = approvedReports.filter(r => r.branchId === branch.id);
      const kpi = calculateBranchKPI(branchReports, branch.plan);
      const branchManagers = managers.filter(m => m.branchId === branch.id);
      return { branch, kpi, managerCount: branchManagers.length };
    });

    // Total network KPI
    const totalSales = branchStats.reduce((s, b) => s + b.kpi.totalSales, 0);
    const totalLeads = branchStats.reduce((s, b) => s + b.kpi.totalQualifiedLeads, 0);
    const totalPlan = branches.reduce((s, b) => s + b.plan, 0);
    const networkConversion = calculateConversion(totalSales, totalLeads);
    const networkPlanCompletion = totalPlan > 0 ? (totalSales / totalPlan) * 100 : 0;

    // Total bonus fund
    let totalBonusFund = 0;
    branchStats.forEach(bs => {
      const branchManagers = managers.filter(m => m.branchId === bs.branch.id);
      const perManagerPlan = Math.round(bs.branch.plan / Math.max(branchManagers.length, 1));
      branchManagers.forEach(m => {
        const mReports = approvedReports.filter(r => r.userId === m.id);
        const mKpi = calculateBranchKPI(mReports, perManagerPlan);
        const bonus = calculateBonus(mKpi.totalSales, perManagerPlan, mKpi.conversion, rules);
        totalBonusFund += bonus.amount;
      });
    });

    // Channel distribution
    const channelData = [
      { name: 'Входящая линия', value: 0 },
      { name: 'Tilda', value: 0 },
      { name: 'VK/Дезертир', value: 0 },
      { name: 'Мессенджеры', value: 0 },
    ];
    approvedReports.forEach(r => {
      channelData[0].value += r.data.incomingLine.sales;
      channelData[1].value += r.data.tilda.sales;
      channelData[2].value += r.data.vkDesertir.sales;
      channelData[3].value += r.data.messengers.sales;
    });

    return { branches, branchStats, totalSales, totalLeads, totalPlan, networkConversion, networkPlanCompletion, totalBonusFund, managerCount: managers.length, channelData };
  }, [dataVersion]);

  const COLORS = ['#2563EB', '#7C3AED', '#F59E0B', '#16A34A'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Обзор сети</h1>
        <p className="text-[#64748B] mt-1">Общая аналитика по всем филиалам</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="Филиалов" value={String(data.branches.length)} icon={<Building2 size={20} className="text-white" />} color="bg-[#2563EB]" />
        <KPICard title="Менеджеров" value={String(data.managerCount)} icon={<Users size={20} className="text-white" />} color="bg-[#7C3AED]" />
        <KPICard title="Всего продаж" value={String(data.totalSales)} icon={<ShoppingCart size={20} className="text-white" />} color="bg-[#0891B2]" />
        <KPICard title="Общая конверсия" value={`${data.networkConversion.toFixed(1)}%`} icon={<TrendingUp size={20} className="text-white" />} color={data.networkConversion > 20 ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'} />
        <KPICard title="Выполнение плана" value={`${data.networkPlanCompletion.toFixed(0)}%`} icon={<Target size={20} className="text-white" />} color="bg-[#2563EB]" />
        <KPICard title="Фонд премий" value={formatCurrency(data.totalBonusFund)} icon={<Award size={20} className="text-white" />} color="bg-[#DC2626]" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Branch */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h3 className="text-sm font-medium text-[#0F172A] mb-4">Продажи по филиалам</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.branchStats.map(bs => ({ name: bs.branch.name, sales: bs.kpi.totalSales, plan: bs.branch.plan }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" name="Продажи" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="plan" name="План" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Distribution */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h3 className="text-sm font-medium text-[#0F172A] mb-4">Распределение продаж по каналам</h3>
          {data.channelData.some(c => c.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.channelData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.channelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#64748B] text-center py-12">Нет данных</p>
          )}
        </div>
      </div>

      {/* Branch Rating */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <h3 className="text-sm font-medium text-[#0F172A] mb-4">Рейтинг филиалов по конверсии</h3>
        <div className="space-y-3">
          {[...data.branchStats]
            .sort((a, b) => b.kpi.conversion - a.kpi.conversion)
            .map((bs, idx) => (
              <div key={bs.branch.id} className="flex items-center gap-4">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#0F172A]">{bs.branch.name}</span>
                    <span className={`text-sm font-semibold ${
                      bs.kpi.conversion > 20 ? 'text-[#16A34A]' : bs.kpi.conversion >= 10 ? 'text-[#F59E0B]' : 'text-[#DC2626]'
                    }`}>
                      {bs.kpi.conversion.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        bs.kpi.conversion > 20 ? 'bg-[#16A34A]' : bs.kpi.conversion >= 10 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
                      }`}
                      style={{ width: `${Math.min(bs.kpi.conversion * 3, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-xs text-[#64748B]">
                  <p>{bs.kpi.totalSales} продаж</p>
                  <p>{bs.managerCount} менеджеров</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Branch Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-medium text-[#0F172A]">Филиалы</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Филиал</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Менеджеров</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Продажи</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">План</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Выполнение</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Конверсия</th>
              </tr>
            </thead>
            <tbody>
              {data.branchStats.map(bs => (
                <tr key={bs.branch.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer" onClick={() => onNavigate('branches')}>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{bs.branch.name}</td>
                  <td className="px-4 py-3 text-[#0F172A]">{bs.managerCount}</td>
                  <td className="px-4 py-3 text-[#0F172A]">{bs.kpi.totalSales}</td>
                  <td className="px-4 py-3 text-[#0F172A]">{bs.branch.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${bs.kpi.planCompletion >= 80 ? 'text-[#16A34A]' : bs.kpi.planCompletion >= 50 ? 'text-[#F59E0B]' : 'text-[#DC2626]'}`}>
                      {bs.kpi.planCompletion.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={bs.kpi.conversion > 20 ? 'text-[#16A34A] font-medium' : bs.kpi.conversion >= 10 ? 'text-[#F59E0B] font-medium' : 'text-[#DC2626] font-medium'}>
                      {bs.kpi.conversion.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
