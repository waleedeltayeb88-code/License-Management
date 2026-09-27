import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  Download,
  Check,
  ShieldCheck,
  Sparkles,
  Loader2,
  FileText,
  AlertTriangle,
  Building2,
  Layers,
  ChevronDown,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { exportVehiclesToExcel } from '../../utils/exportUtils';
import { generateFleetPdf } from '../../utils/pdfExport';
import { Language } from '../../utils/i18n';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  thresholdDays: number;
  referenceDate: string;
  lang: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  vehicles = [],
  thresholdDays,
  referenceDate,
}) => {
  // Export modes
  const [activeTab, setActiveTab] = useState<'pdf' | 'excel'>('pdf');

  // Excel state
  const [isExcelExporting, setIsExcelExporting] = useState(false);
  const [excelSuccess, setExcelSuccess] = useState(false);

  // PDF state
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 0,
    message: '',
  });
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<{ url: string; filename: string; pages: number } | null>(null);

  // PDF configuration options
  const [pdfScope, setPdfScope] = useState<'all' | 'urgent'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  if (!isOpen) return null;

  // Extract unique branches from vehicles
  const availableBranches = Array.from(new Set(vehicles.map((v) => v.branch).filter(Boolean))).sort();

  // Filter count preview
  const previewCount = vehicles.filter((v) => {
    if (selectedBranch !== 'all' && v.branch !== selectedBranch) return false;
    return true;
  }).length;

  // ==========================================
  // EXCEL EXPORT HANDLER
  // ==========================================
  const handleExcelExport = async () => {
    try {
      setIsExcelExporting(true);
      const targetVehicles = selectedBranch === 'all' ? vehicles : vehicles.filter((v) => v.branch === selectedBranch);

      await exportVehiclesToExcel(
        targetVehicles,
        thresholdDays,
        referenceDate,
        `سعودي_سوبر_ماركت_تقرير_الأسطول_والرخص_${referenceDate}.xlsx`,
        {
          reportTitle: 'التقرير التنفيذي الشامل للرخص وتصاريح الإعلانات لأسطول سعودي سوبر ماركت',
        }
      );

      setExcelSuccess(true);
      setTimeout(() => {
        setExcelSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Excel Export failed:', err);
    } finally {
      setIsExcelExporting(false);
    }
  };

  // ==========================================
  // PDF EXPORT HANDLER
  // ==========================================
  const handlePdfExport = async () => {
    try {
      setIsPdfExporting(true);
      setPdfSuccess(false);
      setGeneratedPdfBlob(null);

      const targetVehicles = selectedBranch === 'all' ? vehicles : vehicles.filter((v) => v.branch === selectedBranch);

      const result = await generateFleetPdf(targetVehicles, {
        reportTitle:
          pdfScope === 'urgent'
            ? 'تقرير التنبيهات العاجلة والرخص المنتهية لأسطول سعودي'
            : 'التقرير الإداري التنفيذي الشامل لتراخيص أسطول سعودي سوبر ماركت',
        reportSubtitle: 'الإدارة العامة للخدمات اللوجستية والحركة — كشف الامتثال المعتمد',
        reportType: pdfScope,
        branchFilter: selectedBranch,
        thresholdDays,
        referenceDate,
        onProgress: (current, total, message) => {
          setPdfProgress({ current, total, message });
        },
      });

      // Create downloadable URL
      const fileUrl = URL.createObjectURL(result.blob);
      setGeneratedPdfBlob({ url: fileUrl, filename: result.filename, pages: result.pageCount });
      setPdfSuccess(true);

      // Trigger automatic instant download
      const downloadLink = document.createElement('a');
      downloadLink.href = fileUrl;
      downloadLink.download = result.filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('PDF Export failed:', err);
    } finally {
      setIsPdfExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#090e1a] border border-emerald-500/40 shadow-2xl overflow-hidden text-right">
        {/* Top Decorative Emerald Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-white/10 bg-[#0c1424]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-700/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">تصدير التقارير الرسمية للأسطول</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  سعودي 1938 🇪🇬
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توليد مستندات معتمدة عالية الدقة لإدارة الحركة والفروع والشؤون الإدارية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: PDF vs EXCEL */}
        <div className="p-5 pb-0">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#070b13] border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950 border border-emerald-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>تقرير PDF تنفيذي فاخر (A4)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                VIP
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950 border border-emerald-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>شيت إكسل رسمي (.xlsx)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                مبوب
              </span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* Active Fleet Metadata Card */}
          <div className="p-3.5 rounded-xl bg-[#0e172a] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">السيارات المحددة للتصدير:</span>
              <span className="font-bold text-white font-mono bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded">
                {previewCount} سيارة
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              تاريخ المراجعة: <span className="font-mono text-amber-300 font-bold">{referenceDate}</span>
            </div>
          </div>

          {/* TAB 1: PDF EXPORT */}
          {activeTab === 'pdf' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Scope Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نوع ومحتوى تقرير الـ PDF:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfScope('all')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      pdfScope === 'all'
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-white shadow-sm'
                        : 'bg-[#0a101f] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">التقرير التنفيذي الشامل</span>
                      {pdfScope === 'all' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10.5px] text-slate-300">
                      غلاف ملون + مؤشرات KPI + كشوفات الـ {vehicles.length} سيارة مقسمة على صفحات A4
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfScope('urgent')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      pdfScope === 'urgent'
                        ? 'bg-rose-950/50 border-rose-500/60 text-white shadow-sm'
                        : 'bg-[#0a101f] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-rose-300">الرخص العاجلة والمنتهية فقط</span>
                      {pdfScope === 'urgent' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <div className="text-[10.5px] text-slate-300">
                      حصر فوري للمركبات ذات الرخص المنتهية أو التي توشك على الانتهاء لسرعة التجديد
                    </div>
                  </button>
                </div>
              </div>

              {/* Branch Filter Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  تصفية حسب الفرع (اختياري):
                </label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-[#0a101f] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">جميع فروع ومواقع الشركة ({vehicles.length} سيارة)</option>
                    {availableBranches.map((b) => (
                      <option key={b} value={b}>
                        فرع {b} ({vehicles.filter((v) => v.branch === b).length} سيارة)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* PDF Features Preview Highlights */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-900 border border-emerald-500/30 text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>مواصفات التقرير التنفيذي المولد:</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10.5px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400">✓</span> طباعة ملونة A4 فاخرة معتمدة
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400">✓</span> رخص السير والإعلانات جنب إلى جنب
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400">✓</span> شارات ملونة للحالة (سارية/منتهية)
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400">✓</span> أختام وتوقيعات الإدارة والباركود
                  </div>
                </div>
              </div>

              {/* Progress Bar (during generation) */}
              {isPdfExporting && (
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-emerald-500/50 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-bold flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      {pdfProgress.message || 'جاري تجهيز مستند الـ PDF عالي الدقة...'}
                    </span>
                    {pdfProgress.total > 0 && (
                      <span className="text-amber-300 font-mono font-bold">
                        {Math.round((pdfProgress.current / pdfProgress.total) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${pdfProgress.total > 0 ? (pdfProgress.current / pdfProgress.total) * 100 : 15}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Success Banner and Quick Action Links */}
              {pdfSuccess && generatedPdfBlob && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-between text-xs animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>تم إنشاء وتحميل ملف الـ PDF بنجاح ({generatedPdfBlob.pages} صفحة ملونة)!</span>
                  </div>
                  <a
                    href={generatedPdfBlob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    معاينة / فتح
                  </a>
                </div>
              )}

              {/* Action Button: Generate PDF */}
              <button
                type="button"
                disabled={isPdfExporting}
                onClick={handlePdfExport}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 border border-emerald-400/40 cursor-pointer disabled:opacity-60 transition-all active:scale-[0.99]"
              >
                {isPdfExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري توليد ملف الـ PDF عالي الجودة...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>توليد وتنزيل تقرير PDF الملون فوراَ (A4)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: EXCEL EXPORT */}
          {activeTab === 'excel' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Branch Filter Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  تصفية الفرع لشيت الإكسل:
                </label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-[#0a101f] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">جميع فروع ومواقع الشركة ({vehicles.length} سيارة)</option>
                    {availableBranches.map((b) => (
                      <option key={b} value={b}>
                        فرع {b} ({vehicles.filter((v) => v.branch === b).length} سيارة)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Excel Details */}
              <div className="p-3.5 rounded-xl bg-[#0a1122] border border-white/10 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>محتويات مصنف إكسل المعتمد (.XLSX):</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                  <li><b className="text-white">الشيت 1:</b> كشف الأسطول التفصيلي (المرور + الإعلانات + الشاسيه) مع شارات الألوان.</li>
                  <li><b className="text-white">الشيت 2:</b> تقرير الإجراءات العاجلة والرخص المنتهية أو الوشيكة للتجديد.</li>
                  <li><b className="text-white">الشيت 3:</b> إحصائيات ومؤشرات توزيع الفروع ونسب الالتزام.</li>
                </ul>
              </div>

              {/* Action Button: Generate Excel */}
              <button
                type="button"
                disabled={isExcelExporting}
                onClick={handleExcelExport}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 border border-emerald-400/40 cursor-pointer disabled:opacity-60 transition-all active:scale-[0.99]"
              >
                {isExcelExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تصدير شيت الإكسل...</span>
                  </>
                ) : excelSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>تم تصدير ملف الإكسل بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-300" />
                    <span>تنزيل مصنف إكسل الملون (.XLSX)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#070c17] flex justify-between items-center">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>منظومة تراخيص أسطول سعودي سوبر ماركت — وثيقة رقمية معتمدة</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
