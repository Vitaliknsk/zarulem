import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { repository } from '../../services/repository';
import { BonusRule } from '../../types';
import { formatCurrency } from '../../lib/calculations';
import { calculateBonus } from '../../lib/calculations';
import { Save, Plus, Trash2, Calculator } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function BonusSettings() {
  const { addToast, refreshData, dataVersion } = useApp();
  const rules = useMemo(() => repository.getBonusRules(), [dataVersion]);
  const [editingRule, setEditingRule] = useState<BonusRule | null>(null);
  const [previewSales, setPreviewSales] = useState(15);
  const [previewPlan, setPreviewPlan] = useState(25);
  const [previewConversion, setPreviewConversion] = useState(18);

  const handleSave = () => {
    if (!editingRule) return;
    repository.saveBonusRule(editingRule);
    refreshData();
    addToast('Правило сохранено', 'success');
    setEditingRule(null);
  };

  const handleNew = () => {
    setEditingRule({
      id: uuidv4(),
      name: 'Новое правило',
      fixedPerSale: 800,
      planBonusThreshold: 80,
      planBonusAmount: 5000,
      conversionThreshold: 15,
      conversionBonus: 3000,
      steps: [{ minSales: 10, bonus: 2000 }],
      activeFrom: new Date().toISOString().split('T')[0],
    });
  };

  const handleDelete = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    localStorage.setItem('zarulem_bonus_rules', JSON.stringify(updated));
    refreshData();
    addToast('Правило удалено', 'info');
  };

  const previewBonus = editingRule ? calculateBonus(previewSales, previewPlan, previewConversion, [editingRule]) : { amount: 0, breakdown: { fixedPerSale: 0, planBonus: 0, conversionBonus: 0, stepBonus: 0 } };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Настройки премирования</h1>
          <p className="text-[#64748B] mt-1">Конструктор правил расчёта премий</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8]">
          <Plus size={16} /> Новое правило
        </button>
      </div>

      {/* Existing Rules */}
      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-[#0F172A]">{rule.name}</h3>
                <p className="text-xs text-[#64748B]">Действует с {rule.activeFrom}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingRule({ ...rule })} className="px-3 py-1.5 text-sm text-[#2563EB] hover:bg-blue-50 rounded-lg">
                  Редактировать
                </button>
                <button onClick={() => handleDelete(rule.id)} className="px-3 py-1.5 text-sm text-[#DC2626] hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-[#F8FAFC] rounded-lg p-2">
                <p className="text-[#64748B] text-xs">За продажу</p>
                <p className="font-semibold">{formatCurrency(rule.fixedPerSale)}</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2">
                <p className="text-[#64748B] text-xs">Бонус за план</p>
                <p className="font-semibold">{formatCurrency(rule.planBonusAmount)}</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2">
                <p className="text-[#64748B] text-xs">Порог конверсии</p>
                <p className="font-semibold">{rule.conversionThreshold}%</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2">
                <p className="text-[#64748B] text-xs">Бонус за конверсию</p>
                <p className="font-semibold">{formatCurrency(rule.conversionBonus)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      {editingRule && (
        <div className="bg-white rounded-xl border border-[#2563EB] p-6 space-y-4">
          <h3 className="text-lg font-semibold text-[#0F172A]">Редактирование правила</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#64748B] block mb-1">Название</label>
              <input value={editingRule.name} onChange={e => setEditingRule({ ...editingRule, name: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
            </div>
            <div>
              <label className="text-sm text-[#64748B] block mb-1">Дата начала</label>
              <input type="date" value={editingRule.activeFrom} onChange={e => setEditingRule({ ...editingRule, activeFrom: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
            </div>
            <div>
              <label className="text-sm text-[#64748B] block mb-1">Фикс. сумма за продажу (₽)</label>
              <input type="number" value={editingRule.fixedPerSale} onChange={e => setEditingRule({ ...editingRule, fixedPerSale: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
            </div>
            <div>
              <label className="text-sm text-[#64748B] block mb-1">Порог выполнения плана (%)</label>
              <input type="number" value={editingRule.planBonusThreshold} onChange={e => setEditingRule({ ...editingRule, planBonusThreshold: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
            </div>
            <div>
              <label className="text-sm text-[#64748B] block mb-1">Бонус за план (₽)</label>
              <input type="number" value={editingRule.planBonusAmount} onChange={e => setEditingRule({ ...editingRule, planBonusAmount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
            </div>
            <div>
              <label className="text-sm text-[#64748B] block mb-1">Порог конверсии (%)</label>
              <input type="number" value={editingRule.conversionThreshold} onChange={e => setEditingRule({ ...editingRule, conversionThreshold: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
            </div>
            <div>
              <label className="text-sm text-[#64748B] block mb-1">Бонус за конверсию (₽)</label>
              <input type="number" value={editingRule.conversionBonus} onChange={e => setEditingRule({ ...editingRule, conversionBonus: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="text-sm text-[#64748B] block mb-2">Ступенчатые бонусы</label>
            {editingRule.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-2">
                <span className="text-sm text-[#64748B]">от</span>
                <input type="number" value={step.minSales} onChange={e => {
                  const steps = [...editingRule.steps];
                  steps[idx] = { ...steps[idx], minSales: parseInt(e.target.value) || 0 };
                  setEditingRule({ ...editingRule, steps });
                }} className="w-20 px-2 py-1 border border-[#E2E8F0] rounded text-sm" />
                <span className="text-sm text-[#64748B]">продаж → бонус</span>
                <input type="number" value={step.bonus} onChange={e => {
                  const steps = [...editingRule.steps];
                  steps[idx] = { ...steps[idx], bonus: parseInt(e.target.value) || 0 };
                  setEditingRule({ ...editingRule, steps });
                }} className="w-28 px-2 py-1 border border-[#E2E8F0] rounded text-sm" />
                <span className="text-sm text-[#64748B]">₽</span>
                <button onClick={() => {
                  const steps = editingRule.steps.filter((_, i) => i !== idx);
                  setEditingRule({ ...editingRule, steps });
                }} className="text-[#DC2626] hover:bg-red-50 p-1 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => setEditingRule({ ...editingRule, steps: [...editingRule.steps, { minSales: 0, bonus: 0 }] })} className="text-sm text-[#2563EB] hover:underline">
              + Добавить ступень
            </button>
          </div>

          {/* Preview */}
          <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0]">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={16} className="text-[#2563EB]" />
              <span className="text-sm font-medium text-[#0F172A]">Предварительный расчёт</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <label className="text-xs text-[#64748B]">Продажи</label>
                <input type="number" value={previewSales} onChange={e => setPreviewSales(parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-[#E2E8F0] rounded text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#64748B]">План</label>
                <input type="number" value={previewPlan} onChange={e => setPreviewPlan(parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-[#E2E8F0] rounded text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#64748B]">Конверсия %</label>
                <input type="number" value={previewConversion} onChange={e => setPreviewConversion(parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-[#E2E8F0] rounded text-sm" />
              </div>
            </div>
            <div className="text-lg font-bold text-[#2563EB]">
              Результат: {formatCurrency(previewBonus.amount)}
            </div>
            <div className="text-xs text-[#64748B] mt-1">
              За продажу: {formatCurrency(previewBonus.breakdown.fixedPerSale)} | План: {formatCurrency(previewBonus.breakdown.planBonus)} | Конверсия: {formatCurrency(previewBonus.breakdown.conversionBonus)} | Ступень: {formatCurrency(previewBonus.breakdown.stepBonus)}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8]">
              <Save size={16} /> Сохранить
            </button>
            <button onClick={() => setEditingRule(null)} className="px-6 py-2 bg-[#F1F5F9] text-[#64748B] rounded-lg text-sm font-medium hover:bg-[#E2E8F0]">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>Важно:</strong> Изменение правил не влияет на уже утверждённые начисления за прошедшие периоды. 
          Новые правила применяются только к отчётам, отправленным после даты начала действия.
        </p>
      </div>
    </div>
  );
}
