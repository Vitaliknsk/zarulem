import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { Report, ReportStatus } from '../../types';
import { StatusBadge, Modal, EmptyState } from '../../components/ui';
import { calculateReportTotals, calculateConversion, formatDate } from '../../lib/calculations';
import { CheckCircle2, XCircle, Eye, Filter, MessageSquare } from 'lucide-react';

export default function ReviewReports() {
  const { currentUser, addToast, refreshData, dataVersion } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('SUBMITTED');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const reports = useMemo(() => {
    if (!currentUser) return [];
    let reps = repository.getReportsByBranch(currentUser.branchId);
    if (statusFilter !== 'ALL') {
      reps = reps.filter(r => r.status === statusFilter);
    }
    return reps.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [currentUser, statusFilter, dataVersion]);

  const handleApprove = (report: Report) => {
    repository.updateReportStatus(report.id, 'APPROVED');
    refreshData();
    addToast(`Отчёт ${report.userId} за ${formatDate(report.date)} подтверждён`, 'success');
    setSelectedReport(null);
  };

  const handleReject = () => {
    if (!selectedReport || !rejectComment.trim()) {
      addToast('Необходимо указать комментарий', 'warning');
      return;
    }
    repository.updateReportStatus(selectedReport.id, 'REJECTED', rejectComment);
    refreshData();
    addToast('Отчёт возвращён на исправление', 'info');
    setSelectedReport(null);
    setShowRejectModal(false);
    setRejectComment('');
  };

  const getManagerName = (userId: string) => repository.getUser(userId)?.name || 'Неизвестный';

  const getReportSummary = (report: Report) => {
    const totals = calculateReportTotals(report.data);
    const conversion = calculateConversion(totals.totalSales, totals.totalQualifiedLeads);
    return { ...totals, conversion };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Проверка отчётов</h1>
        <p className="text-[#64748B] mt-1">Рассмотрение отчётов менеджеров филиала</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={16} className="text-[#64748B]" />
        {[
          { value: 'SUBMITTED', label: 'На проверке' },
          { value: 'APPROVED', label: 'Подтверждённые' },
          { value: 'REJECTED', label: 'Возвращённые' },
          { value: 'ALL', label: 'Все' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === opt.value ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      {reports.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Менеджер</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Дата</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Продажи</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Квал. лиды</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Конверсия</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Статус</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Действия</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => {
                  const summary = getReportSummary(report);
                  return (
                    <tr key={report.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-medium text-[#0F172A]">{getManagerName(report.userId)}</td>
                      <td className="px-4 py-3 text-[#0F172A]">{formatDate(report.date)}</td>
                      <td className="px-4 py-3 text-[#0F172A]">{summary.totalSales}</td>
                      <td className="px-4 py-3 text-[#0F172A]">{summary.totalQualifiedLeads}</td>
                      <td className="px-4 py-3">
                        <span className={summary.conversion > 20 ? 'text-[#16A34A] font-medium' : summary.conversion >= 10 ? 'text-[#F59E0B] font-medium' : 'text-[#DC2626] font-medium'}>
                          {summary.totalQualifiedLeads > 0 ? `${summary.conversion.toFixed(1)}%` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedReport(report)} className="text-[#2563EB] hover:underline text-sm flex items-center gap-1">
                          <Eye size={14} /> Открыть
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={<CheckCircle2 size={24} className="text-[#64748B]" />} title="Нет отчётов" description="Нет отчётов с выбранным статусом" />
      )}

      {/* Report Detail Modal */}
      <Modal isOpen={!!selectedReport} onClose={() => { setSelectedReport(null); setShowRejectModal(false); }} title={`Отчёт — ${selectedReport ? getManagerName(selectedReport.userId) : ''}`} size="lg">
        {selectedReport && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedReport.status} />
              <span className="text-sm text-[#64748B]">{formatDate(selectedReport.date)}</span>
            </div>

            {selectedReport.rejectionComment && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-[#DC2626]">
                <strong>Комментарий:</strong> {selectedReport.rejectionComment}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#0F172A] mb-2">📞 Входящая линия</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Звонки: <strong>{selectedReport.data.incomingLine.incomingCalls}</strong></div>
                  <div>Квал. лиды: <strong>{selectedReport.data.incomingLine.qualifiedLeads}</strong></div>
                  <div>Согласования: <strong>{selectedReport.data.incomingLine.approvals}</strong></div>
                  <div>Продажи: <strong>{selectedReport.data.incomingLine.sales}</strong></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#0F172A] mb-2">🌐 Заявки Tilda</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Заявки: <strong>{selectedReport.data.tilda.applications}</strong></div>
                  <div>Квал. лиды: <strong>{selectedReport.data.tilda.qualifiedLeads}</strong></div>
                  <div>Согласования: <strong>{selectedReport.data.tilda.approvals}</strong></div>
                  <div>Продажи: <strong>{selectedReport.data.tilda.sales}</strong></div>
                  <div>Дубли: <strong>{selectedReport.data.tilda.duplicates}</strong></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#0F172A] mb-2">📱 Исходящие</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Звонки: <strong>{selectedReport.data.outgoing.outgoingCalls}</strong></div>
                  <div>Морозилка: <strong>{selectedReport.data.outgoing.freezer}</strong></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#0F172A] mb-2">📣 VK / Дезертир</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Заявки: <strong>{selectedReport.data.vkDesertir.applications}</strong></div>
                  <div>Дозвон: <strong>{selectedReport.data.vkDesertir.reached}</strong></div>
                  <div>Квал. лиды: <strong>{selectedReport.data.vkDesertir.qualifiedLeads}</strong></div>
                  <div>Продажи: <strong>{selectedReport.data.vkDesertir.sales}</strong></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#0F172A] mb-2">💬 Мессенджеры</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Обращения: <strong>{selectedReport.data.messengers.incomingMessages}</strong></div>
                  <div>Квал. лиды: <strong>{selectedReport.data.messengers.qualifiedLeads}</strong></div>
                  <div>Согласования: <strong>{selectedReport.data.messengers.approvals}</strong></div>
                  <div>Продажи: <strong>{selectedReport.data.messengers.sales}</strong></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#0F172A] mb-2">📊 Итого</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Продажи: <strong>{getReportSummary(selectedReport).totalSales}</strong></div>
                  <div>Квал. лиды: <strong>{getReportSummary(selectedReport).totalQualifiedLeads}</strong></div>
                  <div>Конверсия: <strong>{getReportSummary(selectedReport).totalQualifiedLeads > 0 ? `${getReportSummary(selectedReport).conversion.toFixed(1)}%` : '—'}</strong></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedReport.status === 'SUBMITTED' && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={() => handleApprove(selectedReport)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#16A34A] text-white rounded-lg text-sm font-medium hover:bg-[#15803D] transition-colors"
                >
                  <CheckCircle2 size={16} />
                  Подтвердить отчёт
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#DC2626] text-white rounded-lg text-sm font-medium hover:bg-[#B91C1C] transition-colors"
                >
                  <XCircle size={16} />
                  Вернуть на исправление
                </button>
              </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <label className="text-sm font-medium text-[#0F172A] block mb-2">
                  Комментарий для менеджера (обязательно):
                </label>
                <textarea
                  value={rejectComment}
                  onChange={e => setRejectComment(e.target.value)}
                  placeholder="Опишите, что нужно исправить..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 focus:border-[#DC2626] min-h-[80px]"
                />
                <div className="flex gap-2 mt-3">
                  <button onClick={handleReject} className="px-4 py-2 bg-[#DC2626] text-white rounded-lg text-sm font-medium hover:bg-[#B91C1C]">
                    Отправить
                  </button>
                  <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-[#F1F5F9] text-[#64748B] rounded-lg text-sm font-medium hover:bg-[#E2E8F0]">
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
