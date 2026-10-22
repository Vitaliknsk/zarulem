import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { KPICard } from '../../components/ui';
import { calculateManagerKPI, calculateConversion, getCurrentMonth, getConversionBgColor } from '../../lib/calculations';
import { TrendingUp, ShoppingCart, Target, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MyMetrics() {
  const { currentUser, dataVersion } = useApp();

  const data = useMemo(() => {
    if (!currentUser) return null;
    const branch = repository.getBranch(currentUser.branchId);
    const reports = repository.getReportsByUser(currentUser.id);
    const currentMonth = getCurrentMonth();
    const monthReports = reports.filter(r => r.date.startsWith(currentMonth) && r.status === 'APPROVED');
    
    const kpi = calculateManagerKPI(monthReports, branch?.plan || 25);
    
    // Данные по каналам
    const channelData = [
      { name: 'Входящая линия', sales: 0, leads: 0 },
      { name: 'Tilda', sales: 0, leads: 0 },
      { name: 'VK/Дезертир', sales: 0, leads: 0 },
      { name: 'Мессенджеры', sales: 0, leads: 0 },
    ];
    
    monthReports.forEach(r => {
      channelData[0].sales += r.data.incomingLine.sales;
      channelData[0].leads += r.data.incomingLine.qualifiedLeads;
      channelData[1].sales += r.data.tilda.sales;
      channelData[1].leads += r.data.tilda.qualifiedLeads;
      channelData[2].sales += r.data.vkDesertir.sales;
      channelData[2].leads += r.data.vkDesertir.qualifiedLeads;
      channelData[3].sales += r.data.messengers.sales;
      channelData[3].leads += r.data.messengers.qualifiedLeads;
    });

    // Динамика по дням
    const dailyData = monthReports
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => {
        const sales = r.data.incomingLine.sales + r.data.tilda.sales + r.data.vkDesertir.sales + r.data.messengers.sales;
        const leads = r.data.incomingLine.qualifiedLeads + r.data.tilda.qualifiedLeads + r.data.vkDesertir.qualifiedLeads + r.data.messengers.qualifiedLeads;
        return { date: r.date.slice(5), sales, leads, conversion: leads > 0 ? ((sales/leads)*100).toFixed(1) : 0 };
      });

    return { kpi, channelData, dailyData, branch };
  }, [currentUser, dataVersion]);

  if (!data) return null;
  const { kpi, channelData, dailyData, branch } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Мои показатели</h1>
        <p className="text-[#64748B] mt-1">Аналитика за текущий месяц</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Квалифицированные лиды" value={String(kpi.totalQualifiedLeads)} icon={<BarChart3 size={20} className="text-white" />} color="bg-[#2563EB]" />
        <KPICard title="Продажи" value={String(kpi.totalSales)} icon={<ShoppingCart size={20} className="text-white" />} color="bg-[#7C3AED]" />
        <KPICard 
          title="Конверсия" 
          value={kpi.totalQualifiedLeads > 0 ? `${kpi.conversion.toFixed(1)}%` : 'Нет данных'}
          icon={<TrendingUp size={20} className="text-white" />}
          color={kpi.conversion > 20 ? 'bg-[#16A34A]' : kpi.conversion >= 10 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'}
        />
        <KPICard 
          title="Выполнение плана" 
          value={`${kpi.planCompletion.toFixed(0)}%`}
          subtitle={`из ${branch?.plan || 25}`}
          icon={<Target size={20} className="text-white" />}
          color="bg-[#0891B2]"
        />
      </div>

      {/* Conversion indicator */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <h3 className="text-sm font-medium text-[#0F172A] mb-3">Индикатор конверсии</h3>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg text-lg font-bold ${getConversionBgColor(kpi.conversion)}`}>
            {kpi.totalQualifiedLeads > 0 ? `${kpi.conversion.toFixed(1)}%` : 'Нет данных'}
          </div>
          <div className="text-sm text-[#64748B]">
            <p>Формула: Продажи / Квалифицированные лиды × 100%</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border border-red-300 rounded"></span> &lt;10%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></span> 10-20%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span> &gt;20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h3 className="text-sm font-medium text-[#0F172A] mb-4">Динамика продаж</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" name="Продажи" stroke="#2563EB" strokeWidth={2} />
                <Line type="monotone" dataKey="leads" name="Квал. лиды" stroke="#7C3AED" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#64748B] text-center py-12">Нет данных за текущий месяц</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h3 className="text-sm font-medium text-[#0F172A] mb-4">Эффективность каналов</h3>
          {channelData.some(c => c.sales > 0 || c.leads > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Квал. лиды" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" name="Продажи" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#64748B] text-center py-12">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  );
}
