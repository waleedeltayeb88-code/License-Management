import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, ExternalLink, RefreshCw, Server, ShieldCheck, ArrowUpRight, Check } from 'lucide-react';
import { 
  checkSupabaseConnection, 
  seedVehiclesToSupabase, 
  SUPABASE_CONFIG, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';
import { Vehicle } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onRefreshVehicles?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onRefreshVehicles
}) => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{ connected: boolean; tablesExist: boolean; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    setChecking(true);
    setSyncResult(null);
    const res = await checkSupabaseConnection();
    setStatus(res);
    setChecking(false);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncVehicles = async () => {
    setSyncing(true);
    setSyncResult(null);
    const result = await seedVehiclesToSupabase(vehicles);
    if (result.success) {
      setSyncResult(`تم رفع ومزامنة ${result.count} مركبة بنجاح إلى جدول vehicles في Supabase! 🎉`);
      if (onRefreshVehicles) onRefreshVehicles();
      // Recheck status
      await checkStatus();
    } else {
      setSyncResult('فشلت المزامنة: يرجى التأكد من تشغيل كود SQL أولاً في Supabase SQL Editor.');
    }
    setSyncing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">إعداد والربط مع قاعدة بيانات Supabase</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-mono">
                  PostgreSQL Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تكامل مباشر وحفظ سحابي لأسطول ورخص سعودي سوبر ماركت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">

          {/* Project Details Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                بيانات المشروع المتصل:
              </span>
              <a 
                href={`https://supabase.com/dashboard/project/${SUPABASE_CONFIG.projectId}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>فتح لوحة Supabase</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/40">
                <div className="text-slate-400 text-[10px] mb-0.5">Project ID</div>
                <div className="text-white font-mono font-medium">{SUPABASE_CONFIG.projectId}</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/40 truncate">
                <div className="text-slate-400 text-[10px] mb-0.5">Project URL</div>
                <div className="text-white font-mono font-medium truncate">{SUPABASE_CONFIG.projectUrl}</div>
              </div>
            </div>

            {/* Live Connection Status */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-700/40">
              <div className="flex items-center gap-2">
                {checking ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-slate-300 text-xs">جارٍ فحص الاتصال بقاعدة البيانات...</span>
                  </>
                ) : status?.connected && status?.tablesExist ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-xs font-medium">
                      متصل بنجاح وجاهز (الجداول منشأة ومتاحة)
                    </span>
                  </>
                ) : status?.connected && !status?.tablesExist ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-xs font-medium">
                      المشروع متصل ولكن الجداول لم تُنشأ بعد
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-300 text-xs">
                      خطأ في الاتصال: {status?.error || 'يرجى التحقق'}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={checkStatus}
                disabled={checking}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
                <span>إعادة الفحص</span>
              </button>
            </div>
          </div>

          {/* Setup Guide / Step 1: SQL Script */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                  كود SQL لإنشاء الجداول في Supabase
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  انسخ هذا الكود والصقه في <strong>SQL Editor</strong> داخل لوحة تحكم Supabase واضغط <strong>Run</strong>.
                </p>
              </div>

              <button
                onClick={handleCopySQL}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  copied 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-left font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto p-3" dir="ltr">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>

          {/* Step 2: Seed / Sync Data */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
              مزامنة ورفع سيارات الأسطول الحالية إلى Supabase
            </h4>
            <p className="text-xs text-slate-400">
              بعد تشغيل كود SQL أعلاه، اضغط الزر بالأسفل لرفع جميع سيارات الأسطول ({vehicles.length} مركبة ورخصة) مباشرة إلى قاعدة البيانات السحابية:
            </p>

            <button
              onClick={handleSyncVehicles}
              disabled={syncing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'جارٍ رفع ومزامنة السيارات...' : `رفع ومزامنة ${vehicles.length} مركبة إلى Supabase الآن`}</span>
            </button>

            {syncResult && (
              <div className={`p-3 rounded-lg text-xs ${syncResult.includes('بنجاح') ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'}`}>
                {syncResult}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>الاتصال محمي بنظام RLS (Row Level Security)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
