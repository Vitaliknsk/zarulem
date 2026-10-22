import React, { useState, useMemo } from 'react';
import { repository } from '../../services/repository';
import { KnowledgeArticle } from '../../types';
import { Search, ChevronDown, ChevronUp, Copy, Check, BookOpen } from 'lucide-react';

export default function KnowledgeBase() {
  const articles = useMemo(() => repository.getKnowledgeArticles(), []);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(articles.map(a => a.category));
    return ['ALL', ...Array.from(cats)];
  }, [articles]);

  const filtered = useMemo(() => {
    let result = articles;
    if (selectedCategory !== 'ALL') {
      result = result.filter(a => a.category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.content.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [articles, selectedCategory, search]);

  const handleCopy = (article: KnowledgeArticle) => {
    navigator.clipboard.writeText(article.content).then(() => {
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">База знаний</h1>
        <p className="text-[#64748B] mt-1">Скрипты, инструкции и справочные материалы</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Поиск по статьям..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            {cat === 'ALL' ? 'Все' : cat}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {filtered.map(article => (
          <div key={article.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <BookOpen size={18} className="text-[#2563EB] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{article.title}</p>
                  <p className="text-xs text-[#64748B]">{article.category}{article.subcategory ? ` → ${article.subcategory}` : ''}</p>
                </div>
              </div>
              {expandedId === article.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedId === article.id && (
              <div className="px-5 pb-5 border-t border-[#E2E8F0]">
                <div className="mt-4 whitespace-pre-wrap text-sm text-[#0F172A] leading-relaxed">
                  {article.content}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-[#F1F5F9] text-xs text-[#64748B] rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopy(article)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {copiedId === article.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === article.id ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748B]">
            <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
            <p>Статьи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
