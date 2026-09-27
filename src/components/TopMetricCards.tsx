import React from 'react';
import { 
  Truck, 
  Car, 
  Megaphone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Language } from '../utils/i18n';
import { FilterState } from '../types';

interface LicenseMetrics {
  total: number;
  valid: number;
  expiring: number;
  expired: number;
}

interface TopMetricCardsProps {
  lang: Language;
  trafficMetrics: LicenseMetrics;
  commercialMetrics: LicenseMetrics;
  complianceRate: number;
  totalVehicles: number;
  fullyCompliantCount?: number;
  thresholdDays: number;
  activeStatusFilter: FilterState['status'];
  activeLicenseTypeFilter: FilterState['licenseType'];
  onSelectStatus: (status: FilterState['status'], licenseType?: FilterState['licenseType']) => void;
}

export const TopMetricCards: React.FC<TopMetricCardsProps> = ({
  lang,
  trafficMetrics,
  commercialMetrics,
  complianceRate,
  totalVehicles,
  fullyCompliantCount,
  thresholdDays,
  activeStatusFilter,
  activeLicenseTypeFilter,
  onSelectStatus,
}) => {
  // Safe calculation of fully compliant vehicles (both traffic and commercial valid)
  const safeFullyCompliant = typeof fullyCompliantCount === 'number' 
    ? fullyCompliantCount 
    : Math.min(trafficMetrics.valid, commercialMetrics.valid);

  // SVG gauge circle calculations for Apple-style activity ring
  const safeComplianceRate = typeof complianceRate === 'number' && !isNaN(complianceRate) 
    ? complianceRate 
    : (totalVehicles > 0 ? Math.round((safeFullyCompliant / totalVehicles) * 100) : 0);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.max(0, safeComplianceRate));
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const totalExpiring = trafficMetrics.expiring + commercialMetrics.expiring;
  const totalExpired = trafficMetrics.expired + commercialMetrics.expired;
  const totalValid = trafficMetrics.valid + commercialMetrics.valid;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-4">
      {/* 1. TOTAL FLEET CARD (Apple Style Glass Card) */}
      <div 
        onClick={() => onSelectStatus('all', 'all')}
        className={`relative group overflow-hidden rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.35)] transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
          activeStatusFilter === 'all' && activeLicenseTypeFilter === 'all'
            ? 'bg-gradient-to-b from-[#12281e] via-[#0d1e17] to-[#0a1611] border-emerald-500/60 ring-2 ring-emerald-500/30'
            : 'bg-gradient-to-b from-[#0f172a]/95 via-[#0d1424]/95 to-[#0a0f1d]/95 border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#111c2e]'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.06] rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <Truck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">أسطول سعودي</h4>
                <span className="text-[10px] text-slate-400 font-medium">سيارات التوصيل</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% نشط
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-black text-white font-mono tracking-tight">{totalVehicles}</span>
            <span className="text-xs text-slate-400 font-medium">سيارة مجهزة</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            فروع القاهرة الكبرى
          </span>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
            سعودي 🇪🇬
          </span>
        </div>
      </div>

      {/* 2. TRAFFIC LICENSES (رخص التسيير - المرور) */}
      <div 
        onClick={() => onSelectStatus('all', 'traffic')}
        className={`relative group overflow-hidden rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.35)] transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
          activeLicenseTypeFilter === 'traffic'
            ? 'bg-gradient-to-b from-[#0f2438] via-[#0b1c2b] to-[#081521] border-cyan-500/60 ring-2 ring-cyan-500/30'
            : 'bg-gradient-to-b from-[#0f172a]/95 via-[#0d1424]/95 to-[#0a0f1d]/95 border-white/[0.08] hover:border-cyan-500/40 hover:bg-[#111c2e]'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.05] rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
                <Car className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">رخص التسيير</h4>
                <span className="text-[10px] text-slate-400 font-medium">المرور المصري</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {totalVehicles} رخصة
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-black text-white font-mono tracking-tight">{trafficMetrics.valid}</span>
            <span className="text-xs text-emerald-400 font-medium font-mono">سارية</span>
            <span className="text-[10px] text-slate-500 font-mono">/ {totalVehicles}</span>
          </div>
        </div>

        {/* Micro status pills - interactive */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-white/[0.06] text-[10px]">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStatus('expiring_soon', 'traffic');
            }}
            className="flex items-center justify-between px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
          >
            <span className="text-amber-300 font-medium">قريبة الانتهاء</span>
            <span className="font-mono font-bold text-amber-400">{trafficMetrics.expiring}</span>
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStatus('expired', 'traffic');
            }}
            className="flex items-center justify-between px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition-colors"
          >
            <span className="text-rose-300 font-medium">منتهية</span>
            <span className="font-mono font-bold text-rose-400">{trafficMetrics.expired}</span>
          </button>
        </div>
      </div>

      {/* 3. COMMERCIAL AD LICENSES (تصاريح الإعلانات - المحليات) */}
      <div 
        onClick={() => onSelectStatus('all', 'commercial')}
        className={`relative group overflow-hidden rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.35)] transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
          activeLicenseTypeFilter === 'commercial'
            ? 'bg-gradient-to-b from-[#2e2011] via-[#21160a] to-[#170e06] border-amber-500/60 ring-2 ring-amber-500/30'
            : 'bg-gradient-to-b from-[#0f172a]/95 via-[#0d1424]/95 to-[#0a0f1d]/95 border-white/[0.08] hover:border-amber-500/40 hover:bg-[#111c2e]'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.05] rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/25 to-yellow-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <Megaphone className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">تصاريح الإعلانات</h4>
                <span className="text-[10px] text-slate-400 font-medium">المحليات والأحياء</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {totalVehicles} تصريح
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-black text-white font-mono tracking-tight">{commercialMetrics.valid}</span>
            <span className="text-xs text-emerald-400 font-medium font-mono">سارية</span>
            <span className="text-[10px] text-slate-500 font-mono">/ {totalVehicles}</span>
          </div>
        </div>

        {/* Micro status pills - interactive */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-white/[0.06] text-[10px]">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStatus('expiring_soon', 'commercial');
            }}
            className="flex items-center justify-between px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
          >
            <span className="text-amber-300 font-medium">قريبة الانتهاء</span>
            <span className="font-mono font-bold text-amber-400">{commercialMetrics.expiring}</span>
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStatus('expired', 'commercial');
            }}
            className="flex items-center justify-between px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition-colors"
          >
            <span className="text-rose-300 font-medium">منتهية</span>
            <span className="font-mono font-bold text-rose-400">{commercialMetrics.expired}</span>
          </button>
        </div>
      </div>

      {/* 4. EXPIRING & URGENT ALERT CARD (تنبيه التجديد الفوري) */}
      <div 
        onClick={() => onSelectStatus('expiring_soon')}
        className={`relative group overflow-hidden rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.35)] transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
          activeStatusFilter === 'expiring_soon'
            ? 'bg-gradient-to-b from-[#2e1d0f] via-[#211409] to-[#170e05] border-amber-500/70 ring-2 ring-amber-500/30'
            : 'bg-gradient-to-b from-[#0f172a]/95 via-[#0d1424]/95 to-[#0a0f1d]/95 border-white/[0.08] hover:border-amber-500/40 hover:bg-[#111c2e]'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.07] rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <Clock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">تنبيهات التجديد</h4>
                <span className="text-[10px] text-amber-400 font-medium">خلال {thresholdDays} يوم</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">{totalExpiring}</span>
            <span className="text-xs text-slate-300 font-medium">رخصة مستحقة</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">منتهية حالياً:</span>
          <span className="font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
            {totalExpired} رخصة
          </span>
        </div>
      </div>

      {/* 5. OVERALL COMPLIANCE GAUGE (Apple Activity Ring Style) */}
      <div 
        onClick={() => onSelectStatus('valid', 'all')}
        className={`relative group overflow-hidden rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.35)] transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
          activeStatusFilter === 'valid'
            ? 'bg-gradient-to-b from-[#10291d] via-[#0c1d15] to-[#08160f] border-emerald-500/60 ring-2 ring-emerald-500/30'
            : 'bg-gradient-to-b from-[#0f172a]/95 via-[#0d1424]/95 to-[#0a0f1d]/95 border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#111c2e]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>الامتثال القانوني الكامل</span>
            </div>
            
            {/* Percentage + Count side-by-side */}
            <div className="flex items-baseline gap-2 pt-0.5">
              <div className="text-3xl font-black text-white font-mono tracking-tight flex items-baseline">
                <span>{safeComplianceRate}</span>
                <span className="text-sm font-bold text-emerald-400 ml-0.5">%</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{safeFullyCompliant}</span>
                <span className="text-[10px] text-emerald-400/70 font-normal">/ {totalVehicles}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight pt-1">
              سيارات سليمة الرخصتين معاً (سير + إعلان)
            </p>
          </div>

          {/* Circular Ring Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              {/* Background Track */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke="#132035"
                strokeWidth="7"
              />
              {/* Glow / Active Progress */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke="url(#compliance-gradient)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="compliance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-black text-white font-mono">{safeComplianceRate}%</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
          <span className="text-emerald-400/90 font-medium">
            رخص سارية: {totalValid} رخصة
          </span>
          <span className="text-slate-400 font-mono text-[9px]">
            انقر للتصفية الفورية ⚡
          </span>
        </div>
      </div>
    </div>
  );
};
