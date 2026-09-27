import React from 'react';
import { Truck, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import { translations, Language } from '../utils/i18n';

interface HeroSectionProps {
  lang: Language;
  totalVehiclesCount?: number;
  totalVehicles?: number;
  validRatePercent?: number;
  complianceRate?: number;
  activeVehiclesCount?: number;
  expiringCount?: number;
  expiredCount?: number;
  thresholdDays?: number;
  referenceDate?: string;
  onOpenExpiring?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  totalVehiclesCount,
  totalVehicles,
  validRatePercent,
  complianceRate,
  expiringCount = 0,
  expiredCount = 0,
  onOpenExpiring,
}) => {
  const t = translations[lang];
  const fleetCount = typeof totalVehicles === 'number' ? totalVehicles : (totalVehiclesCount || 0);
  const compliance = typeof complianceRate === 'number' ? complianceRate : (validRatePercent || 0);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1322] to-slate-900 border border-white/[0.08] p-5 lg:p-6 mb-6 shadow-2xl">
      {/* Background radial glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Text Side */}
        <div className="space-y-3 max-w-xl text-right rtl:text-right ltr:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>سعودي سوبر ماركت • مصر 🇪🇬</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
            {t.systemName}{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              SEOUDI FLEET
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            متابعة لحظية وشاملة لرخص التسيير الصادرة من وحدات المرور وتصاريح الإعلانات لأسطول سيارات التوصيل المنزلي لجميع فروع سعودي سوبر ماركت (القاهرة الكبرى، التجمع، الشيخ زايد، 6 أكتوبر، المعادي، مصر الجديدة).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/5 text-slate-300">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>إجمالي الأسطول: <strong className="text-white font-mono">{fleetCount}</strong> سيارة</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>نسبة الالتزام القانوني: <strong className="text-emerald-400 font-mono font-bold">{compliance}%</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Action Alerts Pill */}
        {(expiringCount > 0 || expiredCount > 0) && (
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            <button
              onClick={onOpenExpiring}
              className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer group"
            >
              <div className="text-right">
                <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  تنبيه: {expiringCount} رخصة قريبة من الانتهاء
                </div>
                <div className="text-[11px] text-slate-400">تستلزم بدء إجراءات التجديد بالمرور والحي</div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            </button>

            {expiredCount > 0 && (
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <div className="text-right">
                  <div className="text-xs font-bold text-rose-300">
                    تحذير عاجل: {expiredCount} رخصة منتهية الصلاحية
                  </div>
                  <div className="text-[11px] text-slate-400">يلزم إيقاف السيارة أو التجديد الفوري</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
