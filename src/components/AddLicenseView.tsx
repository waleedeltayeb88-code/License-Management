import React, { useState } from 'react';
import { 
  PlusCircle, 
  Car, 
  Megaphone, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  Truck,
  MapPin
} from 'lucide-react';
import { Vehicle, LicenseType, UserRole } from '../types';
import { translations, Language } from '../utils/i18n';

interface AddLicenseViewProps {
  lang: Language;
  vehicles: Vehicle[];
  branches: string[];
  userRole: UserRole;
  onSaveLicense: (data: {
    vehicleId: string;
    branch: string;
    licenseType: LicenseType;
    licenseNumber: string;
    issueDate: string;
    expiryDate: string;
    notes?: string;
    documentUrl?: string;
  }) => void;
}

export const AddLicenseView: React.FC<AddLicenseViewProps> = ({
  lang,
  vehicles,
  branches,
  userRole,
  onSaveLicense,
}) => {
  const t = translations[lang];

  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [branch, setBranch] = useState(vehicles[0]?.branch || branches[0]);
  const [licenseType, setLicenseType] = useState<LicenseType>('traffic'); // Traffic or Commercial ONLY!
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issueDate, setIssueDate] = useState('2025-06-01');
  const [expiryDate, setExpiryDate] = useState('2026-06-01');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const v = vehicles.find((veh) => veh.id === vId);
    if (v) {
      setBranch(v.branch);
    }
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const canEdit = userRole === 'admin' || userRole === 'fleet_manager' || userRole === 'branch_manager';
    if (!canEdit) {
      setError(t.permissionDeniedMsg);
      return;
    }

    if (!selectedVehicleId) {
      setError(lang === 'ar' ? 'يرجى اختيار السيارة' : 'Please select a vehicle');
      return;
    }

    if (!licenseNumber.trim()) {
      setError(lang === 'ar' ? 'يرجى كتابة رقم الرخصة' : 'Please enter license number');
      return;
    }

    if (!issueDate || !expiryDate) {
      setError(lang === 'ar' ? 'يرجى إدخال تاريخ الإصدار والانتهاء' : 'Please enter valid dates');
      return;
    }

    onSaveLicense({
      vehicleId: selectedVehicleId,
      branch,
      licenseType,
      licenseNumber: licenseNumber.trim(),
      issueDate,
      expiryDate,
      notes,
      documentUrl: fileName ? `/docs/${fileName}` : undefined,
    });

    setSuccess(true);
    setError(null);
    setLicenseNumber('');
    setNotes('');
    setFileName(null);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12">
      {/* Header Banner */}
      <div className="flex items-center gap-3.5 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            {lang === 'ar' ? 'إضافة وتجديد رخصة مركبة' : 'Add / Renew Fleet License'}
          </h2>
          <p className="text-xs text-slate-300">
            {lang === 'ar'
              ? 'تسجيل رسمي لرخصة السير (التسيير) أو رخصة الإعلان التجاري مع التحديث الفوري للوحة التحكم والتنبيهات.'
              : 'Register or renew traffic or commercial licenses with instant sync across KPIs and alerts.'}
          </p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{t.licenseSavedSuccess}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-2xl space-y-6">
        {/* Step 1: Vehicle & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.selectVehicle} *</span>
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
              required
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleNumber} — {v.model} ({v.branch})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.selectBranch} *</span>
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
              required
            >
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: License Type Selector (Strictly ONLY Traffic or Commercial) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            {t.selectLicenseType} *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Traffic License Option */}
            <div
              onClick={() => setLicenseType('traffic')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                licenseType === 'traffic'
                  ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-950/40 text-white'
                  : 'bg-slate-800/40 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${licenseType === 'traffic' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{t.trafficLicense}</div>
                <div className="text-[11px] text-slate-400">{lang === 'ar' ? 'تصريح المرور والفحص الفني الرسمي للمركبة' : 'Vehicle registration & traffic permit'}</div>
              </div>
            </div>

            {/* Commercial License Option */}
            <div
              onClick={() => setLicenseType('commercial')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                licenseType === 'commercial'
                  ? 'bg-blue-500/15 border-blue-500 shadow-md shadow-blue-950/40 text-white'
                  : 'bg-slate-800/40 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${licenseType === 'commercial' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{t.commercialLicense}</div>
                <div className="text-[11px] text-slate-400">{lang === 'ar' ? 'تصريح الإعلانات والملصقات التجارية على الصندوق' : 'Commercial cargo advertisement permit'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {t.colLicenseNum} *
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder={licenseType === 'traffic' ? 'مثال: ح 54321 ع' : 'مثال: ب 12345'}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {t.colIssueDate} *
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {t.colExpiryDate} *
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            {t.colNotes}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={lang === 'ar' ? 'ملاحظات المرور، التجديد، أية ملحوظات خاصة...' : 'Any inspection or renewal notes...'}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Upload Document */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            {t.uploadLicensePhoto}
          </label>
          <div className="relative border-2 border-dashed border-white/15 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-colors bg-slate-800/30 group">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileDrop}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-white">
                {fileName ? `تم اختيار الملف: ${fileName}` : t.dragDropPhoto}
              </div>
              <p className="text-[11px] text-slate-400">PNG, JPG, PDF (Max 10MB)</p>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حفظ وتسجيل الرخصة' : 'Save License'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
