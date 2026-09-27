import React, { useState, useEffect } from 'react';
import { 
  FileSliders, 
  Search, 
  Car, 
  Megaphone, 
  MapPin, 
  ArrowLeftRight, 
  Save, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  FileCheck2,
  Calendar,
  Layers
} from 'lucide-react';
import { Vehicle, UserRole } from '../types';
import { EgyptianTransportPlate } from './common/EgyptianTransportPlate';
import { calculateRemainingDays, getLicenseStatus, formatDateSlash, getStatusTheme } from '../utils/dateUtils';
import { translations, Language } from '../utils/i18n';

interface DataManagementViewProps {
  lang: Language;
  vehicles: Vehicle[];
  branches: string[];
  userRole: UserRole;
  selectedVehicleId?: string | null;
  onUpdateVehicle: (updated: Vehicle) => void;
  onTransferVehicle: (
    vehicle: Vehicle,
    newBranch: string,
    reason: string,
    notes?: string
  ) => void;
  thresholdDays: number;
  referenceDate: string;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  lang,
  vehicles = [],
  branches = [],
  userRole,
  selectedVehicleId,
  onUpdateVehicle,
  onTransferVehicle,
  thresholdDays,
  referenceDate,
}) => {
  const t = translations[lang];

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  // Form states for editing
  const [model, setModel] = useState('');
  const [vehicleNotes, setVehicleNotes] = useState('');

  // Traffic license fields
  const [trafficLicenseNumber, setTrafficLicenseNumber] = useState('');
  const [trafficIssueDate, setTrafficIssueDate] = useState('');
  const [trafficExpiryDate, setTrafficExpiryDate] = useState('');
  const [trafficNotes, setTrafficNotes] = useState('');

  // Commercial license fields
  const [commLicenseNumber, setCommLicenseNumber] = useState('');
  const [commIssueDate, setCommIssueDate] = useState('');
  const [commExpiryDate, setCommExpiryDate] = useState('');
  const [commNotes, setCommNotes] = useState('');

  // Transfer section fields
  const [targetBranch, setTargetBranch] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Feedback banner
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load selected or default vehicle
  useEffect(() => {
    if (selectedVehicleId) {
      const found = (vehicles || []).find((v) => v.id === selectedVehicleId || v.vehicleNumber === selectedVehicleId);
      if (found) {
        selectVehicle(found);
      }
    } else if (vehicles && vehicles.length > 0 && !activeVehicle) {
      // Default to 3119 if exists or first
      const sample = vehicles.find((v) => v.vehicleNumber === '3119') || vehicles[0];
      selectVehicle(sample);
    }
  }, [selectedVehicleId, vehicles]);

  const selectVehicle = (v: Vehicle) => {
    setActiveVehicle(v);
    setSearchQuery(v.vehicleNumber);

    setModel(v.model);
    setVehicleNotes(v.notes || '');

    setTrafficLicenseNumber(v.trafficLicense.licenseNumber || '');
    setTrafficIssueDate(v.trafficLicense.issueDate || '');
    setTrafficExpiryDate(v.trafficLicense.expiryDate || '');
    setTrafficNotes(v.trafficLicense.notes || '');

    setCommLicenseNumber(v.commercialLicense.licenseNumber || '');
    setCommIssueDate(v.commercialLicense.issueDate || '');
    setCommExpiryDate(v.commercialLicense.expiryDate || '');
    setCommNotes(v.commercialLicense.notes || '');

    // Reset transfer
    const nextBranch = (branches || []).find((b) => b !== v.branch) || (branches || [])[0] || 'الرياض';
    setTargetBranch(nextBranch);
    setTransferReason('');
    setTransferNotes('');

    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const match = vehicles.find(
      (v) =>
        v.vehicleNumber.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        v.trafficLicense.licenseNumber.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        v.commercialLicense.licenseNumber.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    if (match) {
      selectVehicle(match);
      setErrorMessage(null);
    } else {
      setErrorMessage(lang === 'ar' ? `لم يتم العثور على سيارة برقم: "${searchQuery}"` : `No vehicle found with: "${searchQuery}"`);
    }
  };

  // Save all vehicle and license modifications
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) return;

    const canEdit = userRole === 'admin' || userRole === 'fleet_manager' || userRole === 'branch_manager';
    if (!canEdit) {
      setErrorMessage(t.permissionDeniedMsg);
      return;
    }

    const updated: Vehicle = {
      ...activeVehicle,
      model,
      notes: vehicleNotes,
      trafficLicense: {
        ...activeVehicle.trafficLicense,
        licenseNumber: trafficLicenseNumber,
        issueDate: trafficIssueDate,
        expiryDate: trafficExpiryDate,
        notes: trafficNotes,
      },
      commercialLicense: {
        ...activeVehicle.commercialLicense,
        licenseNumber: commLicenseNumber,
        issueDate: commIssueDate,
        expiryDate: commExpiryDate,
        notes: commNotes,
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateVehicle(updated);
    setActiveVehicle(updated);
    setSuccessMessage(lang === 'ar' ? 'تم حفظ وتحديث بيانات المركبة والرخص بنجاح!' : 'Vehicle & license details updated successfully!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Perform vehicle transfer
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) return;

    const canTransfer = userRole === 'admin' || userRole === 'fleet_manager';
    if (!canTransfer) {
      setErrorMessage(
        lang === 'ar' 
          ? 'عفواً، تم حجب صلاحية نقل السيارات عن مدير الفرع، ونقل المركبات مقتصر حصراً على مدراء الأسطول والنظام.' 
          : 'Branch transfer is restricted to Fleet Managers and Administrators only.'
      );
      return;
    }

    if (!targetBranch || targetBranch === activeVehicle.branch) {
      setErrorMessage(lang === 'ar' ? 'يرجى اختيار فرع جديد مختلف عن الفرع الحالي.' : 'Please select a new branch different from the current one.');
      return;
    }

    if (!transferReason.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى كتابة سبب النقل لتسجيله في سجل التدقيق.' : 'Please provide a reason for the transfer.');
      return;
    }

    onTransferVehicle(activeVehicle, targetBranch, transferReason, transferNotes);

    const updatedWithNewBranch: Vehicle = {
      ...activeVehicle,
      branch: targetBranch,
      updatedAt: new Date().toISOString(),
    };
    setActiveVehicle(updatedWithNewBranch);

    setSuccessMessage(lang === 'ar' ? `تم نقل السيارة ${activeVehicle.vehicleNumber} إلى فرع ${targetBranch} بنجاح وتسجيل العملية بالسجل.` : `Vehicle transferred to ${targetBranch} successfully.`);
    setTransferReason('');
    setTransferNotes('');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const tDays = activeVehicle ? calculateRemainingDays(activeVehicle.trafficLicense.expiryDate, referenceDate) : 0;
  const tStatus = activeVehicle ? getLicenseStatus(activeVehicle.trafficLicense.expiryDate, thresholdDays, referenceDate) : 'valid';
  const tTheme = getStatusTheme(tStatus);

  const cDays = activeVehicle ? calculateRemainingDays(activeVehicle.commercialLicense.expiryDate, referenceDate) : 0;
  const cStatus = activeVehicle ? getLicenseStatus(activeVehicle.commercialLicense.expiryDate, thresholdDays, referenceDate) : 'valid';
  const cTheme = getStatusTheme(cStatus);

  return (
    <div className="space-y-6 mb-12">
      {/* Title & Unified Concept Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <FileSliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {lang === 'ar' ? 'شاشة إدارة وتعديل البيانات الموحدة' : 'Unified Data Management & Transfer'}
            </h2>
            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? 'مركز متكامل للبحث عن أي مركبة، تعديل بيانات رخصة السير ورخصة الإعلان، ونقل السيارة بين الفروع من مكان واحد.'
                : 'Centralized hub to search any vehicle, update traffic & commercial licenses, and transfer branches.'}
            </p>
          </div>
        </div>

        {/* Quick Search in View */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 rtl:right-3 ltr:left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'مثال: 3119 أو 8212' : 'e.g. 3119 or 8212'}
              className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 pr-9 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            {lang === 'ar' ? 'بحث وجلب' : 'Find Vehicle'}
          </button>
        </form>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {activeVehicle ? (
        <div className="space-y-6">
          {/* 1. Vehicle Profile Card (As specified in prompt) */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/95 to-[#0b101e] border border-white/10 p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <EgyptianTransportPlate
                  vehicleNumber={activeVehicle.vehicleNumber}
                  plateLetters={activeVehicle.plateLetters}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-black text-white">
                      {activeVehicle.plateLetters ? `${activeVehicle.plateLetters} ${activeVehicle.vehicleNumber}` : `سيارة أسطول #${activeVehicle.vehicleNumber}`}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      {activeVehicle.model}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {lang === 'ar' ? `الفرع الحالي: ${activeVehicle.branch}` : `Current Branch: ${activeVehicle.branch}`}
                    </span>
                    <span>•</span>
                    <span>{lang === 'ar' ? 'تاريخ التحديث الأخير:' : 'Updated:'} {formatDateSlash(activeVehicle.updatedAt.slice(0, 10))}</span>
                  </div>
                </div>
              </div>

              {/* Status Summary Pills */}
              <div className="flex items-center gap-2.5">
                <div className="text-center px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs">
                  <div className="text-[10px] text-slate-400">{t.trafficLicenseShort}</div>
                  <div className={`font-bold ${tTheme.text}`}>{lang === 'ar' ? tTheme.labelAr : tTheme.labelEn} ({tDays}د)</div>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs">
                  <div className="text-[10px] text-slate-400">{t.commercialLicenseShort}</div>
                  <div className={`font-bold ${cTheme.text}`}>{lang === 'ar' ? cTheme.labelAr : cTheme.labelEn} ({cDays}د)</div>
                </div>
              </div>
            </div>

            {/* Visual License Summary Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Traffic License Box */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">{t.trafficLicense}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${tTheme.badgeBg}`}>
                    {lang === 'ar' ? tTheme.labelAr : tTheme.labelEn}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div><span className="text-slate-500">رقم الرخصة:</span> <span className="font-mono text-white">{activeVehicle.trafficLicense.licenseNumber}</span></div>
                  <div><span className="text-slate-500">الأيام المتبقية:</span> <span className="font-mono font-bold text-amber-300">{tDays} يوم</span></div>
                  <div><span className="text-slate-500">الإصدار:</span> <span className="font-mono">{formatDateSlash(activeVehicle.trafficLicense.issueDate)}</span></div>
                  <div><span className="text-slate-500">الانتهاء:</span> <span className="font-mono">{formatDateSlash(activeVehicle.trafficLicense.expiryDate)}</span></div>
                </div>
              </div>

              {/* Commercial License Box */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">{t.commercialLicense}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${cTheme.badgeBg}`}>
                    {lang === 'ar' ? cTheme.labelAr : cTheme.labelEn}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div><span className="text-slate-500">رقم الرخصة:</span> <span className="font-mono text-white">{activeVehicle.commercialLicense.licenseNumber}</span></div>
                  <div><span className="text-slate-500">الأيام المتبقية:</span> <span className="font-mono font-bold text-blue-300">{cDays} يوم</span></div>
                  <div><span className="text-slate-500">الإصدار:</span> <span className="font-mono">{formatDateSlash(activeVehicle.commercialLicense.issueDate)}</span></div>
                  <div><span className="text-slate-500">الانتهاء:</span> <span className="font-mono">{formatDateSlash(activeVehicle.commercialLicense.expiryDate)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Unified Edit Form */}
          <form onSubmit={handleSaveAll} className="rounded-2xl bg-gradient-to-b from-slate-900/95 to-[#0b101e] border border-white/10 p-5 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSliders className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ar' ? 'تعديل البيانات وتحديث التواريخ' : 'Edit Vehicle & License Data'}</span>
              </h3>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </button>
            </div>

            {/* Vehicle Base Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t.colModel}
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t.colNotes}
                </label>
                <input
                  type="text"
                  value={vehicleNotes}
                  onChange={(e) => setVehicleNotes(e.target.value)}
                  placeholder={lang === 'ar' ? 'ملاحظات عامة مثل: تجديد فوري، صيانة...' : 'e.g. Urgent renewal, maintenance...'}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Traffic License Edit Section */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Car className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">{lang === 'ar' ? 'بيانات رخصة السير (التسيير)' : 'Traffic Registration License'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-400">{t.colLicenseNum}</label>
                  <input
                    type="text"
                    value={trafficLicenseNumber}
                    onChange={(e) => setTrafficLicenseNumber(e.target.value)}
                    placeholder="مثال: ح 54321 ع"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-400">{t.colIssueDate}</label>
                  <input
                    type="date"
                    value={trafficIssueDate}
                    onChange={(e) => setTrafficIssueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-400">{t.colExpiryDate}</label>
                  <input
                    type="date"
                    value={trafficExpiryDate}
                    onChange={(e) => setTrafficExpiryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-400">{lang === 'ar' ? 'ملاحظات رخصة السير' : 'Traffic License Notes'}</label>
                <input
                  type="text"
                  value={trafficNotes}
                  onChange={(e) => setTrafficNotes(e.target.value)}
                  placeholder={lang === 'ar' ? 'ملاحظات المرور، الفحص الفني، الطفاية...' : 'Traffic inspection, fire extinguisher, etc.'}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Commercial Ad License Edit Section */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-blue-500/30 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Megaphone className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-300">{lang === 'ar' ? 'بيانات رخصة الإعلان' : 'Commercial Advertising License'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-400">{t.colLicenseNum}</label>
                  <input
                    type="text"
                    value={commLicenseNumber}
                    onChange={(e) => setCommLicenseNumber(e.target.value)}
                    placeholder="مثال: ب 12345"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-400">{t.colIssueDate}</label>
                  <input
                    type="date"
                    value={commIssueDate}
                    onChange={(e) => setCommIssueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-400">{t.colExpiryDate}</label>
                  <input
                    type="date"
                    value={commExpiryDate}
                    onChange={(e) => setCommExpiryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-400">{lang === 'ar' ? 'ملاحظات رخصة الإعلان' : 'Commercial Ad Notes'}</label>
                <input
                  type="text"
                  value={commNotes}
                  onChange={(e) => setCommNotes(e.target.value)}
                  placeholder={lang === 'ar' ? 'موافقة المحافظة، الغرفة التجارية، مواصفات الملصق...' : 'Ad permit specs, chamber approval, etc.'}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </button>
            </div>
          </form>

          {/* 3. Transfer Vehicle Section (As requested in prompt section 11) */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/95 to-[#0b101e] border border-amber-500/30 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.transferSectionTitle}</h3>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'ar' ? 'تسجيل حركة نقل رسمية مع حفظ الفرع السابق والجديد وهوية المستخدم بالسجل' : 'Official vehicle relocation with full audit logging'}
                  </span>
                </div>
              </div>
            </div>

            {userRole === 'branch_manager' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>
                  {lang === 'ar'
                    ? 'تنبيه الصلاحيات: تم استبعاد صلاحية نقل السيارات من صلاحيات مدير الفرع. هذا الإجراء متاح فقط لمدير الأسطول وإدارة النظام.'
                    : 'Permission Notice: Vehicle transfer has been restricted from Branch Managers. Only Fleet Managers and Master Admins can transfer vehicles.'}
                </span>
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current Branch */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-400">{t.currentBranch}</label>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/5 text-xs text-amber-300 font-bold flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeVehicle.branch}</span>
                  </div>
                </div>

                {/* Target Branch */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">{t.targetBranch}</label>
                  <select
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    required
                  >
                    {(branches || [])
                      .filter((b) => !activeVehicle || b !== activeVehicle.branch)
                      .map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                  </select>
                </div>

                {/* Transfer Date */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">{t.transferDate}</label>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/5 text-xs text-slate-300 font-mono flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{referenceDate}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">{t.transferReason} *</label>
                  <input
                    type="text"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: تغطية زيادة الطلبات، إعادة توزيع الأسطول...' : 'e.g. Surge demand coverage, route re-allocation...'}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">{t.colNotes}</label>
                  <input
                    type="text"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder={lang === 'ar' ? 'استلام كارت الوقود، فحص العداد...' : 'Fuel card handed over, odometer check...'}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={userRole === 'branch_manager' || userRole === 'viewer'}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-950 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>
                    {userRole === 'branch_manager' 
                      ? (lang === 'ar' ? 'نقل السيارات محجوب عن مدير الفرع' : 'Transfer Disabled for Branch Manager')
                      : t.confirmTransfer}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-white/5">
          {lang === 'ar' ? 'يرجى اختيار أو البحث عن سيارة لإدارتها' : 'Please select or search for a vehicle'}
        </div>
      )}
    </div>
  );
};
