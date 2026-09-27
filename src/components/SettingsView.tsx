import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Sliders, 
  Calendar, 
  Building2, 
  BellRing, 
  Database, 
  DollarSign, 
  FileText, 
  Check, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  Save, 
  Sparkles,
  Car,
  Clock,
  Users
} from 'lucide-react';
import { UserRole, AppSettings, Vehicle } from '../types';
import { translations, Language } from '../utils/i18n';
import { formatDateWithDayName } from '../utils/dateUtils';

interface SettingsViewProps {
  lang: Language;
  thresholdDays: number;
  onUpdateThreshold: (days: number) => void;
  referenceDate: string;
  onUpdateReferenceDate: (date: string) => void;
  userRole: UserRole;
  onUpdateRole: (role: UserRole) => void;
  branches: string[];
  totalVehicles: number;
  settings?: AppSettings;
  onUpdateSettings?: (settings: AppSettings) => void;
  vehicles?: Vehicle[];
  onRestoreVehicles?: (vehicles: Vehicle[]) => void;
  onOpenUserManagement?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  thresholdDays,
  onUpdateThreshold,
  referenceDate,
  onUpdateReferenceDate,
  userRole,
  onUpdateRole,
  branches,
  totalVehicles,
  settings: initialSettings,
  onUpdateSettings,
  vehicles = [],
  onRestoreVehicles,
  onOpenUserManagement,
}) => {
  const t = translations[lang];

  const [activeSection, setActiveSection] = useState<'thresholds' | 'financial' | 'corporate' | 'governance' | 'rbac' | 'backup'>('thresholds');

  // Local settings state
  const [formSettings, setFormSettings] = useState<AppSettings>(() => {
    return initialSettings || {
      expiringDaysThreshold: thresholdDays || 30,
      criticalDaysThreshold: 7,
      systemNameAr: 'سعودي سوبر ماركت - مصر',
      systemNameEn: 'Seoudi Supermarket Egypt - Delivery Fleet Platform',
      companyName: 'شركة سعودي سوبر ماركت (مصر) - إدارة الحركة والأسطول',
      officialRegNumber: 'س.ت: 129482 (مكتب استثمار القاهرة)',
      taxNumber: 'ب.ض: 204-893-112',
      fleetManagerName: 'م. أحمد عثمان — مدير إدارة الأسطول والحركة المركزية',
      fleetManagerEmail: 'fleet.operations@seoudi.com',
      trafficLicenseFeeEst: 3500,
      commercialLicenseFeeEst: 2600,
      inspectionFeeEst: 850,
      taxRatePct: 14,
      maxVehicleAgeYears: 8,
      enableNotifications: true,
      enableSoundAlerts: true,
      dateFormat: 'gregorian',
      theme: 'dark'
    };
  });

  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [backupNotice, setBackupNotice] = useState('');

  const handleSave = () => {
    if (onUpdateSettings) {
      onUpdateSettings(formSettings);
    }
    if (formSettings.expiringDaysThreshold !== thresholdDays) {
      onUpdateThreshold(formSettings.expiringDaysThreshold);
    }
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      referenceDate,
      thresholdDays,
      totalVehicles: vehicles.length,
      settings: formSettings,
      vehicles,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_أسطول_سعودي_${referenceDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setBackupNotice('تم تصدير النسخة الاحتياطية بنجاح بنسق JSON');
    setTimeout(() => setBackupNotice(''), 4000);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.vehicles && Array.isArray(parsed.vehicles)) {
          if (onRestoreVehicles) {
            onRestoreVehicles(parsed.vehicles);
          }
          if (parsed.settings && onUpdateSettings) {
            onUpdateSettings(parsed.settings);
            setFormSettings(parsed.settings);
          }
          setBackupNotice(`تم استعادة ${parsed.vehicles.length} سيارة بنجاح من النسخة الاحتياطية`);
        } else {
          setBackupNotice('ملف النسخة الاحتياطية غير متوافق');
        }
      } catch (err) {
        setBackupNotice('خطأ في قراءة ملف JSON');
      }
      setTimeout(() => setBackupNotice(''), 4000);
    };
    reader.readAsText(file);
  };

  // Immediate renewal budget estimate based on form settings
  const estimatedExpiredVehicles = vehicles.filter(v => {
    return v.trafficLicense?.expiryDate < referenceDate || v.commercialLicense?.expiryDate < referenceDate;
  }).length;

  const estimatedUrgentCost = estimatedExpiredVehicles * ((formSettings.trafficLicenseFeeEst || 3500) + (formSettings.commercialLicenseFeeEst || 2600));

  return (
    <div className="max-w-5xl mx-auto space-y-6 mb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {lang === 'ar' ? 'إعدادات المنظومة ولوحة التحكم المتقدمة' : 'Advanced System Settings & Fleet Controls'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? 'التحكم في معايير التنبيه، التكاليف والميزانيات التقديرية، الترويسة الرسمية، والحوكمة التشغيلية.'
                : 'Configure alert thresholds, financial renewal budgets, official branding, and fleet governance.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-950 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{lang === 'ar' ? 'حفظ كافة الإعدادات' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Save Notification Banner */}
      {isSavedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-2 text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'ar' ? 'تم حفظ وتطبيق كافة إعدادات النظام ومعايير الأسطول بنجاح ✓' : 'System configurations successfully updated!'}</span>
        </div>
      )}

      {/* Backup Notification Banner */}
      {backupNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-2 text-amber-300 text-xs font-bold animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Section Switcher Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-white/10">
        {[
          { id: 'thresholds', label: 'المهل والتنبيهات', icon: Sliders },
          { id: 'financial', label: 'تكاليف وميزانية الرخص', icon: DollarSign },
          { id: 'corporate', label: 'الهوية والترويسة الرسمية', icon: Building2 },
          { id: 'governance', label: 'سياسات تشغيل الأسطول', icon: Shield },
          { id: 'rbac', label: 'الصلاحيات (RBAC)', icon: Lock },
          { id: 'backup', label: 'النسخ الاحتياطي والبيانات', icon: Database },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: THRESHOLDS & BENCHMARK DATES                                   */}
      {/* ========================================================================= */}
      {activeSection === 'thresholds' && (
        <div className="space-y-5">
          {/* Threshold Configuration */}
          <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'فترة التنبيه المبكر للرخص وشيكة الانتهاء' : 'Expiring Soon Alert Threshold'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar'
                    ? 'عدد الأيام المتبقية قبل الانتهاء التي يتحول عندها تصنيف الرخصة إلى "قريبة من الانتهاء" (برتقالي).'
                    : 'Days remaining before expiration when license transitions to "Expiring Soon" (Orange).'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {[15, 30, 45, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => {
                    setFormSettings(prev => ({ ...prev, expiringDaysThreshold: days }));
                    onUpdateThreshold(days);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    (formSettings.expiringDaysThreshold || thresholdDays) === days
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950/40 font-black'
                      : 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {days} {lang === 'ar' ? 'يوم' : 'days'}
                </button>
              ))}
              <span className="text-xs text-slate-400 font-mono">
                ({lang === 'ar' ? `الحالي: ${formSettings.expiringDaysThreshold || thresholdDays} يوم` : `Current: ${formSettings.expiringDaysThreshold || thresholdDays} days`})
              </span>
            </div>
          </div>

          {/* Critical Threshold */}
          <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'حد الخطر الحرج (إنذار أحمر مشدد)' : 'Critical Danger Urgency Threshold'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar'
                    ? 'عدد الأيام المتبقية القليلة جداً التي تتطلب إيقاف السيارة فوراً وتجهيز أوراق التجديد في إدارة الحركة.'
                    : 'Days remaining before transition to high-critical warning flag.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {[3, 7, 10, 14].map((critDays) => (
                <button
                  key={critDays}
                  onClick={() => setFormSettings(prev => ({ ...prev, criticalDaysThreshold: critDays }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    (formSettings.criticalDaysThreshold || 7) === critDays
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-950/40 font-black'
                      : 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {critDays} {lang === 'ar' ? 'أيام' : 'days'}
                </button>
              ))}
            </div>
          </div>

          {/* Benchmark Date Configuration */}
          <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'تاريخ المرجع الأساسي للحسابات' : 'Benchmark Calculation Date'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar'
                    ? 'التاريخ المستخدم لحساب الأيام المتبقية وحالة السريان (المرجع المحدد لبيانات الأسطول هو 2025-06-04).'
                    : 'Date used to calculate remaining days.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  onUpdateReferenceDate(todayStr);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center gap-1.5 cursor-pointer ${
                  referenceDate === new Date().toISOString().slice(0, 10)
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'ar' ? 'تاريخ اليوم الفعلي المباشر' : "Today's Live Date"}
              </button>

              <input
                type="date"
                value={referenceDate}
                onChange={(e) => onUpdateReferenceDate(e.target.value)}
                className="bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono cursor-pointer"
              />

              <div className="text-xs text-amber-300 font-bold bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/30">
                <span>التاريخ المعتمد للحسابات: </span>
                <span className="font-mono">{formatDateWithDayName(referenceDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: FINANCIAL PARAMETERS & ESTIMATION                              */}
      {/* ========================================================================= */}
      {activeSection === 'financial' && (
        <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'ar' ? 'معايير التكاليف والميزانية التقديرية لتجديد الرخص' : 'License Renewal Cost & Budget Estimation'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'تحديد متوسط الرسوم الحكومية لتجديد رخص التسيير وتصاريح الإعلانات لحساب ميزانية الأسطول تلقائياً.'
                  : 'Set standard renewal fees to auto-calculate fleet licensing expenditure.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10 space-y-2">
              <label className="text-xs text-slate-300 font-bold block">
                {lang === 'ar' ? 'رسوم رخصة التسيير (ج.م / سنة)' : 'Traffic License Fee (EGP)'}
              </label>
              <input
                type="number"
                value={formSettings.trafficLicenseFeeEst || 3500}
                onChange={(e) => setFormSettings(prev => ({ ...prev, trafficLicenseFeeEst: Number(e.target.value) }))}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 block">تشمل الضريبة والملصق الإلكتروني والتأمين</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10 space-y-2">
              <label className="text-xs text-slate-300 font-bold block">
                {lang === 'ar' ? 'رسوم تصريح الإعلان (ج.م / سنة)' : 'Commercial Ad Permit Fee (EGP)'}
              </label>
              <input
                type="number"
                value={formSettings.commercialLicenseFeeEst || 2600}
                onChange={(e) => setFormSettings(prev => ({ ...prev, commercialLicenseFeeEst: Number(e.target.value) }))}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 block">رسوم معاينة وتصريح الملصقات التجارية</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10 space-y-2">
              <label className="text-xs text-slate-300 font-bold block">
                {lang === 'ar' ? 'رسوم الفحص الفني الدوري (ج.م)' : 'Technical Inspection Fee (EGP)'}
              </label>
              <input
                type="number"
                value={formSettings.inspectionFeeEst || 850}
                onChange={(e) => setFormSettings(prev => ({ ...prev, inspectionFeeEst: Number(e.target.value) }))}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 block">فحص السلامة والانبعاثات البيئية</span>
            </div>
          </div>

          {/* Real-time Budget Calculation Card */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-300 block">
                {lang === 'ar' ? 'مؤشر الميزانية الفورية للرخص المنتهية بالأسطول حالياً:' : 'Immediate renewal budget required:'}
              </span>
              <span className="text-[11px] text-slate-400">
                {estimatedExpiredVehicles} سيارات تتطلب التجديد الفوري لمنع الغرامات
              </span>
            </div>
            <div className="text-right rtl:text-right ltr:text-left">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {estimatedUrgentCost.toLocaleString('ar-EG')} ج.م
              </span>
              <span className="text-[10px] text-slate-400 block font-bold">تقدير معتمد تلقائي</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: CORPORATE IDENTITY & OFFICIAL HEADERS                          */}
      {/* ========================================================================= */}
      {activeSection === 'corporate' && (
        <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'ar' ? 'الهوية المؤسسية وبيانات الترويسة الرسمية للتقارير' : 'Corporate Branding & Official Report Headers'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'هذه البيانات تظهر تلقائياً في ترويسة تقارير الـ PDF وتقارير الإكسل والتوقيعات المعتمدة.'
                  : 'These details are automatically printed on executive PDF and Excel report covers.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">{lang === 'ar' ? 'اسم المؤسسة / الشركة (عربي)' : 'Company Name (Ar)'}</label>
              <input
                type="text"
                value={formSettings.companyName || ''}
                onChange={(e) => setFormSettings(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">{lang === 'ar' ? 'رقم السجل التجاري' : 'Commercial Registration'}</label>
              <input
                type="text"
                value={formSettings.officialRegNumber || ''}
                onChange={(e) => setFormSettings(prev => ({ ...prev, officialRegNumber: e.target.value }))}
                className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">{lang === 'ar' ? 'رقم البطاقة الضريبية' : 'Tax Card / VAT'}</label>
              <input
                type="text"
                value={formSettings.taxNumber || ''}
                onChange={(e) => setFormSettings(prev => ({ ...prev, taxNumber: e.target.value }))}
                className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">{lang === 'ar' ? 'اسم مدير إدارة الأسطول المعتمد' : 'Fleet Operations Director'}</label>
              <input
                type="text"
                value={formSettings.fleetManagerName || ''}
                onChange={(e) => setFormSettings(prev => ({ ...prev, fleetManagerName: e.target.value }))}
                className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">{lang === 'ar' ? 'البريد الإلكتروني لإدارة الحركة' : 'Fleet Ops Email'}</label>
              <input
                type="email"
                value={formSettings.fleetManagerEmail || ''}
                onChange={(e) => setFormSettings(prev => ({ ...prev, fleetManagerEmail: e.target.value }))}
                className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">{lang === 'ar' ? 'نظام التقويم والتاريخ' : 'Calendar Format'}</label>
              <select
                value={formSettings.dateFormat || 'gregorian'}
                onChange={(e) => setFormSettings(prev => ({ ...prev, dateFormat: e.target.value as any }))}
                className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="gregorian">تاريخ ميلادي رسمي (YYYY-MM-DD)</option>
                <option value="hijri_gregorian">ميلادي مع هجري مدمج</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: FLEET GOVERNANCE POLICIES                                     */}
      {/* ========================================================================= */}
      {activeSection === 'governance' && (
        <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'ar' ? 'سياسات وقواعد تشغيل أسطول سيارات التوصيل' : 'Fleet Operating Policies & Rules'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'ضوابط السلامة والحد الأقصى لعمر المركبة وسياسات النقل بين الفروع.'
                  : 'Rules governing vehicle lifespan, periodic inspections, and branch transfers.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-white/5">
              <div>
                <span className="text-xs font-bold text-white block">
                  {lang === 'ar' ? 'الحد الأقصى لعمر سيارة التوصيل في الخدمة' : 'Maximum Vehicle Operating Age'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'تنبيه استبدال السيارة أو إحالتها للتخريد إذا تجاوزت هذا العمر' : 'Flag vehicle for replacement upon reaching limit'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[5, 7, 8, 10].map(yr => (
                  <button
                    key={yr}
                    onClick={() => setFormSettings(prev => ({ ...prev, maxVehicleAgeYears: yr }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      (formSettings.maxVehicleAgeYears || 8) === yr
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                        : 'bg-slate-800 text-slate-300 border-white/10'
                    }`}
                  >
                    {yr} {lang === 'ar' ? 'سنوات' : 'years'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-white/5">
              <div>
                <span className="text-xs font-bold text-white block">
                  {lang === 'ar' ? 'التنبيهات الصوتية في لوحة التحكم' : 'Audio Alert Chimes'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'تشغيل رنين خفيف عند وجود رخص منتهية تتطلب تدخلاً عاجلاً' : 'Play subtle chime when urgent licenses expire'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={formSettings.enableSoundAlerts ?? true}
                onChange={(e) => setFormSettings(prev => ({ ...prev, enableSoundAlerts: e.target.checked }))}
                className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: RBAC ROLES                                                    */}
      {/* ========================================================================= */}
      {activeSection === 'rbac' && (
        <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'ar' ? 'نظام التحكم بالأدوار والصلاحيات (RBAC)' : 'Role-Based Access Control (RBAC)'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'قم بالتبديل بين الأدوار لتجربة تقييد الصلاحيات على التعديل، الحذف، ونقل السيارات.'
                  : 'Switch roles to test permission gates on editing, adding licenses, and branch transfers.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                role: 'admin' as UserRole,
                title: t.roleAdmin,
                desc: lang === 'ar' ? 'صلاحيات كاملة: تعديل، إضافة، نقل، حذف، وتصدير' : 'Full access to all operations',
              },
              {
                role: 'fleet_manager' as UserRole,
                title: t.roleFleetManager,
                desc: lang === 'ar' ? 'إدارة الأسطول، تجديد الرخص، نقل السيارات، وإصدار التقارير' : 'Manage fleet, renew licenses, and transfer vehicles',
              },
              {
                role: 'branch_manager' as UserRole,
                title: t.roleBranchManager,
                desc: lang === 'ar' ? 'متابعة وإدارة رخص سيارات الفرع فقط (لا تتاح له صلاحية نقل السيارات بين الفروع)' : 'Manage assigned branch fleet only (no vehicle transfer rights)',
              },
              {
                role: 'viewer' as UserRole,
                title: t.roleViewer,
                desc: lang === 'ar' ? 'عرض ومتابعة واستعراض فقط دون إمكانية التعديل' : 'Read-only access, modifications disabled',
              },
            ].map((item) => (
              <div
                key={item.role}
                onClick={() => onUpdateRole(item.role)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  userRole === item.role
                    ? 'bg-amber-500/15 border-amber-500 shadow-md text-white'
                    : 'bg-slate-800/40 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  {userRole === item.role && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {lang === 'ar' ? 'نشط' : 'Active'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* User Management Action Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-800/60 to-amber-950/40 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">إدارة حسابات المستخدمين وكلمات المرور</h4>
                <p className="text-[11px] text-slate-400">إنشاء حسابات جديدة، إعادة تعيين كلمات المرور، وتحديد صلاحيات الفروع</p>
              </div>
            </div>

            {onOpenUserManagement && (
              <button
                type="button"
                onClick={onOpenUserManagement}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all"
              >
                <Users className="w-4 h-4 text-slate-950" />
                <span>إدارة المستخدمين والصلاحيات</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: BACKUP & DATA MAINTENANCE                                     */}
      {/* ========================================================================= */}
      {activeSection === 'backup' && (
        <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'ar' ? 'النسخ الاحتياطي وإدارة قاعدة بيانات الأسطول' : 'Data Backup & Database Maintenance'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'حفظ وتصدير نسخة احتياطية آمنة (JSON) من قاعدة بيانات الأسطول والتراخيص، أو استعادتها.'
                  : 'Export or import full JSON database backup.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-800/50 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ar' ? 'تصدير نسخة احتياطية فورية' : 'Export Full Fleet Backup'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? `توليد ملف JSON يحتوي على سجلات كافة الـ ${vehicles.length} سيارة وتواريخ رخصها والإعدادات الحالية.`
                  : 'Download JSON archive containing all vehicle records.'}
              </p>
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تنزيل ملف النسخة الاحتياطية (.json)' : 'Download .JSON Backup'}</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/50 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>{lang === 'ar' ? 'استعادة قاعدة البيانات من ملف' : 'Restore from Backup'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? 'اختر ملف نسخة احتياطية سابق تم تصديره لاستعادة بيانات وتراخيص السيارات.'
                  : 'Upload a previously exported JSON backup file.'}
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-950">
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'رفع واستعادة ملف (.json)' : 'Upload .JSON File'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* System Status Footer */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>منظومة سعودي سوبر ماركت - إدارة رخص أسطول التوصيل (مصر) v3.5 Enterprise</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span className="text-emerald-400 font-bold">{totalVehicles} سيارة توصيل مسجلة</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-bold">{branches.length} فرع نشط</span>
        </div>
      </div>
    </div>
  );
};
