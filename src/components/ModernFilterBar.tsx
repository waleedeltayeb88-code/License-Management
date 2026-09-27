import React from 'react';
import { 
  Search, 
  RotateCcw, 
  Building2, 
  FileText, 
  Car, 
  Plus, 
  ArrowLeftRight, 
  Download, 
  FileEdit, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  SlidersHorizontal
} from 'lucide-react';
import { FilterState } from '../types';
import { Language } from '../utils/i18n';

interface ModernFilterBarProps {
  lang: Language;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  branches: string[];
  models?: string[];
  totalResults: number;
  totalFleet: number;
  onAddLicense: () => void;
  onEditData: () => void;
  onTransferVehicle?: () => void;
  canTransferVehicle?: boolean;
  onExportData: () => void;
}

export const ModernFilterBar: React.FC<ModernFilterBarProps> = ({
  filters,
  onFilterChange,
  branches = [],
  models = [
    'سوزوكي سوبر كاري',
    'سوزوكي فان',
    'سوزوكي بيك أب صندوق بأرفف',
    'فيات دوبلو',
    'جولف كار'
  ],
  totalResults,
  totalFleet,
  onAddLicense,
  onEditData,
  onTransferVehicle,
  canTransferVehicle = true,
  onExportData,
}) => {
  const isFiltered = 
    filters.search !== '' ||
    filters.branch !== 'all' ||
    filters.licenseType !== 'all' ||
    filters.status !== 'all' ||
    (filters.model && filters.model !== 'all');

  const handleReset = () => {
    onFilterChange({
      ...filters,
      search: '',
      branch: 'all',
      licenseType: 'all',
      status: 'all',
      model: 'all',
    });
  };

  return (
    <div className="rounded-2xl bg-[#090e1a]/95 backdrop-blur-xl border border-white/[0.08] p-3 sm:p-4 mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
      {/* Top Row: Search + Quick Action Pills */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        {/* Search Input with quick badges and active indicator */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="بحث فوري: اكتب رقم اللوحة (مثال: 3119)، الحروف، رخصة المرور، الموديل، أو الفرع..."
            className="w-full h-10 bg-[#050811]/90 border border-white/10 rounded-xl pr-10 pl-24 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
          />

          <div className="absolute left-2.5 top-2 flex items-center gap-1.5">
            {filters.search ? (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                ⌘ بحث
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {/* Add License Button */}
          <button
            type="button"
            onClick={onAddLicense}
            className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <span>إضافة رخصة سيارة</span>
          </button>

          {/* Transfer Vehicle Button */}
          {canTransferVehicle && onTransferVehicle && (
            <button
              type="button"
              onClick={onTransferVehicle}
              className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black shadow-md border border-amber-400/40 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
              <span>نقل سيارة بين الفروع</span>
            </button>
          )}

          {/* Edit Data Button */}
          <button
            type="button"
            onClick={onEditData}
            className="flex items-center gap-1.5 px-3 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-bold border border-white/10 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <FileEdit className="w-4 h-4 text-slate-300 stroke-[2]" />
            <span>إدارة وتعديل رخصة</span>
          </button>

          {/* Export Data Button */}
          <button
            type="button"
            onClick={onExportData}
            className="flex items-center gap-1.5 px-3 h-10 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 hover:from-emerald-950/70 hover:to-slate-800 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/40 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400 stroke-[2.2]" />
            <span>تصدير إكسل رسمي ملون</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Segmented Status Controls + Dropdown Selects */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        {/* Segmented Status Tabs */}
        <div className="flex items-center gap-1 bg-[#040711]/90 p-1 rounded-xl border border-white/[0.08] overflow-x-auto">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, status: 'all' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.status === 'all'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            جميع الحالات
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, status: 'valid' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.status === 'valid'
                ? 'bg-emerald-500/25 text-emerald-300 shadow-sm border border-emerald-500/50'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            سارية
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, status: 'expiring_soon' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.status === 'expiring_soon'
                ? 'bg-amber-500/25 text-amber-300 shadow-sm border border-amber-500/50'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            قريبة من الانتهاء
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, status: 'expired' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.status === 'expired'
                ? 'bg-rose-500/25 text-rose-300 shadow-sm border border-rose-500/50'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
            منتهية
          </button>
        </div>

        {/* Dropdowns + Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#040711]/90 border border-white/10 rounded-xl px-2.5 py-1 text-xs hover:border-white/20 transition-colors">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">الفرع:</span>
            <select
              value={filters.branch}
              onChange={(e) => onFilterChange({ ...filters, branch: e.target.value })}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none pr-1"
            >
              <option value="all" className="bg-[#090e1a] text-white">كل الفروع ({branches.length})</option>
              {branches.map((b) => (
                <option key={b} value={b} className="bg-[#090e1a] text-white">{b}</option>
              ))}
            </select>
          </div>

          {/* License Type Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#040711]/90 border border-white/10 rounded-xl px-2.5 py-1 text-xs hover:border-white/20 transition-colors">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">الرخصة:</span>
            <select
              value={filters.licenseType}
              onChange={(e) => onFilterChange({ ...filters, licenseType: e.target.value as any })}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none pr-1"
            >
              <option value="all" className="bg-[#090e1a] text-white">كل الرخص</option>
              <option value="traffic" className="bg-[#090e1a] text-cyan-300">رخصة تسيير (المرور)</option>
              <option value="commercial" className="bg-[#090e1a] text-amber-300">تصريح إعلان (المحليات)</option>
            </select>
          </div>

          {/* Model Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#040711]/90 border border-white/10 rounded-xl px-2.5 py-1 text-xs hover:border-white/20 transition-colors">
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">الموديل:</span>
            <select
              value={filters.model || 'all'}
              onChange={(e) => onFilterChange({ ...filters, model: e.target.value })}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none pr-1"
            >
              <option value="all" className="bg-[#090e1a] text-white">كل الموديلات</option>
              {models.map((m) => (
                <option key={m} value={m} className="bg-[#090e1a] text-white">{m}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters if active */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="إعادة ضبط الفلاتر والبحث"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء الفلاتر</span>
            </button>
          )}

          {/* Results Counter Badge */}
          <div className="text-[11px] text-slate-300 font-medium px-2.5 py-1 bg-white/[0.04] rounded-xl border border-white/[0.08] shadow-inner">
            السيارات: <span className="text-emerald-400 font-bold font-mono text-xs">{totalResults}</span> / <span className="text-slate-400 font-mono">{totalFleet}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
