import React, { useState } from 'react';
import { History, Search, ShieldCheck, User, Calendar, Clock, Car } from 'lucide-react';
import { AuditRecord } from '../types';
import { translations, Language } from '../utils/i18n';
import { formatDateWithDayName } from '../utils/dateUtils';

interface AuditLogViewProps {
  lang: Language;
  auditRecords: AuditRecord[];
  onSelectVehicleNumber: (vehicleNum: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  lang,
  auditRecords = [],
  onSelectVehicleNumber,
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filtered = (auditRecords || []).filter((record) => {
    const matchesSearch =
      (record.vehicleNumber || '').includes(search) ||
      (record.user || '').includes(search) ||
      (record.action || '').includes(search) ||
      (record.oldValue || '').includes(search) ||
      (record.newValue || '').includes(search);

    const matchesAction = filterAction === 'all' || record.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 mb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {t.navAuditLog}
            </h2>
            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? 'سجل غير قابل للتعديل يوثق بدقة كافة العمليات، التعديلات، الحركات، وتاريخ ونقل التراخيص بالأسطول.'
                : 'Immutable enterprise audit trail recording all changes, license renewals, and transfers.'}
            </p>
          </div>
        </div>

        {/* Search & Action Filter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute right-3 rtl:right-3 ltr:left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث برقم السيارة أو المستخدم...' : 'Search vehicle or user...'}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 pr-9 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">{lang === 'ar' ? 'جميع الحركات' : 'All Actions'}</option>
            <option value="نقل فرع">{lang === 'ar' ? 'نقل فرع' : 'Branch Transfer'}</option>
            <option value="تجديد رخصة">{lang === 'ar' ? 'تجديد رخصة' : 'Renew License'}</option>
            <option value="تعديل بيانات">{lang === 'ar' ? 'تعديل بيانات' : 'Edit Data'}</option>
            <option value="إضافة رخصة">{lang === 'ar' ? 'إضافة رخصة' : 'Add License'}</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right rtl:text-right ltr:text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-white/10 font-bold uppercase">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">{t.colVehicleNum}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'نوع الحركة' : 'Action Type'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'القيمة السابقة' : 'Old Value'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'القيمة الجديدة' : 'New Value'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'التاريخ والوقت' : 'Timestamp'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    {lang === 'ar' ? 'لا توجد حركات مسجلة' : 'No audit records found'}
                  </td>
                </tr>
              ) : (
                filtered.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectVehicleNumber(log.vehicleNumber)}
                        className="font-mono font-bold text-amber-400 hover:text-amber-300 hover:underline px-2 py-0.5 rounded bg-slate-800/80 border border-white/5"
                      >
                        {log.vehicleNumber}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono max-w-xs truncate">
                      {log.oldValue || '—'}
                    </td>
                    <td className="py-3 px-4 text-emerald-300 font-mono font-medium max-w-xs truncate">
                      {log.newValue}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{log.user}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                      <div>{formatDateWithDayName(log.date)}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{log.time}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
