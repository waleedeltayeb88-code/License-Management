import React from 'react';
import { 
  Car, 
  Megaphone,
  CheckCircle2, 
  Clock, 
  XCircle,
  Truck
} from 'lucide-react';
import { translations, Language } from '../utils/i18n';
import { FilterState } from '../types';

interface LicenseMetrics {
  total: number;
  valid: number;
  expiring: number;
  expired: number;
}

interface KpiCardsProps {
  lang: Language;
  trafficMetrics?: LicenseMetrics;
  commercialMetrics?: LicenseMetrics;
  validPercentTotal?: number;
  validCount?: number;
  expiringCount?: number;
  expiredCount?: number;
  complianceRate?: number;
  thresholdDays?: number;
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: FilterState['status']) => void;
  onFilterStatusClick?: (type: 'traffic' | 'commercial', status: 'valid' | 'expiring_soon' | 'expired') => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  lang,
  trafficMetrics = { total: 100, valid: 64, expiring: 24, expired: 12 },
  commercialMetrics = { total: 100, valid: 68, expiring: 16, expired: 16 },
  complianceRate = 64,
  thresholdDays = 30,
  activeStatusFilter,
  onSelectStatusFilter,
  onFilterStatusClick,
}) => {
  const t = translations[lang];

  const handleStatusClick = (type: 'traffic' | 'commercial', status: 'valid' | 'expiring_soon' | 'expired') => {
    if (onFilterStatusClick) {
      onFilterStatusClick(type, status);
    } else if (onSelectStatusFilter) {
      onSelectStatusFilter(status);
    }
  };

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const percent = complianceRate || 64;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="grid grid-cols-12 gap-3 mb-3">
      {/* 1. Commercial License Card (رخصة إعلان) - 5 cols (Right side in RTL) */}
      <div className="col-span-12 md:col-span-5 rounded-xl bg-[#090e1a] border border-[#c99a2e]/35 p-3.5 shadow-md flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex items-center justify-center gap-2 pb-2 mb-2 border-b border-white/[0.06]">
          <Megaphone className="w-4 h-4 text-[#d9a441]" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            رخصة إعلان
          </h2>
        </div>

        {/* 4 Stat Columns */}
        <div className="grid grid-cols-4 gap-1 text-center">
          {/* Total */}
          <div className="flex flex-col items-center justify-between py-1 px-0.5">
            <span className="text-[11px] text-slate-300 font-medium">إجمالي السيارات</span>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">{commercialMetrics.total}</span>
              <div className="text-[10px] text-slate-400">سيارة</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-purple-900/30 border border-purple-500/50 flex items-center justify-center mt-1">
              <Megaphone className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>

          {/* Valid */}
          <button
            type="button"
            onClick={() => handleStatusClick('commercial', 'valid')}
            className={`flex flex-col items-center justify-between py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
              activeStatusFilter === 'valid' ? 'bg-emerald-950/40 ring-1 ring-emerald-500' : 'hover:bg-white/[0.03]'
            }`}
          >
            <span className="text-[11px] text-[#6bbe24] font-medium">سارية</span>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">{commercialMetrics.valid}</span>
              <div className="text-[10px] text-slate-400">سيارة</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-900/30 border border-[#6bbe24]/60 flex items-center justify-center mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6bbe24]" />
            </div>
          </button>

          {/* Expiring Soon */}
          <button
            type="button"
            onClick={() => handleStatusClick('commercial', 'expiring_soon')}
            className={`flex flex-col items-center justify-between py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
              activeStatusFilter === 'expiring_soon' ? 'bg-amber-950/40 ring-1 ring-amber-500' : 'hover:bg-white/[0.03]'
            }`}
          >
            <span className="text-[11px] text-[#f2a51a] font-medium">قريبة من الإنتهاء</span>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">{commercialMetrics.expiring}</span>
              <div className="text-[10px] text-slate-400">سيارة</div>
              <div className="text-[9px] text-[#f2a51a] font-medium">خلال 30 يوم</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-amber-900/30 border border-[#f2a51a]/60 flex items-center justify-center mt-1">
              <Clock className="w-3.5 h-3.5 text-[#f2a51a]" />
            </div>
          </button>

          {/* Expired */}
          <button
            type="button"
            onClick={() => handleStatusClick('commercial', 'expired')}
            className={`flex flex-col items-center justify-between py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
              activeStatusFilter === 'expired' ? 'bg-rose-950/40 ring-1 ring-rose-500' : 'hover:bg-white/[0.03]'
            }`}
          >
            <span className="text-[11px] text-[#d92820] font-medium">منتهية</span>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">{commercialMetrics.expired}</span>
              <div className="text-[10px] text-slate-400">سيارة</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-rose-900/30 border border-[#d92820]/60 flex items-center justify-center mt-1">
              <XCircle className="w-3.5 h-3.5 text-[#d92820]" />
            </div>
          </button>
        </div>
      </div>

      {/* 2. Middle Gauge Card (نسبة الرخص السارية) - 2 cols */}
      <div className="col-span-12 md:col-span-2 rounded-xl bg-[#090e1a] border border-[#c99a2e]/35 p-3 shadow-md flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-slate-200 mb-2 text-center">
          نسبة الرخص السارية
        </span>

        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#192233"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active green gauge */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#6bbe24"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-white font-mono">{percent}%</span>
          </div>
        </div>
      </div>

      {/* 3. Traffic License Card (رخصة سير) - 5 cols (Left side in RTL) */}
      <div className="col-span-12 md:col-span-5 rounded-xl bg-[#090e1a] border border-[#c99a2e]/35 p-3.5 shadow-md flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex items-center justify-center gap-2 pb-2 mb-2 border-b border-white/[0.06]">
          <Car className="w-4 h-4 text-[#d9a441]" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            رخصة سير
          </h2>
        </div>

        {/* 4 Stat Columns */}
        <div className="grid grid-cols-4 gap-1 text-center">
          {/* Total */}
          <div className="flex flex-col items-center justify-between py-1 px-0.5">
            <span className="text-[11px] text-slate-300 font-medium">إجمالي السيارات</span>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">{trafficMetrics.total}</span>
              <div className="text-[10px] text-slate-400">سيارة</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-purple-900/30 border border-purple-500/50 flex items-center justify-center mt-1">
              <Truck className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>

          {/* Valid */}
          <button
            type="button"
            onClick={() => handleStatusClick('traffic', 'valid')}
            className={`flex flex-col items-center justify-between py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
              activeStatusFilter === 'valid' ? 'bg-emerald-950/40 ring-1 ring-emerald-500' : 'hover:bg-white/[0.03]'
            }`}
          >
            <span className="text-[11px] text-[#6bbe24] font-medium">سارية</span>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">{trafficMetrics.valid}</span>
              <div className="text-[10px] text-slate-400">سيارة</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-900/30 border border-[#6bbe24]/60 flex items-center justify-center mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6bbe24]" />
            </div>
          </button>

          {/* Expiring Soon */}
          <button
            type="button"
            onClick={() => handleStatusClick('traffic', 'expiring_soon')}
            className={`flex flex-col items-center justify-between py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
              activeStatusFilter === 'expiring_soon' ? 'bg-amber-950/40 ring-1 ring-amber-500' : 'hover:bg-white/[0.03]'
            }`}
          >
            <span className="text-[11px] text-[#f2a51a] font-medium">قريبة من الإنتهاء</span>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">{trafficMetrics.expiring}</span>
              <div className="text-[10px] text-slate-400">سيارة</div>
              <div className="text-[9px] text-[#f2a51a] font-medium">خلال 30 يوم</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-amber-900/30 border border-[#f2a51a]/60 flex items-center justify-center mt-1">
              <Clock className="w-3.5 h-3.5 text-[#f2a51a]" />
            </div>
          </button>

          {/* Expired */}
          <button
            type="button"
            onClick={() => handleStatusClick('traffic', 'expired')}
            className={`flex flex-col items-center justify-between py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
              activeStatusFilter === 'expired' ? 'bg-rose-950/40 ring-1 ring-rose-500' : 'hover:bg-white/[0.03]'
            }`}
          >
            <span className="text-[11px] text-[#d92820] font-medium">منتهية</span>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">{trafficMetrics.expired}</span>
              <div className="text-[10px] text-slate-400">سيارة</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-rose-900/30 border border-[#d92820]/60 flex items-center justify-center mt-1">
              <XCircle className="w-3.5 h-3.5 text-[#d92820]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
