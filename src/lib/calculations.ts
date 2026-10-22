import { Report, ReportData, BonusRule, BonusAccrual } from '../types';

// Подсчёт итогов по отчёту
export function calculateReportTotals(data: ReportData) {
  const totalSales =
    data.incomingLine.sales +
    data.tilda.sales +
    data.vkDesertir.sales +
    data.messengers.sales;

  const totalQualifiedLeads =
    data.incomingLine.qualifiedLeads +
    data.tilda.qualifiedLeads +
    data.vkDesertir.qualifiedLeads +
    data.messengers.qualifiedLeads;

  const totalApprovals =
    data.incomingLine.approvals +
    data.tilda.approvals +
    data.vkDesertir.approvals +
    data.messengers.approvals;

  const totalApplications =
    data.incomingLine.incomingCalls +
    data.tilda.applications +
    data.vkDesertir.applications +
    data.messengers.incomingMessages;

  return { totalSales, totalQualifiedLeads, totalApprovals, totalApplications };
}

// Конверсия
export function calculateConversion(sales: number, qualifiedLeads: number): number {
  if (qualifiedLeads === 0) return 0;
  return (sales / qualifiedLeads) * 100;
}

// Цвет конверсии
export function getConversionColor(conversion: number): string {
  if (conversion > 20) return 'text-green-600';
  if (conversion >= 10) return 'text-yellow-600';
  return 'text-red-600';
}

export function getConversionBgColor(conversion: number): string {
  if (conversion > 20) return 'bg-green-100 text-green-700';
  if (conversion >= 10) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

// KPI для менеджера за период
export function calculateManagerKPI(
  reports: Report[],
  plan: number
) {
  const approvedReports = reports.filter(r => r.status === 'APPROVED');
  
  let totalSales = 0;
  let totalQualifiedLeads = 0;

  approvedReports.forEach(report => {
    const totals = calculateReportTotals(report.data);
    totalSales += totals.totalSales;
    totalQualifiedLeads += totals.totalQualifiedLeads;
  });

  const conversion = calculateConversion(totalSales, totalQualifiedLeads);
  const planCompletion = plan > 0 ? (totalSales / plan) * 100 : 0;

  return { totalSales, totalQualifiedLeads, conversion, planCompletion };
}

// Расчёт премии
export function calculateBonus(
  totalSales: number,
  plan: number,
  conversion: number,
  rules: BonusRule[]
): { amount: number; breakdown: BonusAccrual['breakdown'] } {
  if (rules.length === 0) {
    return { amount: 0, breakdown: { fixedPerSale: 0, planBonus: 0, conversionBonus: 0, stepBonus: 0 } };
  }

  const rule = rules[rules.length - 1]; // последняя активная
  const fixedPerSale = totalSales * rule.fixedPerSale;
  const planCompletion = plan > 0 ? (totalSales / plan) * 100 : 0;
  const planBonus = planCompletion >= rule.planBonusThreshold ? rule.planBonusAmount : 0;
  const conversionBonus = conversion >= rule.conversionThreshold ? rule.conversionBonus : 0;
  
  let stepBonus = 0;
  for (const step of rule.steps) {
    if (totalSales >= step.minSales) {
      stepBonus = step.bonus;
    }
  }

  const amount = fixedPerSale + planBonus + conversionBonus + stepBonus;

  return {
    amount,
    breakdown: { fixedPerSale, planBonus, conversionBonus, stepBonus }
  };
}

// Агрегация по филиалу
export function calculateBranchKPI(reports: Report[], plan: number) {
  const approvedReports = reports.filter(r => r.status === 'APPROVED');
  
  let totalSales = 0;
  let totalQualifiedLeads = 0;

  approvedReports.forEach(report => {
    const totals = calculateReportTotals(report.data);
    totalSales += totals.totalSales;
    totalQualifiedLeads += totals.totalQualifiedLeads;
  });

  const conversion = calculateConversion(totalSales, totalQualifiedLeads);
  const planCompletion = plan > 0 ? (totalSales / plan) * 100 : 0;

  return { totalSales, totalQualifiedLeads, conversion, planCompletion };
}

// Форматирование даты
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Форматирование валюты
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(amount);
}

// Получить текущий месяц
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Получить сегодняшнюю дату
export function getTodayStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
