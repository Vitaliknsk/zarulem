import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { Report, ReportData, ReportStatus } from '../../types';
import { getTodayStr } from '../../lib/calculations';
import { calculateReportTotals } from '../../lib/calculations';
import { ChevronDown, ChevronUp, Save, Send, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ReportFormProps {
  onNavigate: (page: string) => void;
  editReportId?: string;
}

const emptyData: ReportData = {
  incomingLine: { incomingCalls: 0, qualifiedLeads: 0, approvals: 0, sales: 0 },
  tilda: { applications: 0, qualifiedLeads: 0, approvals: 0, sales: 0, duplicates: 0 },
  outgoing: { outgoingCalls: 0, freezer: 0 },
  vkDesertir: { applications: 0, reached: 0, qualifiedLeads: 0, approvals: 0, sales: 0 },
  messengers: { incomingMessages: 0, qualifiedLeads: 0, approvals: 0, sales: 0 },
};

export default function ReportForm({ onNavigate, editReportId }: ReportFormProps) {
  const { currentUser, addToast, refreshData } = useApp();
  const [date, setDate] = useState(getTodayStr());
  const [data, setData] = useState<ReportData>(emptyData);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    incomingLine: true, tilda: true, outgoing: false, vkDesertir: false, messengers: false,
  });
  const [existingReport, setExistingReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const existing = repository.getReportsByUserAndDate(currentUser.id, date);
    if (existing && existing.status !== 'SUBMITTED') {
      setExistingReport(existing);
      setData(existing.data);
    } else if (existing && existing.status === 'REJECTED') {
      setExistingReport(existing);
      setData(existing.data);
    } else {
      setExistingReport(null);
      setData(emptyData);
    }
  }, [currentUser, date]);

  const totals = useMemo(() => calculateReportTotals(data), [data]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateField = (section: keyof ReportData, field: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: numValue },
    }));
  };

  const handleSave = (status: ReportStatus) => {
    if (!currentUser) return;
    
    const report: Report = {
      id: existingReport?.id || `report-${currentUser.id}-${date}`,
      userId: currentUser.id,
      branchId: currentUser.branchId,
      date,
      data,
      status,
      createdAt: existingReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    repository.saveReport(report);
    refreshData();
    
    if (status === 'DRAFT') {
      addToast('Черновик сохранён', 'success');
    } else {
      addToast('Отчёт отправлен на проверку', 'success');
      onNavigate('reports');
    }
  };

  const branch = currentUser ? repository.getBranch(currentUser.branchId) : null;
  const isEditable = !existingReport || existingReport.status === 'DRAFT' || existingReport.status === 'REJECTED';

  const NumberInput = ({ section, field, label }: { section: keyof ReportData; field: string; label: string }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#64748B]">{label}</label>
      <input
        type="number"
        min={0}
        value={(data[section] as Record<string, number>)[field] || 0}
        onChange={e => updateField(section, field, e.target.value)}
        disabled={!isEditable}
        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
      />
    </div>
  );

  const SectionCard = ({ sectionKey, title, children }: { sectionKey: string; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
      >
        <span className="text-sm font-medium text-[#0F172A]">{title}</span>
        {expandedSections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-5 pb-5 pt-2 border-t border-[#E2E8F0]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#0F172A]">Ежедневный отчёт</h1>
            <p className="text-sm text-[#64748B] mt-1">
              {currentUser?.name} • {branch?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-[#64748B]">Дата:</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={!isEditable}
              className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>
        </div>
        
        {/* Totals indicator */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="px-3 py-1.5 bg-[#F1F5F9] rounded-lg">
            <span className="text-[#64748B]">Продажи: </span>
            <span className="font-semibold text-[#0F172A]">{totals.totalSales}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#F1F5F9] rounded-lg">
            <span className="text-[#64748B]">Квал. лиды: </span>
            <span className="font-semibold text-[#0F172A]">{totals.totalQualifiedLeads}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#F1F5F9] rounded-lg">
            <span className="text-[#64748B]">Согласования: </span>
            <span className="font-semibold text-[#0F172A]">{totals.totalApprovals}</span>
          </div>
        </div>

        {!isEditable && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#F59E0B] bg-yellow-50 px-3 py-2 rounded-lg">
            <AlertCircle size={16} />
            Отчёт отправлен на проверку и не может быть изменён
          </div>
        )}
        {existingReport?.status === 'REJECTED' && (
          <div className="mt-4 text-sm text-[#DC2626] bg-red-50 px-3 py-2 rounded-lg">
            <strong>Комментарий руководителя:</strong> {existingReport.rejectionComment}
          </div>
        )}
      </div>

      {/* Form Sections */}
      <SectionCard sectionKey="incomingLine" title="📞 Входящая линия">
        <NumberInput section="incomingLine" field="incomingCalls" label="Входящие звонки" />
        <NumberInput section="incomingLine" field="qualifiedLeads" label="Квалифицированные лиды" />
        <NumberInput section="incomingLine" field="approvals" label="Согласования" />
        <NumberInput section="incomingLine" field="sales" label="Продажи" />
      </SectionCard>

      <SectionCard sectionKey="tilda" title="🌐 Заявки Tilda">
        <NumberInput section="tilda" field="applications" label="Количество заявок" />
        <NumberInput section="tilda" field="qualifiedLeads" label="Квалифицированные лиды" />
        <NumberInput section="tilda" field="approvals" label="Согласования" />
        <NumberInput section="tilda" field="sales" label="Продажи" />
        <NumberInput section="tilda" field="duplicates" label="Дубли" />
      </SectionCard>

      <SectionCard sectionKey="outgoing" title="📱 Исходящие звонки и сообщения">
        <NumberInput section="outgoing" field="outgoingCalls" label="Исходящие звонки/сообщения" />
        <NumberInput section="outgoing" field="freezer" label="Морозилка" />
      </SectionCard>

      <SectionCard sectionKey="vkDesertir" title="📣 VK / Дезертир">
        <NumberInput section="vkDesertir" field="applications" label="Количество заявок" />
        <NumberInput section="vkDesertir" field="reached" label="Дозвонились/ответили" />
        <NumberInput section="vkDesertir" field="qualifiedLeads" label="Квалифицированные лиды" />
        <NumberInput section="vkDesertir" field="approvals" label="Согласования" />
        <NumberInput section="vkDesertir" field="sales" label="Продажи" />
      </SectionCard>

      <SectionCard sectionKey="messengers" title="💬 Мессенджеры">
        <NumberInput section="messengers" field="incomingMessages" label="Входящие обращения" />
        <NumberInput section="messengers" field="qualifiedLeads" label="Квалифицированные лиды" />
        <NumberInput section="messengers" field="approvals" label="Согласования" />
        <NumberInput section="messengers" field="sales" label="Продажи" />
      </SectionCard>

      {/* Actions */}
      {isEditable && (
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={() => handleSave('DRAFT')}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <Save size={16} />
            Сохранить черновик
          </button>
          <button
            onClick={() => handleSave('SUBMITTED')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
          >
            <Send size={16} />
            Отправить на проверку
          </button>
        </div>
      )}
    </div>
  );
}
