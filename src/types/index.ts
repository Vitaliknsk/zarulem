// === РОЛИ ===
export type Role = 'manager' | 'branch_head' | 'director';

// === СТАТУСЫ ОТЧЁТОВ ===
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

// === ПОЛЬЗОВАТЕЛЬ ===
export interface User {
  id: string;
  name: string;
  role: Role;
  branchId: string;
}

// === ФИЛИАЛ ===
export interface Branch {
  id: string;
  name: string;
  plan: number; // план продаж на месяц
}

// === ДАННЫЕ ОТЧЁТА ===
export interface ReportChannel {
  incomingCalls?: number;
  qualifiedLeads?: number;
  approvals?: number;
  sales?: number;
  applications?: number;
  duplicates?: number;
  outgoingCalls?: number;
  freezer?: number;
  reached?: number;
  incomingMessages?: number;
}

export interface ReportData {
  incomingLine: {
    incomingCalls: number;
    qualifiedLeads: number;
    approvals: number;
    sales: number;
  };
  tilda: {
    applications: number;
    qualifiedLeads: number;
    approvals: number;
    sales: number;
    duplicates: number;
  };
  outgoing: {
    outgoingCalls: number;
    freezer: number;
  };
  vkDesertir: {
    applications: number;
    reached: number;
    qualifiedLeads: number;
    approvals: number;
    sales: number;
  };
  messengers: {
    incomingMessages: number;
    qualifiedLeads: number;
    approvals: number;
    sales: number;
  };
}

export interface Report {
  id: string;
  userId: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  data: ReportData;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  rejectionComment?: string;
}

// === ПРАВИЛА ПРЕМИЙ ===
export interface BonusRule {
  id: string;
  name: string;
  fixedPerSale: number;
  planBonusThreshold: number; // процент выполнения плана для бонуса
  planBonusAmount: number;
  conversionThreshold: number;
  conversionBonus: number;
  steps: { minSales: number; bonus: number }[];
  activeFrom: string;
}

// === НАЧИСЛЕНИЕ ПРЕМИИ ===
export interface BonusAccrual {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  amount: number;
  breakdown: {
    fixedPerSale: number;
    planBonus: number;
    conversionBonus: number;
    stepBonus: number;
  };
  confirmed: boolean;
  createdAt: string;
}

// === БАЗА ЗНАНИЙ ===
export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  tags: string[];
}

// === KPI ===
export interface KPIData {
  totalSales: number;
  totalQualifiedLeads: number;
  conversion: number;
  planCompletion: number;
  bonus: number;
}

// === TOAST ===
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
