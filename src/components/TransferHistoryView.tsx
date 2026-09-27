import React, { useState } from 'react';
import { ArrowLeftRight, Search, MapPin, Calendar, Clock, User, FileText } from 'lucide-react';
import { TransferRecord } from '../types';
import { translations, Language } from '../utils/i18n';
import { formatDateWithDayName } from '../utils/dateUtils';

interface TransferHistoryViewProps {
  lang: Language;
  transfers: TransferRecord[];
  onSelectVehicleNumber: (vehicleNum: string) => void;
  onInitiateTransfer?: () => void;
}

export const TransferHistoryView: React.FC<TransferHistoryViewProps> = ({
  lang,
  transfers = [],
  onSelectVehicleNumber,
  onInitiateTransfer,
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');

  const filtered = (transfers || []).filter((tr) =>
    (tr.vehicleNumber || '').includes(search) ||
    (tr.fromBranch || '').includes(search) ||
    (tr.toBranch || '').includes(search) ||
    (tr.transferredBy || '').includes(search) ||
    (tr.reason && tr.reason.includes(search))
  );

  return (
    <div className="space-y-6 mb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {lang === 'ar' ? 'سجل حركة ونقل السيارات بين الفروع' : 'Vehicle Transfer & Relocation History'}
            </h2>
            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? 'توثيق رسمي لجميع حركات نقل مركبات الأسطول مع تسجيل الفروع والمسؤولين والأسباب.'
                : 'Complete historical logs of vehicle transfers between company branch locations.'}
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {onInitiateTransfer && (
            <button
              onClick={onInitiateTransfer}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'نقل مركبة الآن' : 'Transfer Vehicle'}</span>
            </button>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 rtl:right-3 ltr:left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث برقم السيارة أو الفرع...' : 'Search vehicle or branch...'}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 pr-9 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3"
            />
          </div>
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right rtl:text-right ltr:text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-white/10 font-bold uppercase">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">{t.colVehicleNum}</th>
                <th className="py-3 px-4">{t.currentBranch} (السابق)</th>
                <th className="py-3 px-4">{t.targetBranch} (الجديد)</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'تاريخ ووقت النقل' : 'Date & Time'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'المسؤول القائم بالنقل' : 'Transferred By'}</th>
                <th className="py-3 px-4">{t.transferReason}</th>
                <th className="py-3 px-4">{t.colNotes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {lang === 'ar' ? 'لا توجد سجلات نقل مطابقة' : 'No transfer records found'}
                  </td>
                </tr>
              ) : (
                filtered.map((record, idx) => (
                  <tr key={record.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectVehicleNumber(record.vehicleNumber)}
                        className="font-mono font-bold text-amber-400 hover:text-amber-300 hover:underline px-2 py-0.5 rounded bg-slate-800/80 border border-white/5"
                      >
                        {record.vehicleNumber}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5 text-rose-300">
                        <MapPin className="w-3.5 h-3.5 opacity-60" />
                        <span>{record.fromBranch}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{record.toBranch}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                      <div>{formatDateWithDayName(record.date)}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{record.time}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400/80" />
                        <span>{record.transferredBy}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {record.reason}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {record.notes || '—'}
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
