import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import { ToastContainer } from './components/ui';

// Manager pages
import ManagerHome from './pages/manager/ManagerHome';
import ReportForm from './pages/manager/ReportForm';
import MyReports from './pages/manager/MyReports';
import MyMetrics from './pages/manager/MyMetrics';
import MyBonus from './pages/manager/MyBonus';
import KnowledgeBase from './pages/manager/KnowledgeBase';

// Branch pages
import BranchHeadHome from './pages/branch/BranchHeadHome';
import ReviewReports from './pages/branch/ReviewReports';
import BranchManagers from './pages/branch/BranchManagers';

// Director pages
import DirectorHome from './pages/director/DirectorHome';
import BonusSettings from './pages/director/BonusSettings';

function AppContent() {
  const { currentRole } = useApp();
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    // Manager pages
    if (currentRole === 'manager') {
      switch (currentPage) {
        case 'home': return <ManagerHome onNavigate={setCurrentPage} />;
        case 'report-new': return <ReportForm onNavigate={setCurrentPage} />;
        case 'reports': return <MyReports />;
        case 'metrics': return <MyMetrics />;
        case 'bonus': return <MyBonus />;
        case 'knowledge': return <KnowledgeBase />;
        case 'profile': return <ProfilePage />;
        default: return <ManagerHome onNavigate={setCurrentPage} />;
      }
    }

    // Branch head pages
    if (currentRole === 'branch_head') {
      switch (currentPage) {
        case 'home': return <BranchHeadHome onNavigate={setCurrentPage} />;
        case 'review': return <ReviewReports />;
        case 'managers': return <BranchManagers />;
        case 'analytics': return <BranchAnalytics />;
        case 'plans': return <PlansPage />;
        case 'bonuses': return <BranchBonuses />;
        case 'knowledge': return <KnowledgeBase />;
        default: return <BranchHeadHome onNavigate={setCurrentPage} />;
      }
    }

    // Director pages
    switch (currentPage) {
      case 'home': return <DirectorHome onNavigate={setCurrentPage} />;
      case 'branches': return <BranchesPage />;
      case 'employees': return <EmployeesPage />;
      case 'analytics': return <NetworkAnalytics />;
      case 'plans': return <PlansPage />;
      case 'bonus-fund': return <BonusSettings />;
      case 'reports': return <AllReports />;
      case 'settings': return <BonusSettings />;
      default: return <DirectorHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

// === Placeholder pages ===

function ProfilePage() {
  const { currentUser } = useApp();
  const branch = currentUser ? JSON.parse(localStorage.getItem('zarulem_branches') || '[]').find((b: any) => b.id === currentUser.branchId) : null;
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Профиль</h1>
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-[#2563EB]">{currentUser?.name?.[0]}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#0F172A]">{currentUser?.name}</h2>
            <p className="text-sm text-[#64748B]">Менеджер • {branch?.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-[#F8FAFC] rounded-lg p-3">
            <p className="text-[#64748B]">Роль</p>
            <p className="font-medium text-[#0F172A]">Менеджер по продажам</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-3">
            <p className="text-[#64748B]">Филиал</p>
            <p className="font-medium text-[#0F172A]">{branch?.name}</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-3">
            <p className="text-[#64748B]">Email</p>
            <p className="font-medium text-[#0F172A]">{currentUser?.name?.toLowerCase()}@zarulem.ru</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-3">
            <p className="text-[#64748B]">Телефон</p>
            <p className="font-medium text-[#0F172A]">+7 (9XX) XXX-XX-XX</p>
          </div>
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>Прототип:</strong> Редактирование профиля будет доступно в рабочей версии после подключения серверной авторизации.
        </p>
      </div>
    </div>
  );
}

function BranchAnalytics() {
  const { currentUser, dataVersion } = useApp();
  const branch = currentUser ? JSON.parse(localStorage.getItem('zarulem_branches') || '[]').find((b: any) => b.id === currentUser.branchId) : null;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Аналитика филиала — {branch?.name}</h1>
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
        <p className="text-[#64748B]">Расширенная аналитика филиала с графиками и трендами.</p>
        <p className="text-sm text-[#64748B] mt-2">Данные рассчитываются из утверждённых отчётов менеджеров.</p>
      </div>
    </div>
  );
}

function PlansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Планы и KPI</h1>
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Будущая функциональность:</strong> Настройка планов продаж для филиалов и менеджеров. 
            В прототипе планы заданы в демонстрационных данных.
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-[#0F172A]">Текущие планы на месяц:</h3>
          {[
            { name: 'Новосибирск', plan: 25 },
            { name: 'Филиал №2', plan: 20 },
            { name: 'Филиал №3', plan: 18 },
          ].map(b => (
            <div key={b.name} className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-sm text-[#0F172A]">{b.name}</span>
              <span className="text-sm font-semibold text-[#0F172A]">{b.plan} договоров</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BranchBonuses() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Премии филиала</h1>
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <p className="text-[#64748B]">Расчёт и утверждение премий менеджеров филиала.</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-yellow-800">
            <strong>Прототип:</strong> Полное утверждение премий будет доступно в рабочей версии.
          </p>
        </div>
      </div>
    </div>
  );
}

function BranchesPage() {
  const { dataVersion } = useApp();
  const branches = JSON.parse(localStorage.getItem('zarulem_branches') || '[]');
  const users = JSON.parse(localStorage.getItem('zarulem_users') || '[]');
  const reports = JSON.parse(localStorage.getItem('zarulem_reports') || '[]');
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Филиалы</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((branch: any) => {
          const branchManagers = users.filter((u: any) => u.branchId === branch.id && u.role === 'manager');
          const approvedReports = reports.filter((r: any) => r.branchId === branch.id && r.date.startsWith(currentMonth) && r.status === 'APPROVED');
          let totalSales = 0;
          let totalLeads = 0;
          approvedReports.forEach((r: any) => {
            totalSales += r.data.incomingLine.sales + r.data.tilda.sales + r.data.vkDesertir.sales + r.data.messengers.sales;
            totalLeads += r.data.incomingLine.qualifiedLeads + r.data.tilda.qualifiedLeads + r.data.vkDesertir.qualifiedLeads + r.data.messengers.qualifiedLeads;
          });
          const conversion = totalLeads > 0 ? ((totalSales / totalLeads) * 100) : 0;
          const planCompletion = branch.plan > 0 ? (totalSales / branch.plan) * 100 : 0;
          
          return (
            <div key={branch.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[#0F172A] mb-3">{branch.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Менеджеров</span>
                  <span className="font-medium text-[#0F172A]">{branchManagers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Продажи</span>
                  <span className="font-medium text-[#0F172A]">{totalSales} / {branch.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Конверсия</span>
                  <span className={`font-medium ${conversion > 20 ? 'text-[#16A34A]' : conversion >= 10 ? 'text-[#F59E0B]' : 'text-[#DC2626]'}`}>
                    {totalLeads > 0 ? `${conversion.toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">План</span>
                  <span className="font-medium text-[#0F172A]">{planCompletion.toFixed(0)}%</span>
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${planCompletion >= 80 ? 'bg-[#16A34A]' : planCompletion >= 50 ? 'bg-[#F59E0B]' : 'bg-[#2563EB]'}`} style={{ width: `${Math.min(planCompletion, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmployeesPage() {
  const { dataVersion } = useApp();
  const users = JSON.parse(localStorage.getItem('zarulem_users') || '[]');
  const branches = JSON.parse(localStorage.getItem('zarulem_branches') || '[]');
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Сотрудники</h1>
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Имя</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Роль</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Филиал</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const branch = branches.find((b: any) => b.id === user.branchId);
                return (
                  <tr key={user.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-medium text-[#0F172A]">{user.name}</td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {user.role === 'manager' ? 'Менеджер' : user.role === 'branch_head' ? 'Руководитель' : 'Директор'}
                    </td>
                    <td className="px-4 py-3 text-[#0F172A]">{branch?.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NetworkAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Аналитика сети</h1>
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
        <p className="text-[#64748B]">Полная аналитика сети с детализацией по филиалам, менеджерам и каналам.</p>
        <p className="text-sm text-[#64748B] mt-2">Включает тренды, прогнозы и сравнение периодов.</p>
      </div>
    </div>
  );
}

function AllReports() {
  const { dataVersion } = useApp();
  const reports = JSON.parse(localStorage.getItem('zarulem_reports') || '[]');
  const users = JSON.parse(localStorage.getItem('zarulem_users') || '[]');
  
  const recentReports = reports
    .sort((a: any, b: any) => b.date.localeCompare(a.date))
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Все отчёты</h1>
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Менеджер</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Дата</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748B]">Статус</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report: any) => {
                const user = users.find((u: any) => u.id === report.userId);
                return (
                  <tr key={report.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-medium text-[#0F172A]">{user?.name || '—'}</td>
                    <td className="px-4 py-3 text-[#0F172A]">{report.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        report.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                        report.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.status === 'APPROVED' ? 'Подтверждён' :
                         report.status === 'SUBMITTED' ? 'На проверке' :
                         report.status === 'REJECTED' ? 'Возвращён' : 'Черновик'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <ToastContainer />
    </AppProvider>
  );
}
