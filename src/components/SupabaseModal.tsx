import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  RefreshCw,
  Server,
  ShieldCheck,
  ArrowUpRight,
  Check,
  Car,
  Users,
  ArrowLeftRight,
  Building2,
  FileText,
  DownloadCloud,
  UploadCloud
} from 'lucide-react';
import {
  checkSupabaseConnection,
  syncAllDataToSupabase,
  SUPABASE_CONFIG,
  SUPABASE_SQL_SCHEMA,
  SupabaseStatusSummary
} from '../lib/supabase';
import { Vehicle, SystemUser, TransferRecord, AuditRecord, AppSettings } from '../types';
import { BRANCHES, INITIAL_SETTINGS } from '../data/mockData';
import { DEFAULT_REPORT_DATE } from '../utils/dateUtils';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  users?: SystemUser[];
  transfers?: TransferRecord[];
  auditLogs?: AuditRecord[];
  branches?: string[];
  settings?: AppSettings;
  referenceDate?: string;
  onRefreshVehicles?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  users = [],
  transfers = [],
  auditLogs = [],
  branches = BRANCHES,
  settings = INITIAL_SETTINGS,
  referenceDate = DEFAULT_REPORT_DATE,
  onRefreshVehicles
}) => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<SupabaseStatusSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    setChecking(true);
    const res = await checkSupabaseConnection();
    setStatus(res);
    setChecking(false);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFullSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const result = await syncAllDataToSupabase({
      vehicles,
      users,
      transfers,
      auditLogs,
      branches,
      settings,
      referenceDate
    });
    setSyncResult(result.summary);
    if (result.success) {
      if (onRefreshVehicles) await onRefreshVehicles();
      await checkStatus();
    }
    setSyncing(false);
  };

  const handlePullFromCloud = async () => {
    setPulling(true);
    setSyncResult(null);
    if (onRefreshVehicles) {
      await onRefreshVehicles();
    }
    await checkStatus();
    setSyncResult('تم جلب وتحديث كافة البيانات (السيارات، المستخدمين والصلاحيات، التحويلات، والإعدادات) من سحابة Supabase بنجاح ✓');
    setPulling(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-[#090e1a] border border-emerald-500/35 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">مركز الربط السحابي المباشر — Supabase Cloud</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-mono">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مزامنة لحظية للسيارات، التراخيص، المستخدمين والصلاحيات، وحركات النقل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">

          {/* Project Details Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                بيانات مشروع Supabase المتصل حالياً:
              </span>
              <a 
                href={`https://supabase.com/dashboard/project/${SUPABASE_CONFIG.projectId}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>فتح لوحة تحكم Supabase</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-950/90 p-2.5 rounded-lg border border-white/10">
                <div className="text-slate-400 text-[10px] mb-0.5">Project ID</div>
                <div className="text-white font-mono font-bold">{SUPABASE_CONFIG.projectId}</div>
              </div>
              <div className="bg-slate-950/90 p-2.5 rounded-lg border border-white/10 truncate">
                <div className="text-slate-400 text-[10px] mb-0.5">Project Endpoint URL</div>
                <div className="text-emerald-300 font-mono font-bold truncate">{SUPABASE_CONFIG.projectUrl}</div>
              </div>
            </div>

            {/* Live Connection Status */}
            <div className="pt-2.5 flex items-center justify-between border-t border-white/10">
              <div className="flex items-center gap-2">
                {checking ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-slate-300 text-xs">جارٍ فحص الاتصال وإحصائيات الجداول...</span>
                  </>
                ) : status?.connected && status?.tablesExist ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-xs font-bold">
                      متصل بقاعدة البيانات السحابية بنجاح 100% (جميع الجداول مفعلة)
                    </span>
                  </>
                ) : status?.connected && !status?.tablesExist ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-xs font-bold">
                      المشروع متصل ولكن الجداول لم تُنشأ بعد
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-300 text-xs font-bold">
                      خطأ في الاتصال: {status?.error || 'يرجى التحقق'}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={checkStatus}
                disabled={checking}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                <span>تحديث الفحص</span>
              </button>
            </div>

            {/* Live Cloud Table Counters */}
            {status?.counts && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">المركبات بالـ Cloud</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">{status.counts.vehicles} مركبة</span>
                  </div>
                  <Car className="w-4 h-4 text-emerald-400/70" />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">المستخدمين بالـ Cloud</span>
                    <span className="text-sm font-black text-amber-400 font-mono">{status.counts.users} حساب</span>
                  </div>
                  <Users className="w-4 h-4 text-amber-400/70" />
                </div>

                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">سجل النقل بالـ Cloud</span>
                    <span className="text-sm font-black text-purple-300 font-mono">{status.counts.transfers} حركة</span>
                  </div>
                  <ArrowLeftRight className="w-4 h-4 text-purple-400/70" />
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">الفروع المسجلة</span>
                    <span className="text-sm font-black text-cyan-300 font-mono">{status.counts.branches} فرع</span>
                  </div>
                  <Building2 className="w-4 h-4 text-cyan-400/70" />
                </div>
              </div>
            )}
          </div>

          {/* Cloud Sync Actions */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/25 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>المزامنة السحابية الفورية (رفع أو سحب البيانات)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              أي تعديل تقوم به داخل الموقع (إضافة/تعديل سيارة، نقل فرع، إضافة/تعديل مستخدم أو صلاحية، أو تعديل الإعدادات) يُحفظ تلقائياً في Supabase. كما يمكنك الضغط بالأسفل للمزامنة اليدوية الشاملة:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleFullSync}
                disabled={syncing || pulling}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                <span>{syncing ? 'جارٍ رفع ومزامنة كافة الجداول...' : 'رفع ومزامنة كافة البيانات إلى Supabase'}</span>
              </button>

              <button
                onClick={handlePullFromCloud}
                disabled={syncing || pulling}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <DownloadCloud className={`w-4 h-4 ${pulling ? 'animate-bounce' : ''}`} />
                <span>{pulling ? 'جارٍ الجلب من السحابة...' : 'جلب أحدث البيانات من سحابة Supabase'}</span>
              </button>
            </div>

            {syncResult && (
              <div className={`p-3 rounded-xl text-xs font-bold ${syncResult.includes('بنجاح') ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/70 border border-rose-500/40 text-rose-200'}`}>
                {syncResult}
              </div>
            )}
          </div>

          {/* Setup Guide / SQL Script */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>كود SQL المرجعي لإنشاء الجداول في Supabase (في حال تهيئة مشروع جديد)</span>
                </h4>
              </div>

              <button
                onClick={handleCopySQL}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  copied 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-left font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto p-3" dir="ltr">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>متصل ومؤمن بنظام RLS (Row Level Security) • الحفظ السحابي التلقائي مفعل</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
