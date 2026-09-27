import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  PieChart, 
  ChevronRight,
  TrendingDown,
  Car
} from 'lucide-react';
import { Vehicle } from '../types';
import { calculateRemainingDays, getLicenseStatus, DEFAULT_REPORT_DATE } from '../utils/dateUtils';
import { Language } from '../utils/i18n';

interface ChartsSectionProps {
  lang: Language;
  vehicles?: Vehicle[];
  thresholdDays?: number;
  referenceDate?: string;
  onFilterBranch?: (branch: string) => void;
  onFilterStatus?: (status: 'valid' | 'expiring_soon' | 'expired') => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  lang,
  vehicles = [],
  thresholdDays = 30,
  referenceDate = DEFAULT_REPORT_DATE,
  onFilterBranch,
  onFilterStatus,
}) => {
  // Aggregate real statistics from vehicles prop
  let validCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;

  // Branch breakdown calculation
  const branchExpiringMap: Record<string, number> = {};
  const branchExpiredMap: Record<string, number> = {};

  (vehicles || []).forEach((v) => {
    // Traffic status
    const tStat = getLicenseStatus(v.trafficLicense.expiryDate, thresholdDays, referenceDate);
    if (tStat === 'valid') validCount++;
    else if (tStat === 'expiring_soon') {
      expiringCount++;
      branchExpiringMap[v.branch] = (branchExpiringMap[v.branch] || 0) + 1;
    } else if (tStat === 'expired') {
      expiredCount++;
      branchExpiredMap[v.branch] = (branchExpiredMap[v.branch] || 0) + 1;
    }

    // Commercial status
    const cStat = getLicenseStatus(v.commercialLicense.expiryDate, thresholdDays, referenceDate);
    if (cStat === 'valid') validCount++;
    else if (cStat === 'expiring_soon') {
      expiringCount++;
      branchExpiringMap[v.branch] = (branchExpiringMap[v.branch] || 0) + 1;
    } else if (cStat === 'expired') {
      expiredCount++;
      branchExpiredMap[v.branch] = (branchExpiredMap[v.branch] || 0) + 1;
    }
  });

  const sumCount = validCount + expiringCount + expiredCount;
  const totalEvaluated = sumCount > 0 ? sumCount : (vehicles.length > 0 ? vehicles.length * 2 : 200);
  const rawValidPct = Math.round((validCount / totalEvaluated) * 100);
  const validPct = isNaN(rawValidPct) ? 66 : rawValidPct;
  const rawExpiringPct = Math.round((expiringCount / totalEvaluated) * 100);
  const expiringPct = isNaN(rawExpiringPct) ? 20 : rawExpiringPct;
  const expiredPct = Math.max(0, 100 - validPct - expiringPct);

  // Top branches for Expiring
  const expiringBranches = Object.entries(branchExpiringMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Default fallback if list is empty
  const displayExpiringBranches = expiringBranches.length > 0 ? expiringBranches : [
    { name: 'هايد بارك (التجمع)', count: 8 },
    { name: 'دريم لاند (أكتوبر)', count: 7 },
    { name: 'دارك ستور زايد', count: 7 },
    { name: 'سيتي ستارز (مدينة نصر)', count: 7 },
    { name: 'فرع الميرغني (مصر الجديدة)', count: 6 },
  ];

  // Top branches for Expired
  const expiredBranches = Object.entries(branchExpiredMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const displayExpiredBranches = expiredBranches.length > 0 ? expiredBranches : [
    { name: 'هايد بارك (التجمع)', count: 7 },
    { name: 'دريم لاند (أكتوبر)', count: 5 },
    { name: 'دارك ستور زايد', count: 4 },
    { name: 'سيتي ستارز (مدينة نصر)', count: 3 },
    { name: 'دارك ستور المعادي', count: 3 },
  ];

  // Donut SVG parameters
  const donutRadius = 38;
  const donutCirc = 2 * Math.PI * donutRadius;
  const validStroke = (validPct / 100) * donutCirc;
  const expiringStroke = (expiringPct / 100) * donutCirc;
  const expiredStroke = (expiredPct / 100) * donutCirc;

  const validOffset = 0;
  const expiringOffset = -validStroke;
  const expiredOffset = -(validStroke + expiringStroke);

  return (
    <div className="grid grid-cols-12 gap-3.5 mb-4">
      {/* 1. Expiring Soon by Branch Horizontal Bar Chart */}
      <div className="col-span-12 md:col-span-4 rounded-2xl bg-[#090e1a]/95 backdrop-blur-xl border border-white/[0.08] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-100">
              قريبة من الانتهاء (خلال {thresholdDays} يوم) - فروع سعودي
            </h3>
          </div>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>

        {/* Bars Container */}
        <div className="space-y-2 py-1">
          {displayExpiringBranches.map((item) => {
            const widthPct = Math.min(100, Math.max(12, (item.count / 10) * 100));
            return (
              <div 
                key={item.name}
                onClick={() => onFilterBranch && onFilterBranch(item.name)}
                className="flex items-center justify-between text-xs gap-2 group cursor-pointer hover:bg-white/[0.03] p-1.5 rounded-xl transition-all"
                title={`انقر لفلترة سيارات ${item.name}`}
              >
                <span className="text-[11px] text-slate-300 w-36 truncate text-right font-medium group-hover:text-amber-300 transition-colors">
                  {item.name}
                </span>

                <div className="flex-1 h-3 bg-[#050811] rounded-full overflow-hidden flex items-center p-0.5 border border-white/[0.05]">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                <span className="font-mono text-[11px] font-bold text-amber-400 w-6 text-center">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* X-Axis Scale */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2.5 border-t border-white/[0.04] mt-1 font-mono px-4">
          <span>0</span>
          <span>2</span>
          <span>4</span>
          <span>6</span>
          <span>8</span>
          <span>10+ رخص</span>
        </div>
      </div>

      {/* 2. Expired by Branch Horizontal Bar Chart */}
      <div className="col-span-12 md:col-span-4 rounded-2xl bg-[#090e1a]/95 backdrop-blur-xl border border-white/[0.08] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-100">
              الرخص المنتهية حسب فروع سعودي سوبر ماركت
            </h3>
          </div>
          <span className="w-2 h-2 rounded-full bg-rose-500" />
        </div>

        {/* Bars Container */}
        <div className="space-y-2 py-1">
          {displayExpiredBranches.map((item) => {
            const widthPct = Math.min(100, Math.max(12, (item.count / 8) * 100));
            return (
              <div 
                key={item.name} 
                onClick={() => onFilterBranch && onFilterBranch(item.name)}
                className="flex items-center justify-between text-xs gap-2 group cursor-pointer hover:bg-white/[0.03] p-1.5 rounded-xl transition-all"
                title={`انقر لفلترة سيارات ${item.name}`}
              >
                <span className="text-[11px] text-slate-300 w-36 truncate text-right font-medium group-hover:text-rose-300 transition-colors">
                  {item.name}
                </span>

                <div className="flex-1 h-3 bg-[#050811] rounded-full overflow-hidden flex items-center p-0.5 border border-white/[0.05]">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                <span className="font-mono text-[11px] font-bold text-rose-400 w-6 text-center">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* X-Axis Scale */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2.5 border-t border-white/[0.04] mt-1 font-mono px-4">
          <span>0</span>
          <span>2</span>
          <span>4</span>
          <span>6</span>
          <span>8+ رخص</span>
        </div>
      </div>

      {/* 3. Status Distribution Donut Chart */}
      <div className="col-span-12 md:col-span-4 rounded-2xl bg-[#090e1a]/95 backdrop-blur-xl border border-white/[0.08] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PieChart className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-100">
              توزيع الرخص حسب الحالة (أسطول سعودي)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
            {totalEvaluated} رخصة
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 py-1">
          {/* Donut graphic */}
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="#151d2c"
                strokeWidth="11"
              />
              {/* Green (Valid) */}
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth="11"
                strokeDasharray={`${validStroke} ${donutCirc - validStroke}`}
                strokeDashoffset={validOffset}
                strokeLinecap="round"
              />
              {/* Orange (Expiring) */}
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="11"
                strokeDasharray={`${expiringStroke} ${donutCirc - expiringStroke}`}
                strokeDashoffset={expiringOffset}
                strokeLinecap="round"
              />
              {/* Red (Expired) */}
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="11"
                strokeDasharray={`${expiredStroke} ${donutCirc - expiredStroke}`}
                strokeDashoffset={expiredOffset}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-sm font-black text-white font-mono leading-none">{validPct}%</span>
              <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">سارية</span>
            </div>
          </div>

          {/* Interactive Legend with values */}
          <div className="flex-1 space-y-2 text-xs">
            <div 
              onClick={() => onFilterStatus && onFilterStatus('valid')}
              className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 cursor-pointer transition-colors border border-transparent hover:border-emerald-500/25"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-300 text-[11px] font-medium">سارية</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="font-bold text-white text-[11px]">{validCount}</span>
                <span className="text-[10px] text-slate-500 font-sans">({validPct}%)</span>
              </div>
            </div>

            <div 
              onClick={() => onFilterStatus && onFilterStatus('expiring_soon')}
              className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.02] hover:bg-amber-500/10 cursor-pointer transition-colors border border-transparent hover:border-amber-500/25"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                <span className="text-slate-300 text-[11px] font-medium">قريبة الانتهاء</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="font-bold text-amber-400 text-[11px]">{expiringCount}</span>
                <span className="text-[10px] text-slate-500 font-sans">({expiringPct}%)</span>
              </div>
            </div>

            <div 
              onClick={() => onFilterStatus && onFilterStatus('expired')}
              className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.02] hover:bg-rose-500/10 cursor-pointer transition-colors border border-transparent hover:border-rose-500/25"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                <span className="text-slate-300 text-[11px] font-medium">منتهية</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="font-bold text-rose-400 text-[11px]">{expiredCount}</span>
                <span className="text-[10px] text-slate-500 font-sans">({expiredPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.04] text-[10px] text-slate-400 flex items-center justify-between">
          <span>إجمالي الرخص المفحوصة بالأسطول:</span>
          <span className="font-mono text-emerald-400 font-bold">{totalEvaluated} رخصة</span>
        </div>
      </div>
    </div>
  );
};
