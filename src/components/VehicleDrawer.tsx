import React from 'react';
import { 
  X, 
  Car, 
  Megaphone, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  History, 
  Edit3, 
  QrCode, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Vehicle, TransferRecord, AuditRecord } from '../types';
import { EgyptianTransportPlate } from './common/EgyptianTransportPlate';
import { calculateRemainingDays, getLicenseStatus, formatDateSlash, formatDateWithDayName, getStatusTheme } from '../utils/dateUtils';
import { translations, Language } from '../utils/i18n';

interface VehicleDrawerProps {
  lang: Language;
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onManageData?: (vehicle: Vehicle) => void;
  transferRecords: TransferRecord[];
  auditRecords: AuditRecord[];
  thresholdDays: number;
  referenceDate: string;
}

export const VehicleDrawer: React.FC<VehicleDrawerProps> = ({
  lang,
  vehicle,
  isOpen,
  onClose,
  onManageData,
  transferRecords = [],
  auditRecords = [],
  thresholdDays,
  referenceDate,
}) => {
  if (!isOpen || !vehicle) return null;

  const t = translations[lang];

  // Calculate statuses
  const rawTDays = calculateRemainingDays(vehicle.trafficLicense.expiryDate, referenceDate);
  const tDays = isNaN(rawTDays) ? 0 : rawTDays;
  const tStatus = getLicenseStatus(vehicle.trafficLicense.expiryDate, thresholdDays, referenceDate);
  const tTheme = getStatusTheme(tStatus);

  const rawCDays = calculateRemainingDays(vehicle.commercialLicense.expiryDate, referenceDate);
  const cDays = isNaN(rawCDays) ? 0 : rawCDays;
  const cStatus = getLicenseStatus(vehicle.commercialLicense.expiryDate, thresholdDays, referenceDate);
  const cTheme = getStatusTheme(cStatus);

  const isOverallValid = tStatus === 'valid' && cStatus === 'valid';
  const hasExpired = tStatus === 'expired' || cStatus === 'expired';

  // Filter transfers and audits for this vehicle
  const vehicleTransfers = (transferRecords || []).filter((r) => r.vehicleNumber === vehicle.vehicleNumber);
  const vehicleAudits = (auditRecords || []).filter((r) => r.vehicleNumber === vehicle.vehicleNumber);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-out panel */}
      <div className="w-full max-w-2xl bg-[#090d16] border-l rtl:border-l-0 rtl:border-r border-white/10 shadow-2xl h-full flex flex-col overflow-hidden text-right rtl:text-right ltr:text-left animate-in slide-in-from-right rtl:slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <EgyptianTransportPlate
              vehicleNumber={vehicle.vehicleNumber}
              plateLetters={vehicle.plateLetters}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {vehicle.plateLetters ? `${vehicle.plateLetters} ${vehicle.vehicleNumber}` : `سيارة أسطول #${vehicle.vehicleNumber}`}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  hasExpired 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : isOverallValid 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {hasExpired ? (lang === 'ar' ? 'تنبيه: رخصة منتهية' : 'Expired License') : isOverallValid ? (lang === 'ar' ? 'جاهزية كاملة' : 'Compliant') : (lang === 'ar' ? 'متابعة قريبة' : 'Attention')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>{vehicle.model}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {vehicle.branch}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: إدارة البيانات */}
        <div className="p-4 bg-slate-900/40 border-b border-white/5 flex items-center justify-between">
          {onManageData ? (
            <>
              <span className="text-xs text-slate-400">
                {lang === 'ar' ? 'لتعديل البيانات أو تجديد الرخص أو نقل الفرع:' : 'To edit data, renew licenses, or transfer branch:'}
              </span>
              <button
                onClick={() => {
                  onClose();
                  onManageData(vehicle);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-950 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إدارة البيانات الموحدة' : 'Unified Data Management'}</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-600/30 text-xs text-slate-300 font-bold">
              <span>👁️ وضع المشاهدة والتدقيق (للقراءة والاطلاع فقط)</span>
              <span className="text-[10px] text-slate-400">غير مصرح بالتعديل لهذا الدور</span>
            </div>
          )}
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: License Overview */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'موقف الرخص الحالي' : 'Current License Overview'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Traffic License Card */}
              <div className="rounded-xl bg-slate-900/90 border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                      <Car className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{t.trafficLicense}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${tTheme.badgeBg}`}>
                    {lang === 'ar' ? tTheme.labelAr : tTheme.labelEn}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{t.colLicenseNum}:</span>
                    <span className="font-mono text-white font-semibold">{vehicle.trafficLicense.licenseNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t.colIssueDate}:</span>
                    <span className="font-semibold text-slate-200">{formatDateWithDayName(vehicle.trafficLicense.issueDate)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t.colExpiryDate}:</span>
                    <span className="font-bold text-white bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                      {formatDateWithDayName(vehicle.trafficLicense.expiryDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-white/5">
                    <span>{t.colDaysLeft}:</span>
                    <span className={`font-mono font-bold ${tDays < 0 ? 'text-rose-400' : tDays <= thresholdDays ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {tDays} {lang === 'ar' ? 'يوم' : 'days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commercial License Card */}
              <div className="rounded-xl bg-slate-900/90 border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{t.commercialLicense}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${cTheme.badgeBg}`}>
                    {lang === 'ar' ? cTheme.labelAr : cTheme.labelEn}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{t.colLicenseNum}:</span>
                    <span className="font-mono text-white font-semibold">{vehicle.commercialLicense.licenseNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t.colIssueDate}:</span>
                    <span className="font-semibold text-slate-200">{formatDateWithDayName(vehicle.commercialLicense.issueDate)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t.colExpiryDate}:</span>
                    <span className="font-bold text-white bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                      {formatDateWithDayName(vehicle.commercialLicense.expiryDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-white/5">
                    <span>{t.colDaysLeft}:</span>
                    <span className={`font-mono font-bold ${cDays < 0 ? 'text-rose-400' : cDays <= thresholdDays ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {cDays} {lang === 'ar' ? 'يوم' : 'days'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Documents & Official Digital Cards */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'الوثائق وبطاقات الترخيص الرقمية' : 'Digital License Documents'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Traffic Card Representation */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-md relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase">{lang === 'ar' ? 'جمهورية مصر العربية - وزارة الداخلية' : 'Official Traffic Authority'}</div>
                    <div className="text-xs font-bold text-white">{lang === 'ar' ? 'رخصة تسيير مركبة نقل خفيف' : 'Vehicle Registration Card'}</div>
                  </div>
                  <QrCode className="w-7 h-7 text-amber-400/80" />
                </div>
                <div className="mt-3 pt-2 border-t border-amber-500/20 text-[11px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>رقم اللوحة:</span>
                    <span className="font-mono font-bold text-amber-300">{vehicle.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رقم الرخصة:</span>
                    <span className="font-mono text-slate-200">{vehicle.trafficLicense.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاريخ الانتهاء:</span>
                    <span className="font-mono text-slate-200">{formatDateSlash(vehicle.trafficLicense.expiryDate)}</span>
                  </div>
                </div>
              </div>

              {/* Commercial Ad Card Representation */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-blue-500/30 shadow-md relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase">{lang === 'ar' ? 'إدارة الإعلانات والتنسيق التجاري' : 'Commercial Advertising Dept'}</div>
                    <div className="text-xs font-bold text-white">{lang === 'ar' ? 'تصريح ملصقات إعلانية على المركبة' : 'Commercial Ad Permit Card'}</div>
                  </div>
                  <QrCode className="w-7 h-7 text-blue-400/80" />
                </div>
                <div className="mt-3 pt-2 border-t border-blue-500/20 text-[11px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>رقم المركبة:</span>
                    <span className="font-mono font-bold text-blue-300">{vehicle.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رقم التصريح:</span>
                    <span className="font-mono text-slate-200">{vehicle.commercialLicense.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاريخ الانتهاء:</span>
                    <span className="font-mono text-slate-200">{formatDateSlash(vehicle.commercialLicense.expiryDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Activity Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>{t.activityTimeline}</span>
            </h3>

            <div className="space-y-3 relative before:absolute before:inset-0 before:right-3.5 rtl:before:right-3.5 ltr:before:left-3.5 before:w-0.5 before:bg-slate-800">
              {vehicleTransfers.length === 0 && vehicleAudits.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 text-xs text-slate-500">
                  {lang === 'ar' ? 'لا توجد حركات سابقة مسجلة لهذه المركبة' : 'No recorded activity for this vehicle'}
                </div>
              ) : (
                <>
                  {vehicleTransfers.map((tr) => (
                    <div key={tr.id} className="relative flex items-start gap-3 text-xs pr-7 rtl:pr-7 ltr:pl-7">
                      <span className="absolute right-2 rtl:right-2 ltr:left-2 top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-[#090d16]" />
                      <div className="flex-1 p-3 rounded-xl bg-slate-900/90 border border-white/5">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                          <span className="font-semibold text-amber-400">{lang === 'ar' ? 'حركة نقل فرع' : 'Branch Transfer'}</span>
                          <span>{tr.date} {tr.time}</span>
                        </div>
                        <div className="text-white font-medium">
                          من فرع <span className="text-amber-300">{tr.fromBranch}</span> إلى فرع <span className="text-amber-300">{tr.toBranch}</span>
                        </div>
                        {tr.reason && <p className="text-[11px] text-slate-400 mt-1">السبب: {tr.reason}</p>}
                        <div className="text-[10px] text-slate-500 mt-1">بواسطة: {tr.transferredBy}</div>
                      </div>
                    </div>
                  ))}

                  {vehicleAudits.map((aud) => (
                    <div key={aud.id} className="relative flex items-start gap-3 text-xs pr-7 rtl:pr-7 ltr:pl-7">
                      <span className="absolute right-2 rtl:right-2 ltr:left-2 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#090d16]" />
                      <div className="flex-1 p-3 rounded-xl bg-slate-900/90 border border-white/5">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                          <span className="font-semibold text-blue-400">{aud.action}</span>
                          <span>{aud.date} {aud.time}</span>
                        </div>
                        <div className="text-slate-300">
                          {aud.oldValue} &larr; <span className="text-white font-bold">{aud.newValue}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">المستخدم: {aud.user}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
