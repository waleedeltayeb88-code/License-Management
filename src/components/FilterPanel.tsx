import React from 'react';
import { 
  Filter, 
  Check, 
  Clock, 
  X,
  ChevronDown
} from 'lucide-react';
import { FilterState } from '../types';
import { Language } from '../utils/i18n';

interface FilterPanelProps {
  lang: Language;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  branches?: string[];
  models?: string[];
  onReset?: () => void;
  onResetFilters?: () => void;
  onExportExcel?: () => void;
  thresholdDays?: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  lang,
  filters,
  onFilterChange,
  branches = [
    'هايد بارك',
    'دريم',
    'دارك ستور زايد',
    'سيتي ستارز',
    'دارك ستور المعادي'
  ],
  models = ['سوزوكي سوبر كاري', 'شيفروليه Move N300', 'تويوتا هايس'],
}) => {
  const handleFieldChange = (field: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleStatusToggle = (status: FilterState['status']) => {
    if (filters.status === status) {
      handleFieldChange('status', 'all');
    } else {
      handleFieldChange('status', status);
    }
  };

  return (
    <div className="rounded-xl bg-[#080d19] border border-[#a67c2e]/55 p-4 shadow-xl mb-3">
      {/* Header: Title on Right, Golden Funnel on Left in RTL */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-base font-black text-white tracking-wide">
          فلتر البحث
        </h3>
        <Filter className="w-4 h-4 text-[#e5a93c] fill-[#e5a93c]/20" />
      </div>

      {/* Select Dropdowns */}
      <div className="space-y-2.5 mb-4">
        {/* Branch Filter */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-white min-w-[75px] text-right">
            الفرع
          </span>
          <div className="relative flex-1">
            <select
              value={filters.branch}
              onChange={(e) => handleFieldChange('branch', e.target.value)}
              className="w-full bg-[#040812] border border-white/10 rounded-lg py-1.5 pr-3 pl-8 text-xs font-bold text-white appearance-none focus:outline-none focus:border-[#d9a441]/70 cursor-pointer shadow-inner"
            >
              <option value="all" className="bg-[#090e1a] text-white">الكل</option>
              {branches.map((b) => (
                <option key={b} value={b} className="bg-[#090e1a] text-white">{b}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>
        </div>

        {/* License Type Filter (Golden text as in image) */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-[#e5a93c] min-w-[75px] text-right">
            نوع الرخصة
          </span>
          <div className="relative flex-1">
            <select
              value={filters.licenseType}
              onChange={(e) => handleFieldChange('licenseType', e.target.value)}
              className="w-full bg-[#040812] border border-white/10 rounded-lg py-1.5 pr-3 pl-8 text-xs font-bold text-white appearance-none focus:outline-none focus:border-[#d9a441]/70 cursor-pointer shadow-inner"
            >
              <option value="all" className="bg-[#090e1a] text-white">الكل</option>
              <option value="traffic" className="bg-[#090e1a] text-white">رخصة سير</option>
              <option value="commercial" className="bg-[#090e1a] text-white">رخصة إعلان</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Vehicle Detail / Model Filter (Golden text as in image) */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-[#e5a93c] min-w-[75px] text-right">
            نوع التخصيصية
          </span>
          <div className="relative flex-1">
            <select
              value={filters.model || 'all'}
              onChange={(e) => handleFieldChange('model', e.target.value)}
              className="w-full bg-[#040812] border border-white/10 rounded-lg py-1.5 pr-3 pl-8 text-xs font-bold text-white appearance-none focus:outline-none focus:border-[#d9a441]/70 cursor-pointer shadow-inner"
            >
              <option value="all" className="bg-[#090e1a] text-white">الكل</option>
              {models.map((m) => (
                <option key={m} value={m} className="bg-[#090e1a] text-white">{m}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-white min-w-[75px] text-right">
            الحالة
          </span>
          <div className="relative flex-1">
            <select
              value={filters.status}
              onChange={(e) => handleFieldChange('status', e.target.value as any)}
              className="w-full bg-[#040812] border border-white/10 rounded-lg py-1.5 pr-3 pl-8 text-xs font-bold text-white appearance-none focus:outline-none focus:border-[#d9a441]/70 cursor-pointer shadow-inner"
            >
              <option value="all" className="bg-[#090e1a] text-white">الكل</option>
              <option value="valid" className="bg-[#090e1a] text-white">سارية</option>
              <option value="expiring_soon" className="bg-[#090e1a] text-white">قريبة من الانتهاء</option>
              <option value="expired" className="bg-[#090e1a] text-white">منتهية</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3 Status Filter Buttons */}
      <div className="space-y-2 pt-1">
        {/* Valid Button (Green) */}
        <button
          type="button"
          onClick={() => handleStatusToggle('valid')}
          className={`w-full h-11 flex items-center justify-between px-3 rounded-lg text-sm font-bold transition-all cursor-pointer shadow-md ${
            filters.status === 'valid'
              ? 'bg-[#3b7c20] text-white border border-[#6bbe24] shadow-[0_0_12px_rgba(107,190,36,0.3)]'
              : 'bg-[#2a5b17] hover:bg-[#346d1f] text-white border border-[#488e28]'
          }`}
        >
          <div className="w-7 h-7 rounded-md border border-[#52932b] bg-[#1d3d11] flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3.5]" />
          </div>
          <span className="flex-1 text-center font-bold text-sm text-white">سارية</span>
          <div className="w-7 h-7 opacity-0 pointer-events-none flex-shrink-0" />
        </button>

        {/* Expiring Soon Button (Orange) */}
        <button
          type="button"
          onClick={() => handleStatusToggle('expiring_soon')}
          className={`w-full h-11 flex items-center justify-between px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md ${
            filters.status === 'expiring_soon'
              ? 'bg-[#8d4710] text-white border border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'bg-[#763a0b] hover:bg-[#88430e] text-white border border-[#a15312]'
          }`}
        >
          <div className="w-7 h-7 rounded-md border border-[#b86d1d] bg-[#472205] flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-white stroke-[2.8]" />
          </div>
          <span className="flex-1 text-center font-bold text-xs sm:text-sm text-white">قريبة من الانتهاء (خلال 30 يوم)</span>
          <div className="w-7 h-7 opacity-0 pointer-events-none flex-shrink-0" />
        </button>

        {/* Expired Button (Red) */}
        <button
          type="button"
          onClick={() => handleStatusToggle('expired')}
          className={`w-full h-11 flex items-center justify-between px-3 rounded-lg text-sm font-bold transition-all cursor-pointer shadow-md ${
            filters.status === 'expired'
              ? 'bg-[#821919] text-white border border-[#f87171] shadow-[0_0_12px_rgba(248,113,113,0.3)]'
              : 'bg-[#6a1515] hover:bg-[#7a1919] text-white border border-[#912222]'
          }`}
        >
          <div className="w-7 h-7 rounded-md border border-[#a82c2c] bg-[#420c0c] flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-white stroke-[3.5]" />
          </div>
          <span className="flex-1 text-center font-bold text-sm text-white">منتهية</span>
          <div className="w-7 h-7 opacity-0 pointer-events-none flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};
