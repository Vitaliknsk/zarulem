import { Branch, User, Report, BonusRule, KnowledgeArticle, ReportStatus } from '../types';
import { seedBranches, seedUsers, generateSeedReports, seedBonusRules, seedKnowledgeArticles } from '../data/seed';

const STORAGE_KEYS = {
  branches: 'zarulem_branches',
  users: 'zarulem_users',
  reports: 'zarulem_reports',
  bonusRules: 'zarulem_bonus_rules',
  knowledgeArticles: 'zarulem_knowledge',
  initialized: 'zarulem_initialized',
};

// === ИНТЕРФЕЙС РЕПОЗИТОРИЯ ===
export interface IRepository {
  // Branches
  getBranches(): Branch[];
  getBranch(id: string): Branch | undefined;
  
  // Users
  getUsers(): User[];
  getUser(id: string): User | undefined;
  getUsersByBranch(branchId: string): User[];
  getManagersByBranch(branchId: string): User[];
  
  // Reports
  getReports(): Report[];
  getReport(id: string): Report | undefined;
  getReportsByUser(userId: string): Report[];
  getReportsByBranch(branchId: string): Report[];
  getReportsByUserAndDate(userId: string, date: string): Report | undefined;
  getReportsByStatus(status: ReportStatus): Report[];
  getReportsByBranchAndStatus(branchId: string, status: ReportStatus): Report[];
  saveReport(report: Report): void;
  updateReportStatus(id: string, status: ReportStatus, comment?: string): void;
  
  // Bonus Rules
  getBonusRules(): BonusRule[];
  saveBonusRule(rule: BonusRule): void;
  
  // Knowledge
  getKnowledgeArticles(): KnowledgeArticle[];
  
  // Init/Reset
  initialize(): void;
  resetAll(): void;
}

// === LOCALSTORAGE РЕПОЗИТОРИЙ ===
class LocalStorageRepository implements IRepository {
  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getBranches(): Branch[] {
    return this.getItem(STORAGE_KEYS.branches, seedBranches);
  }

  getBranch(id: string): Branch | undefined {
    return this.getBranches().find(b => b.id === id);
  }

  getUsers(): User[] {
    return this.getItem(STORAGE_KEYS.users, seedUsers);
  }

  getUser(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUsersByBranch(branchId: string): User[] {
    return this.getUsers().filter(u => u.branchId === branchId);
  }

  getManagersByBranch(branchId: string): User[] {
    return this.getUsers().filter(u => u.branchId === branchId && u.role === 'manager');
  }

  getReports(): Report[] {
    return this.getItem(STORAGE_KEYS.reports, []);
  }

  getReport(id: string): Report | undefined {
    return this.getReports().find(r => r.id === id);
  }

  getReportsByUser(userId: string): Report[] {
    return this.getReports().filter(r => r.userId === userId);
  }

  getReportsByBranch(branchId: string): Report[] {
    return this.getReports().filter(r => r.branchId === branchId);
  }

  getReportsByUserAndDate(userId: string, date: string): Report | undefined {
    return this.getReports().find(r => r.userId === userId && r.date === date);
  }

  getReportsByStatus(status: ReportStatus): Report[] {
    return this.getReports().filter(r => r.status === status);
  }

  getReportsByBranchAndStatus(branchId: string, status: ReportStatus): Report[] {
    return this.getReports().filter(r => r.branchId === branchId && r.status === status);
  }

  saveReport(report: Report): void {
    const reports = this.getReports();
    const existingIdx = reports.findIndex(r => r.id === report.id);
    if (existingIdx >= 0) {
      reports[existingIdx] = report;
    } else {
      reports.push(report);
    }
    this.setItem(STORAGE_KEYS.reports, reports);
  }

  updateReportStatus(id: string, status: ReportStatus, comment?: string): void {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx >= 0) {
      reports[idx].status = status;
      reports[idx].updatedAt = new Date().toISOString();
      if (comment) reports[idx].rejectionComment = comment;
      this.setItem(STORAGE_KEYS.reports, reports);
    }
  }

  getBonusRules(): BonusRule[] {
    return this.getItem(STORAGE_KEYS.bonusRules, seedBonusRules);
  }

  saveBonusRule(rule: BonusRule): void {
    const rules = this.getBonusRules();
    const idx = rules.findIndex(r => r.id === rule.id);
    if (idx >= 0) {
      rules[idx] = rule;
    } else {
      rules.push(rule);
    }
    this.setItem(STORAGE_KEYS.bonusRules, rules);
  }

  getKnowledgeArticles(): KnowledgeArticle[] {
    return this.getItem(STORAGE_KEYS.knowledgeArticles, seedKnowledgeArticles);
  }

  initialize(): void {
    const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
    if (!initialized) {
      this.setItem(STORAGE_KEYS.branches, seedBranches);
      this.setItem(STORAGE_KEYS.users, seedUsers);
      this.setItem(STORAGE_KEYS.reports, generateSeedReports());
      this.setItem(STORAGE_KEYS.bonusRules, seedBonusRules);
      this.setItem(STORAGE_KEYS.knowledgeArticles, seedKnowledgeArticles);
      localStorage.setItem(STORAGE_KEYS.initialized, 'true');
    }
  }

  resetAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.initialize();
  }
}

export const repository = new LocalStorageRepository();
