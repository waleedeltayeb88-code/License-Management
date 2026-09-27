import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Filter, 
  Car, 
  Megaphone, 
  AlertTriangle, 
  Clock, 
  Building2,
  CalendarCheck,
  Loader2,
  PieChart,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Layers,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { Vehicle } from '../types';
import { calculateRemainingDays, getLicenseStatus, formatDateWithDayName, getStatusTheme } from '../utils/dateUtils';
import { exportVehiclesToExcel } from '../utils/exportUtils';
import { generateFleetPdf } from '../utils/pdfExport';
import { translations, Language } from '../utils/i18n';

interface ReportsViewProps {
  lang: Language;
  vehicles: Vehicle[];
  thresholdDays: number;
  referenceDate: string;
}

type TabMode = 'analytics' | 'forecast_curve' | 'roster_reports';

type ReportType = 
  | 'all' 
  | 'traffic_only' 
  | 'comm_only' 
  | 'expired' 
  | 'expiring_soon' 
  | 'budget_audit';

export const ReportsView: React.FC<ReportsViewProps> = ({
  lang,
  vehicles = [],
  thresholdDays,
  referenceDate,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<TabMode>('analytics');
  const [selectedReport, setSelectedReport] = useState<ReportType>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');

  // Extract unique branches
  const branchesList = useMemo(() => {
    const bSet = new Set<string>();
    vehicles.forEach(v => {
      if (v.branch) bSet.add(v.branch);
    });
    return Array.from(bSet).sort();
  }, [vehicles]);

  // Deep Fleet Aggregations
  const analytics = useMemo(() => {
    let tValid = 0;
    let tExpiring = 0;
    let tExpired = 0;

    let cValid = 0;
    let cExpiring = 0;
    let cExpired = 0;

    let bothValid = 0;
    let anyExpired = 0;

    // Branches aggregation
    const branchStats: Record<string, { total: number; valid: number; expiring: number; expired: number }> = {};
    // Models aggregation
    const modelStats: Record<string, number> = {};

    vehicles.forEach(v => {
      const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
      const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);

      if (tStat === 'valid') tValid++;
      else if (tStat === 'expiring_soon') tExpiring++;
      else if (tStat === 'expired') tExpired++;

      if (cStat === 'valid') cValid++;
      else if (cStat === 'expiring_soon') cExpiring++;
      else if (cStat === 'expired') cExpired++;

      if (tStat === 'valid' && cStat === 'valid') bothValid++;
      if (tStat === 'expired' || cStat === 'expired') anyExpired++;

      // Branch
      const b = v.branch || 'غير محدد';
      if (!branchStats[b]) branchStats[b] = { total: 0, valid: 0, expiring: 0, expired: 0 };
      branchStats[b].total++;
      if (tStat === 'valid' && cStat === 'valid') branchStats[b].valid++;
      else if (tStat === 'expired' || cStat === 'expired') branchStats[b].expired++;
      else branchStats[b].expiring++;

      // Model
      const m = v.model || 'غير محدد';
      modelStats[m] = (modelStats[m] || 0) + 1;
    });

    const totalV = vehicles.length || 1;
    const overallCompliance = Math.round((bothValid / totalV) * 100);
    const trafficCompliance = Math.round((tValid / totalV) * 100);
    const commercialCompliance = Math.round((cValid / totalV) * 100);

    // Financial estimations (EGP)
    const TRAFFIC_FEE = 3500;
    const COMM_FEE = 2600;
    const INSPECTION_FEE = 850;

    const immediateCost = (tExpired * TRAFFIC_FEE) + (cExpired * COMM_FEE) + (anyExpired * INSPECTION_FEE);
    const upcoming30Cost = (tExpiring * TRAFFIC_FEE) + (cExpiring * COMM_FEE) + (tExpiring * INSPECTION_FEE);
    const annualEstCost = (totalV * TRAFFIC_FEE) + (totalV * COMM_FEE) + (totalV * INSPECTION_FEE);

    return {
      totalVehicles: vehicles.length,
      traffic: { valid: tValid, expiring: tExpiring, expired: tExpired, rate: trafficCompliance },
      commercial: { valid: cValid, expiring: cExpiring, expired: cExpired, rate: commercialCompliance },
      bothValid,
      anyExpired,
      overallCompliance,
      branchStats,
      modelStats,
      financials: {
        immediateCost,
        upcoming30Cost,
        annualEstCost
      }
    };
  }, [vehicles, thresholdDays, referenceDate]);

  // 12-Month Renewal Forecast Timeline Curve
  const forecast12Months = useMemo(() => {
    const monthsArr: { 
      key: string; 
      labelAr: string; 
      labelEn: string; 
      trafficCount: number; 
      commCount: number; 
      total: number;
      estimatedCost: number;
    }[] = [];

    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const ref = new Date(referenceDate);

    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(ref.getFullYear(), ref.getMonth() + i, 1);
      const year = targetDate.getFullYear();
      const monthNum = targetDate.getMonth();
      const key = `${year}-${String(monthNum + 1).padStart(2, '0')}`;

      monthsArr.push({
        key,
        labelAr: `${monthNamesAr[monthNum]} ${year}`,
        labelEn: `${monthNamesEn[monthNum]} ${year}`,
        trafficCount: 0,
        commCount: 0,
        total: 0,
        estimatedCost: 0
      });
    }

    vehicles.forEach(v => {
      const tExp = v.trafficLicense?.expiryDate;
      const cExp = v.commercialLicense?.expiryDate;

      if (tExp && tExp.length >= 7) {
        const k = tExp.slice(0, 7);
        const found = monthsArr.find(m => m.key === k);
        if (found) {
          found.trafficCount++;
          found.total++;
          found.estimatedCost += 3500;
        }
      }

      if (cExp && cExp.length >= 7) {
        const k = cExp.slice(0, 7);
        const found = monthsArr.find(m => m.key === k);
        if (found) {
          found.commCount++;
          found.total++;
          found.estimatedCost += 2600;
        }
      }
    });

    return monthsArr;
  }, [vehicles, referenceDate]);

  // Filtered vehicles for the Roster Report
  const filteredList = useMemo(() => {
    let list = [...vehicles];

    if (selectedReport === 'expired') {
      list = list.filter((v) => {
        const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
        const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
        return tStat === 'expired' || cStat === 'expired';
      });
    } else if (selectedReport === 'expiring_soon') {
      list = list.filter((v) => {
        const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
        const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
        return tStat === 'expiring_soon' || cStat === 'expiring_soon';
      });
    } else if (selectedReport === 'traffic_only') {
      list = list.filter((v) => {
        const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
        return tStat === 'expiring_soon' || tStat === 'expired';
      });
    } else if (selectedReport === 'comm_only') {
      list = list.filter((v) => {
        const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
        return cStat === 'expiring_soon' || cStat === 'expired';
      });
    } else if (selectedReport === 'budget_audit') {
      list = list.filter((v) => {
        const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
        const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
        return tStat !== 'valid' || cStat !== 'valid';
      });
    }

    if (branchFilter !== 'all') {
      list = list.filter((v) => v.branch === branchFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
        (v.plateLetters && v.plateLetters.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.vin && v.vin.toLowerCase().includes(q)) ||
        (v.branch && v.branch.toLowerCase().includes(q))
      );
    }

    return list;
  }, [vehicles, selectedReport, branchFilter, searchQuery, thresholdDays, referenceDate]);

  const categoryNames: Record<ReportType, string> = {
    all: 'تقرير أسطول سيارات التوصيل بالكامل',
    traffic_only: 'تقرير رخص تسيير المرور التي تتطلب متابعة',
    comm_only: 'تقرير تصاريح ملصقات الإعلانات التي تتطلب متابعة',
    expired: 'تقرير الرخص والتصاريح المنتهية (عاجل - إيقاف وفحص)',
    expiring_soon: 'تقرير الرخص وشيكة الانتهاء (خطة التجديد المبكر)',
    budget_audit: 'تقرير ميزانية وتكاليف التجديد التقديرية للأسطول'
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportVehiclesToExcel(
        filteredList,
        thresholdDays,
        referenceDate,
        `سعودي_سوبر_ماركت_${selectedReport}_${referenceDate}.xlsx`,
        {
          reportTitle: `سعودي سوبر ماركت — ${categoryNames[selectedReport]}`,
          reportCategory: selectedReport
        }
      );
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePdfExport = async () => {
    try {
      setIsPdfExporting(true);
      setPdfProgressText('جاري الإعداد...');
      const result = await generateFleetPdf(filteredList, {
        reportTitle: `سعودي سوبر ماركت — ${categoryNames[selectedReport]}`,
        reportSubtitle: 'الإدارة العامة للخدمات اللوجستية والحركة — التقرير التنفيذي المعتمد',
        reportType: selectedReport === 'expired' ? 'urgent' : 'all',
        branchFilter: branchFilter !== 'all' ? branchFilter : undefined,
        thresholdDays,
        referenceDate,
        onProgress: (current, total) => {
          setPdfProgressText(`${current}/${total}`);
        }
      });

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsPdfExporting(false);
      setPdfProgressText('');
    }
  };

  // SVG Curve Dimensions & Calculations
  const maxMonthValue = Math.max(...forecast12Months.map(m => m.total), 1);
  const chartWidth = 760;
  const chartHeight = 220;
  const padX = 40;
  const padY = 30;

  const curvePoints = forecast12Months.map((m, idx) => {
    const x = padX + (idx / (forecast12Months.length - 1)) * (chartWidth - padX * 2);
    const normalizedY = 1 - (m.total / maxMonthValue);
    const y = padY + normalizedY * (chartHeight - padY * 2);
    return { x, y, ...m };
  });

  let curveD = '';
  if (curvePoints.length > 0) {
    curveD = `M ${curvePoints[0].x} ${curvePoints[0].y}`;
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p0 = curvePoints[i];
      const p1 = curvePoints[i + 1];
      const mx = (p0.x + p1.x) / 2;
      curveD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const areaD = curvePoints.length > 0
    ? `${curveD} L ${curvePoints[curvePoints.length - 1].x} ${chartHeight - padY} L ${curvePoints[0].x} ${chartHeight - padY} Z`
    : '';

  // SVG Donut Helpers
  const makeDonutSlices = (valid: number, expiring: number, expired: number, r: number) => {
    const circ = 2 * Math.PI * r;
    const total = valid + expiring + expired || 1;
    const validLen = (valid / total) * circ;
    const expiringLen = (expiring / total) * circ;
    const expiredLen = (expired / total) * circ;

    const validOff = 0;
    const expiringOff = -validLen;
    const expiredOff = -(validLen + expiringLen);

    return { circ, validLen, expiringLen, expiredLen, validOff, expiringOff, expiredOff, total };
  };

  const trafficDonut = makeDonutSlices(analytics.traffic.valid, analytics.traffic.expiring, analytics.traffic.expired, 45);
  const commDonut = makeDonutSlices(analytics.commercial.valid, analytics.commercial.expiring, analytics.commercial.expired, 45);

  return (
    <div className="space-y-6 mb-12">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {lang === 'ar' ? 'مركز التقارير التنفيذية والتحليلات البيانية' : 'Executive Fleet Reports & Analytics Suite'}
              </h2>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40">
                PRO v3.5
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? 'تحليل بياني معمق، دوائر وكيرف تدفق التجديدات، مصفوفة مخاطر الفروع، وتصدير فوري للتقارير التنفيذية.'
                : 'Deep visual analytics, donut charts, renewal forecast curve, branch risk matrix, and executive PDF/Excel exports.'}
            </p>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
            title="طباعة سريعة"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'طباعة' : 'Print'}</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span>{isExporting ? (lang === 'ar' ? 'تجهيز الشيت...' : 'Exporting...') : (lang === 'ar' ? 'تصدير إكسل ملون' : 'Export Excel')}</span>
          </button>

          <button
            onClick={handlePdfExport}
            disabled={isPdfExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-950 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 border border-amber-400/40"
          >
            {isPdfExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                <span>جاري إنشاء PDF {pdfProgressText ? `(${pdfProgressText})` : ''}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{lang === 'ar' ? 'تصدير تقرير PDF تنفيذي فاخر' : 'Export Luxury PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>{lang === 'ar' ? 'لوحة التحليلات والدوائر البيانية' : 'Analytics & Donut Charts'}</span>
        </button>

        <button
          onClick={() => setActiveTab('forecast_curve')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'forecast_curve'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{lang === 'ar' ? 'كيرف ومنحنى التجديدات (12 شهر)' : '12-Month Renewal Curve'}</span>
        </button>

        <button
          onClick={() => setActiveTab('roster_reports')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roster_reports'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تقارير الامتثال والجداول التفصيلية' : 'Compliance Reports & Tables'}</span>
          <span className="bg-slate-950/40 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
            {filteredList.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ANALYTICS & DONUT CHARTS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <span className="text-xs text-slate-400 font-semibold">{lang === 'ar' ? 'نسبة الامتثال الكلي' : 'Overall Compliance'}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-emerald-400">{analytics.overallCompliance}%</span>
                <span className="text-xs text-slate-400">({analytics.bothValid} سيارة)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${analytics.overallCompliance}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <span className="text-xs text-slate-400 font-semibold">{lang === 'ar' ? 'رخص المرور السارية' : 'Traffic Licenses Valid'}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-amber-400">{analytics.traffic.rate}%</span>
                <span className="text-xs text-slate-400">({analytics.traffic.valid} رخصة)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${analytics.traffic.rate}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <span className="text-xs text-slate-400 font-semibold">{lang === 'ar' ? 'تصاريح الإعلانات السارية' : 'Commercial Ads Valid'}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-blue-400">{analytics.commercial.rate}%</span>
                <span className="text-xs text-slate-400">({analytics.commercial.valid} رخصة)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${analytics.commercial.rate}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <span className="text-xs text-slate-400 font-semibold">{lang === 'ar' ? 'ميزانية الرخص المنتهية' : 'Immediate Renewal Budget'}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black font-mono text-rose-400">
                  {analytics.financials.immediateCost.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <span className="text-[10px] text-rose-400/80 block mt-1">
                {analytics.anyExpired} سيارة تتطلب تجديداً فورياً
              </span>
            </div>
          </div>

          {/* Dual Donut Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donut 1: Traffic Licenses */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {lang === 'ar' ? 'دائرة امتثال رخص تسيير المرور' : 'Traffic License Compliance Donut'}
                    </h3>
                    <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'توزيع رخص المرور بحسب حالة السريان' : 'Traffic license distribution'}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {analytics.traffic.valid} / {vehicles.length}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg width="144" height="144" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#1e293b" strokeWidth="15" />
                    <circle
                      cx="60" cy="60" r="45" fill="none" stroke="#10b981" strokeWidth="15"
                      strokeDasharray={`${trafficDonut.validLen} ${trafficDonut.circ - trafficDonut.validLen}`}
                      strokeDashoffset={trafficDonut.validOff} strokeLinecap="round"
                    />
                    <circle
                      cx="60" cy="60" r="45" fill="none" stroke="#f59e0b" strokeWidth="15"
                      strokeDasharray={`${trafficDonut.expiringLen} ${trafficDonut.circ - trafficDonut.expiringLen}`}
                      strokeDashoffset={trafficDonut.expiringOff} strokeLinecap="round"
                    />
                    <circle
                      cx="60" cy="60" r="45" fill="none" stroke="#f43f5e" strokeWidth="15"
                      strokeDasharray={`${trafficDonut.expiredLen} ${trafficDonut.circ - trafficDonut.expiredLen}`}
                      strokeDashoffset={trafficDonut.expiredOff} strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center pointer-events-none">
                    <span className="text-2xl font-black font-mono text-white block leading-none">{analytics.traffic.rate}%</span>
                    <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'سارية' : 'Valid'}</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-3 w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                      <span className="text-xs text-slate-300 font-medium">{lang === 'ar' ? 'سارية وصالحة' : 'Valid'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{analytics.traffic.valid} رخصة</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="text-xs text-slate-300 font-medium">{lang === 'ar' ? 'تنتهي قريباً (30 يوم)' : 'Expiring Soon'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">{analytics.traffic.expiring} رخصة</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                      <span className="text-xs text-slate-300 font-medium">{lang === 'ar' ? 'منتهية (عاجل)' : 'Expired'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-400">{analytics.traffic.expired} رخصة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donut 2: Commercial Licenses */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {lang === 'ar' ? 'دائرة تصاريح ملصقات الإعلانات' : 'Commercial Ads License Compliance Donut'}
                    </h3>
                    <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'توزيع تصاريح الدعاية والإعلان التجارية' : 'Commercial ad permit distribution'}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  {analytics.commercial.valid} / {vehicles.length}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg width="144" height="144" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#1e293b" strokeWidth="15" />
                    <circle
                      cx="60" cy="60" r="45" fill="none" stroke="#10b981" strokeWidth="15"
                      strokeDasharray={`${commDonut.validLen} ${commDonut.circ - commDonut.validLen}`}
                      strokeDashoffset={commDonut.validOff} strokeLinecap="round"
                    />
                    <circle
                      cx="60" cy="60" r="45" fill="none" stroke="#f59e0b" strokeWidth="15"
                      strokeDasharray={`${commDonut.expiringLen} ${commDonut.circ - commDonut.expiringLen}`}
                      strokeDashoffset={commDonut.expiringOff} strokeLinecap="round"
                    />
                    <circle
                      cx="60" cy="60" r="45" fill="none" stroke="#f43f5e" strokeWidth="15"
                      strokeDasharray={`${commDonut.expiredLen} ${commDonut.circ - commDonut.expiredLen}`}
                      strokeDashoffset={commDonut.expiredOff} strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center pointer-events-none">
                    <span className="text-2xl font-black font-mono text-white block leading-none">{analytics.commercial.rate}%</span>
                    <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'سارية' : 'Valid'}</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-3 w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                      <span className="text-xs text-slate-300 font-medium">{lang === 'ar' ? 'سارية وصالحة' : 'Valid'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{analytics.commercial.valid} تصريح</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="text-xs text-slate-300 font-medium">{lang === 'ar' ? 'تنتهي قريباً (30 يوم)' : 'Expiring Soon'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">{analytics.commercial.expiring} تصريح</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                      <span className="text-xs text-slate-300 font-medium">{lang === 'ar' ? 'منتهية (عاجل)' : 'Expired'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-400">{analytics.commercial.expired} تصريح</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branch Performance & Risk Heatmap */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'ar' ? 'مصفوفة أداء الفروع ونسب الامتثال والمخاطر' : 'Branch Compliance Matrix & Risk Index'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ar' ? 'تحليل مقارن لجميع مواقع وفروع التوزيع في جمهورية مصر العربية' : 'Comparative fleet distribution across all branches'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {Object.keys(analytics.branchStats).length} فرع مسجل
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(analytics.branchStats) as [string, { total: number; valid: number; expiring: number; expired: number }][]).map(([bName, bData]) => {
                const compRate = Math.round((bData.valid / bData.total) * 100);
                const barColor = compRate >= 70 ? 'bg-emerald-500' : compRate >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                const riskLevel = bData.expired > 3 ? 'خطر مرتفع' : bData.expired > 0 ? 'خطر متوسط' : 'مطابق وآمن';
                const riskBadge = bData.expired > 3 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : bData.expired > 0 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                return (
                  <div key={bName} className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">{bName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadge}`}>
                          {riskLevel}
                        </span>
                        <span className="text-xs font-mono font-black text-amber-400">{compRate}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden mb-2">
                      <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${compRate}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>إجمالي السيارات: <b className="text-white">{bData.total}</b></span>
                      <span>مطابقة: <b className="text-emerald-400">{bData.valid}</b></span>
                      <span>تنبيه: <b className="text-amber-400">{bData.expiring}</b></span>
                      <span>منتهية: <b className="text-rose-400">{bData.expired}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 12-MONTH RENEWAL FORECAST CURVE                                    */}
      {/* ========================================================================= */}
      {activeTab === 'forecast_curve' && (
        <div className="space-y-6">
          {/* Main Curve Chart Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'ar' ? 'منحنى وكيرف التجديدات المتوقعة على مدار الـ 12 شهراً القادمة' : '12-Month Renewal Volume & Pressure Curve'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ar' ? 'توقع التدفق العددي والمالي لانتهاء رخص التسيير وتصاريح الإعلانات' : 'Projected monthly volume and renewal financial flow'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>{lang === 'ar' ? 'منحنى حجم التجديدات' : 'Renewal Volume Curve'}</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold font-mono">
                  {lang === 'ar' ? `الذروة: ${maxMonthValue} رخصة/شهر` : `Peak: ${maxMonthValue} licenses`}
                </span>
              </div>
            </div>

            {/* SVG Interactive Area & Curve */}
            <div className="relative w-full overflow-x-auto">
              <div style={{ minWidth: '700px' }}>
                <svg width="100%" height="240" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
                  <defs>
                    <linearGradient id="reportsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0.25, 0.5, 0.75, 1].map((factor, gIdx) => {
                    const lineY = padY + (1 - factor) * (chartHeight - padY * 2);
                    return (
                      <g key={gIdx}>
                        <line x1={padX} y1={lineY} x2={chartWidth - padX} y2={lineY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                        <text x={padX - 8} y={lineY + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                          {Math.round(factor * maxMonthValue)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Baseline */}
                  <line x1={padX} y1={chartHeight - padY} x2={chartWidth - padX} y2={chartHeight - padY} stroke="#475569" strokeWidth="1.5" />

                  {/* Area Fill */}
                  {areaD && <path d={areaD} fill="url(#reportsAreaGrad)" />}

                  {/* Curve Path */}
                  {curveD && <path d={curveD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />}

                  {/* Interactive Data Points */}
                  {curvePoints.map((pt, pIdx) => {
                    const isHovered = hoveredMonth === pIdx;
                    return (
                      <g 
                        key={pt.key}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredMonth(pIdx)}
                        onMouseLeave={() => setHoveredMonth(null)}
                      >
                        {/* Hover vertical line */}
                        {isHovered && (
                          <line x1={pt.x} y1={padY} x2={pt.x} y2={chartHeight - padY} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
                        )}

                        {/* Outer Glow Circle */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 7 : 4}
                          fill={isHovered ? '#fbbf24' : '#ffffff'}
                          stroke="#064e3b"
                          strokeWidth="2.5"
                        />

                        {/* Data Label over peak */}
                        <text
                          x={pt.x}
                          y={pt.y - 10}
                          fill={isHovered ? '#fbbf24' : '#34d399'}
                          fontSize={isHovered ? '11' : '9.5'}
                          fontWeight="800"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {pt.total}
                        </text>

                        {/* X-Axis Month Label */}
                        <text
                          x={pt.x}
                          y={chartHeight - 8}
                          fill={isHovered ? '#ffffff' : '#94a3b8'}
                          fontSize="9"
                          fontWeight={isHovered ? '800' : '600'}
                          textAnchor="middle"
                        >
                          {lang === 'ar' ? pt.labelAr.split(' ')[0] : pt.labelEn.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Hovered Month Detail Drawer Strip */}
            {hoveredMonth !== null && forecast12Months[hoveredMonth] && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="font-bold text-white">
                    {lang === 'ar' ? forecast12Months[hoveredMonth].labelAr : forecast12Months[hoveredMonth].labelEn}
                  </span>
                </div>
                <div className="flex items-center gap-6 font-mono text-slate-300">
                  <span>رخص سير: <b className="text-amber-400 font-bold">{forecast12Months[hoveredMonth].trafficCount}</b></span>
                  <span>تصاريح إعلانات: <b className="text-blue-400 font-bold">{forecast12Months[hoveredMonth].commCount}</b></span>
                  <span>الإجمالي: <b className="text-emerald-400 font-bold">{forecast12Months[hoveredMonth].total} رخصة</b></span>
                  <span>التكلفة المتوقعة: <b className="text-white font-bold">{forecast12Months[hoveredMonth].estimatedCost.toLocaleString('ar-EG')} ج.م</b></span>
                </div>
              </div>
            )}
          </div>

          {/* 12-Month Table Breakdown */}
          <div className="rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                {lang === 'ar' ? 'الجدول الزمني المفصل لتجديدات الشهور القادمة' : 'Detailed Monthly Renewal Schedule'}
              </span>
              <span className="text-xs text-slate-400">
                {lang === 'ar' ? 'الميزانية التقديرية تشمل رسوم المرور وتصاريح الإعلانات' : 'Estimated budget includes traffic & ad licensing fees'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right rtl:text-right ltr:text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-white/10">
                    <th className="py-3 px-4">الشهر المستهدف</th>
                    <th className="py-3 px-4 text-center">رخص المرور</th>
                    <th className="py-3 px-4 text-center">تصاريح الإعلانات</th>
                    <th className="py-3 px-4 text-center">إجمالي الرخص</th>
                    <th className="py-3 px-4 text-center">الميزانية التقديرية (ج.م)</th>
                    <th className="py-3 px-4 text-center">مستوى الضغط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {forecast12Months.map((m) => {
                    const pressure = m.total > 15 ? 'ذروة عالية' : m.total > 7 ? 'ضغط متوسط' : 'تشغيل عادي';
                    const pColor = m.total > 15 ? 'text-rose-400 bg-rose-500/10' : m.total > 7 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10';

                    return (
                      <tr key={m.key} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-sans font-bold text-white">{lang === 'ar' ? m.labelAr : m.labelEn}</td>
                        <td className="py-3 px-4 text-center text-amber-400 font-bold">{m.trafficCount}</td>
                        <td className="py-3 px-4 text-center text-blue-400 font-bold">{m.commCount}</td>
                        <td className="py-3 px-4 text-center text-white font-bold">{m.total}</td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-bold">{m.estimatedCost.toLocaleString('ar-EG')} ج.م</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans ${pColor}`}>
                            {pressure}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROSTER REPORTS & COMPLIANCE TABLES                                */}
      {/* ========================================================================= */}
      {activeTab === 'roster_reports' && (
        <div className="space-y-6">
          {/* Report Category Selector Pills */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'all' as ReportType, label: 'كافة أسطول سيارات التوصيل', icon: FileSpreadsheet, color: 'text-emerald-400' },
              { id: 'expired' as ReportType, label: 'الرخص المنتهية (عاجل - إيقاف)', icon: AlertTriangle, color: 'text-rose-400' },
              { id: 'expiring_soon' as ReportType, label: 'الرخص وشيكة الانتهاء (30 يوم)', icon: Clock, color: 'text-amber-400' },
              { id: 'traffic_only' as ReportType, label: 'رخص تسيير المرور', icon: Car, color: 'text-amber-400' },
              { id: 'comm_only' as ReportType, label: 'تصاريح الإعلانات والدعاية', icon: Megaphone, color: 'text-blue-400' },
              { id: 'budget_audit' as ReportType, label: 'كشف تكاليف وميزانية التجديد', icon: DollarSign, color: 'text-emerald-400' },
            ].map((btn) => {
              const Icon = btn.icon;
              const isActive = selectedReport === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setSelectedReport(btn.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : btn.color}`} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-white/10">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'بحث برقم اللوحة، الموديل، الشاسيه، أو الفرع...' : 'Search plate, model, VIN, branch...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">{lang === 'ar' ? 'جميع الفروع والمواقع' : 'All Branches'}</option>
                {branchesList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Printable Report Table */}
          <div className="rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {categoryNames[selectedReport]}
                </span>
                <span className="bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-md">
                  {filteredList.length} سيارة
                </span>
              </div>
              <span>{lang === 'ar' ? `تاريخ التدقيق المعتمد: ${referenceDate}` : `Benchmark Date: ${referenceDate}`}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right rtl:text-right ltr:text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-white/10 font-bold uppercase">
                    <th className="py-3 px-3 text-center">#</th>
                    <th className="py-3 px-4">{t.colVehicleNum}</th>
                    <th className="py-3 px-4">{t.colModel}</th>
                    <th className="py-3 px-4">{t.colBranch}</th>
                    <th className="py-3 px-3 text-amber-400">{t.trafficLicense}</th>
                    <th className="py-3 px-3">{t.colExpiryDate}</th>
                    <th className="py-3 px-3 text-center">{t.colDaysLeft}</th>
                    <th className="py-3 px-3 text-center">{t.colStatus}</th>
                    <th className="py-3 px-3 text-blue-400">{t.commercialLicense}</th>
                    <th className="py-3 px-3">{t.colExpiryDate}</th>
                    <th className="py-3 px-3 text-center">{t.colDaysLeft}</th>
                    <th className="py-3 px-3 text-center">{t.colStatus}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'التكلفة التقديرية' : 'Est. Fee'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredList.map((veh, idx) => {
                    const rawTDays = calculateRemainingDays(veh.trafficLicense?.expiryDate, referenceDate);
                    const tDays = isNaN(rawTDays) ? 0 : rawTDays;
                    const tStat = getLicenseStatus(veh.trafficLicense?.expiryDate, thresholdDays, referenceDate);
                    const tTheme = getStatusTheme(tStat);

                    const rawCDays = calculateRemainingDays(veh.commercialLicense?.expiryDate, referenceDate);
                    const cDays = isNaN(rawCDays) ? 0 : rawCDays;
                    const cStat = getLicenseStatus(veh.commercialLicense?.expiryDate, thresholdDays, referenceDate);
                    const cTheme = getStatusTheme(cStat);

                    // Est fee
                    let fee = 0;
                    if (tStat === 'expired' || tStat === 'expiring_soon') fee += 3500;
                    if (cStat === 'expired' || cStat === 'expiring_soon') fee += 2600;

                    return (
                      <tr key={veh.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-amber-400">
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/10">
                            {veh.vehicleNumber}{veh.plateLetters ? ` ${veh.plateLetters}` : ''}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 font-medium">{veh.model}</td>
                        <td className="py-2.5 px-4 text-slate-200 font-bold">{veh.branch}</td>

                        {/* Traffic */}
                        <td className="py-2.5 px-3 font-mono text-slate-300">{veh.trafficLicense?.licenseNumber || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-200 text-xs whitespace-nowrap font-medium">
                          {formatDateWithDayName(veh.trafficLicense?.expiryDate)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span className={tDays < 0 ? 'text-rose-400' : tDays <= thresholdDays ? 'text-amber-400' : 'text-emerald-400'}>
                            {tDays}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${tTheme.badgeBg}`}>
                            {lang === 'ar' ? tTheme.labelAr : tTheme.labelEn}
                          </span>
                        </td>

                        {/* Commercial */}
                        <td className="py-2.5 px-3 font-mono text-slate-300">{veh.commercialLicense?.licenseNumber || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-200 text-xs whitespace-nowrap font-medium">
                          {formatDateWithDayName(veh.commercialLicense?.expiryDate)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span className={cDays < 0 ? 'text-rose-400' : cDays <= thresholdDays ? 'text-amber-400' : 'text-emerald-400'}>
                            {cDays}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${cTheme.badgeBg}`}>
                            {lang === 'ar' ? cTheme.labelAr : cTheme.labelEn}
                          </span>
                        </td>

                        {/* Estimated Fee */}
                        <td className="py-2.5 px-4 text-center font-mono font-bold">
                          {fee > 0 ? (
                            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {fee.toLocaleString('ar-EG')} ج.م
                            </span>
                          ) : (
                            <span className="text-emerald-400">سارية ✓</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
