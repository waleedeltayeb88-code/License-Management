import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  MapPin, 
  Store, 
  Car, 
  Search, 
  Calendar, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Vehicle } from '../../types';
import { Language } from '../../utils/i18n';
import { calculateRemainingDays, getLicenseStatus, formatDateWithDayName, DEFAULT_REPORT_DATE } from '../../utils/dateUtils';

interface TransferVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  branches: string[];
  initialVehicleId?: string;
  onTransfer: (vehicleId: string, fromBranch: string, toBranch: string, reason: string, notes: string, date: string) => void;
  onAddBranch?: (branchName: string) => void;
  lang: Language;
  canTransfer?: boolean;
}

export const TransferVehicleModal: React.FC<TransferVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicles = [],
  branches = [],
  initialVehicleId,
  onTransfer,
  onAddBranch,
  canTransfer = true,
}) => {
  // 1. Current Branch Filter state
  const [selectedSourceBranch, setSelectedSourceBranch] = useState<string>('all');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Transfer Details
  const [toBranch, setToBranch] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState<string>('تغطية زيادة طلبات التوصيل المنزلي');
  const [notes, setNotes] = useState<string>('');
  const [showNewBranchInput, setShowNewBranchInput] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState<string>('');

  // Initial vehicle load when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setVehicleSearchQuery('');
    setNotes('');
    setShowNewBranchInput(false);
    setNewBranchName('');
    setTransferDate(new Date().toISOString().slice(0, 10));

    if (initialVehicleId && vehicles.some(v => v.id === initialVehicleId)) {
      const v = vehicles.find(item => item.id === initialVehicleId);
      if (v) {
        setSelectedSourceBranch('all');
        setSelectedVehicleId(v.id);
        return;
      }
    }
    if (vehicles.length > 0) {
      setSelectedSourceBranch('all');
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [isOpen, initialVehicleId]);

  const handleCreateNewBranch = () => {
    const clean = newBranchName.trim();
    if (!clean) return;
    if (onAddBranch) {
      onAddBranch(clean);
    }
    setToBranch(clean);
    setNewBranchName('');
    setShowNewBranchInput(false);
  };

  // Filter vehicles by selected source branch and search query
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (selectedSourceBranch !== 'all' && v.branch !== selectedSourceBranch) {
        return false;
      }
      if (vehicleSearchQuery.trim()) {
        const q = vehicleSearchQuery.trim().toLowerCase();
        const matchNum = v.vehicleNumber.toLowerCase().includes(q);
        const matchLetters = (v.plateLetters || '').toLowerCase().includes(q);
        const matchModel = (v.model || '').toLowerCase().includes(q);
        if (!matchNum && !matchLetters && !matchModel) return false;
      }
      return true;
    });
  }, [vehicles, selectedSourceBranch, vehicleSearchQuery]);

  // Keep selectedVehicleId valid when availableVehicles changes
  useEffect(() => {
    if (availableVehicles.length > 0) {
      if (!availableVehicles.some(v => v.id === selectedVehicleId)) {
        setSelectedVehicleId(availableVehicles[0].id);
      }
    } else {
      setSelectedVehicleId('');
    }
  }, [availableVehicles, selectedVehicleId]);

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Set default target branch different from current branch
  useEffect(() => {
    if (currentVehicle) {
      const targets = branches.filter(b => b !== currentVehicle.branch);
      if (targets.length > 0 && (!toBranch || toBranch === currentVehicle.branch)) {
        setToBranch(targets[0]);
      }
    }
  }, [currentVehicle, branches, toBranch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canTransfer) return;
    if (currentVehicle && toBranch && toBranch !== currentVehicle.branch) {
      onTransfer(
        currentVehicle.id,
        currentVehicle.branch,
        toBranch,
        reason,
        notes,
        transferDate
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#090e1a] border border-amber-500/40 shadow-2xl p-4 sm:p-6 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">نقل سيارة بين فروع سعودي سوبر ماركت</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  مصر 🇪🇬
                </span>
              </div>
              <p className="text-xs text-slate-400">اختر الفرع أولاً لتصفية سياراته، ثم حدد السيارة والفرع المستهدف</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!canTransfer && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div>
              <span className="font-bold block">إشعار صلاحيات: تم إيقاف صلاحية النقل لمدير الفرع</span>
              <span className="text-[11px] text-rose-200/80">نقل السيارات بين الفروع يتطلب صلاحية مدير الأسطول (Fleet Manager) أو مدير النظام (Admin).</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: SELECT SOURCE BRANCH */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-white/10 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-400" />
                <span>الخطوة الأولى: اختر الفرع الحالي للسيارة</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedSourceBranch === 'all' ? 'عرض سيارات كل الفروع' : selectedSourceBranch}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={selectedSourceBranch}
                onChange={(e) => setSelectedSourceBranch(e.target.value)}
                className="w-full bg-[#070b15] border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              >
                <option value="all" className="bg-[#090e1a]">جميع فروع سعودي ({vehicles.length} سيارة)</option>
                {branches.map((b) => {
                  const countInBranch = vehicles.filter(v => v.branch === b).length;
                  return (
                    <option key={b} value={b} className="bg-[#090e1a]">
                      {b} — ({countInBranch} سيارة)
                    </option>
                  );
                })}
              </select>

              {/* Fast quick search within branch */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={vehicleSearchQuery}
                  onChange={(e) => setVehicleSearchQuery(e.target.value)}
                  placeholder="بحث سريع برقم اللوحة (مثال: 3119)..."
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: SELECT VEHICLE */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-400" />
                <span>الخطوة الثانية: حدد سيارة التوصيل المراد نقلها ({availableVehicles.length} متاحة)</span>
              </label>
              {currentVehicle && (
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                  لوحة: {currentVehicle.plateLetters} {currentVehicle.vehicleNumber}
                </span>
              )}
            </div>

            {availableVehicles.length === 0 ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>لا توجد سيارات مطابقة في هذا الفرع. اختر فرعاً آخر أو امسح البحث.</span>
              </div>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-[#070b15] border border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                required
              >
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#090e1a] text-white">
                    لوحة: {v.plateLetters || ''} {v.vehicleNumber} | موديل: {v.model} | الفرع الحالي: {v.branch}
                  </option>
                ))}
              </select>
            )}

            {/* Current Vehicle Snapshot Preview */}
            {currentVehicle && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#060a14] border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[10px] font-mono">
                    EGY 🇪🇬 {currentVehicle.plateLetters} {currentVehicle.vehicleNumber}
                  </span>
                  <span className="text-slate-300 font-medium">{currentVehicle.model}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  الفرع الحالي: <strong className="text-white">{currentVehicle.branch}</strong>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: SELECT TARGET BRANCH & TRANSFER DATE */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-white/10 space-y-3">
            <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>الخطوة الثالثة: الفرع الجديد المستهدف وبيانات النقل</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] text-slate-300 font-semibold">
                    الفرع المستهدف الجديد (سعودي سوبر ماركت)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewBranchInput(prev => !prev)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                  >
                    {showNewBranchInput ? 'إلغاء' : '+ إضافة فرع جديد'}
                  </button>
                </div>
                {showNewBranchInput ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="اكتب اسم الفرع الجديد..."
                      className="w-full bg-[#070b15] border border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewBranch}
                      className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      حفظ الفرع
                    </button>
                  </div>
                ) : (
                  <select
                    value={toBranch}
                    onChange={(e) => setToBranch(e.target.value)}
                    className="w-full bg-[#070b15] border border-cyan-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    required
                  >
                    {branches
                      .filter(b => !currentVehicle || b !== currentVehicle.branch)
                      .map((b) => (
                        <option key={b} value={b} className="bg-[#090e1a]">
                          {b}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">تاريخ النقل والتشغيل الفعلي</label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
                <div className="mt-1 text-[10px] text-cyan-300 font-semibold truncate">
                  {formatDateWithDayName(transferDate)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">سبب النقل</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="تغطية زيادة طلبات التوصيل المنزلي">تغطية زيادة طلبات التوصيل المنزلي</option>
                  <option value="توسعة نطاق توصيل فرع جديد">توسعة نطاق توصيل فرع جديد</option>
                  <option value="استبدال سيارة تحت الصيانة الدورية">استبدال سيارة تحت الصيانة الدورية</option>
                  <option value="إعادة توازن وتوزيع أسطول الفروع">إعادة توازن وتوزيع أسطول الفروع</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">ملاحظات والتسليم بالفرع</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تسليم كارت البنزين، استلام المشرف..."
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 border border-white/10 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!canTransfer || !currentVehicle || !toBranch || toBranch === currentVehicle.branch}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-950/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>
                {!canTransfer 
                  ? 'عملية النقل غير مصرح بها لمدير الفرع'
                  : `تأكيد نقل السيارة إلى ${toBranch || 'الفرع المستهدف'}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
