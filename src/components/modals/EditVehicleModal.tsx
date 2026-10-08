import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Save, 
  Car, 
  Megaphone, 
  FileEdit, 
  Store, 
  Calendar, 
  ShieldCheck, 
  Search,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2
} from 'lucide-react';
import { Vehicle } from '../../types';
import { Language } from '../../utils/i18n';
import { formatDateWithDayName } from '../../utils/dateUtils';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  branches: string[];
  initialVehicleId?: string;
  onSave: (updatedVehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
  onAddBranch?: (branchName: string) => void;
  canDelete?: boolean;
  lang: Language;
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicles = [],
  branches = [],
  initialVehicleId,
  onSave,
  onDelete,
  onAddBranch,
  canDelete = false,
}) => {
  // Step 1: Branch Filter & Search
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [formData, setFormData] = useState<Vehicle | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [showNewBranchInput, setShowNewBranchInput] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState<string>('');

  // Initialize selected vehicle whenever modal opens or initialVehicleId changes
  useEffect(() => {
    if (!isOpen) return;
    setVehicleSearchQuery('');
    setConfirmDelete(false);
    setShowNewBranchInput(false);
    setNewBranchName('');

    if (initialVehicleId && vehicles.some(v => v.id === initialVehicleId)) {
      const found = vehicles.find(v => v.id === initialVehicleId);
      if (found) {
        setSelectedBranchFilter('all');
        setSelectedId(found.id);
        setFormData(JSON.parse(JSON.stringify(found)));
        return;
      }
    }
    if (vehicles.length > 0) {
      const first = vehicles[0];
      setSelectedBranchFilter('all');
      setSelectedId(first.id);
      setFormData(JSON.parse(JSON.stringify(first)));
    }
  }, [isOpen, initialVehicleId]);

  // Filter vehicles based on branch selector and search query
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (selectedBranchFilter !== 'all' && v.branch !== selectedBranchFilter) {
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
  }, [vehicles, selectedBranchFilter, vehicleSearchQuery]);

  // Update selectedId if current selection is not in filtered list
  useEffect(() => {
    if (!isOpen) return;
    if (filteredVehicles.length > 0) {
      if (!filteredVehicles.some(v => v.id === selectedId)) {
        const nextV = filteredVehicles[0];
        setSelectedId(nextV.id);
        setFormData(JSON.parse(JSON.stringify(nextV)));
      }
    } else {
      setSelectedId('');
      setFormData(null);
    }
  }, [filteredVehicles, selectedId, isOpen]);

  // Sync formData when user explicitly changes selectedId
  const handleSelectVehicleChange = (newId: string) => {
    setSelectedId(newId);
    setConfirmDelete(false);
    const current = vehicles.find(v => v.id === newId);
    if (current) {
      setFormData(JSON.parse(JSON.stringify(current)));
    }
  };

  // Quick date helpers for instant license renewal (+1 Year / +6 Months)
  const handleQuickRenewTraffic = (monthsToAdd: number) => {
    if (!formData) return;
    const today = new Date();
    const issueStr = today.toISOString().slice(0, 10);
    const exp = new Date(today);
    exp.setMonth(exp.getMonth() + monthsToAdd);
    const expStr = exp.toISOString().slice(0, 10);
    setFormData({
      ...formData,
      trafficLicense: {
        ...formData.trafficLicense,
        issueDate: issueStr,
        expiryDate: expStr,
      }
    });
  };

  const handleQuickRenewCommercial = (monthsToAdd: number) => {
    if (!formData) return;
    const today = new Date();
    const issueStr = today.toISOString().slice(0, 10);
    const exp = new Date(today);
    exp.setMonth(exp.getMonth() + monthsToAdd);
    const expStr = exp.toISOString().slice(0, 10);
    setFormData({
      ...formData,
      commercialLicense: {
        ...formData.commercialLicense,
        issueDate: issueStr,
        expiryDate: expStr,
      }
    });
  };

  const handleCreateNewBranch = () => {
    const clean = newBranchName.trim();
    if (!clean || !formData) return;
    if (onAddBranch) {
      onAddBranch(clean);
    }
    setFormData({ ...formData, branch: clean });
    setNewBranchName('');
    setShowNewBranchInput(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave({
        ...formData,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#090e1a] border border-emerald-500/40 shadow-2xl p-4 sm:p-6 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <FileEdit className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">إدارة وتعديل رخص سيارة الأسطول</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  سعودي سوبر ماركت 🇪🇬
                </span>
              </div>
              <p className="text-xs text-slate-400">اختر الفرع أولاً لتسهيل اختيار السيارة وتعديل رخصة المرور أو تصريح الإعلانات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: SELECT BRANCH FIRST */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>الخطوة الأولى: اختر فرع سعودي سوبر ماركت</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedBranchFilter === 'all' ? 'جميع فروع الأسطول' : selectedBranchFilter}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="w-full bg-[#070b15] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="all" className="bg-[#090e1a]">جميع الفروع ({vehicles.length} سيارة)</option>
                {branches.map((b) => {
                  const count = vehicles.filter(v => v.branch === b).length;
                  return (
                    <option key={b} value={b} className="bg-[#090e1a]">
                      {b} — ({count} سيارة)
                    </option>
                  );
                })}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={vehicleSearchQuery}
                  onChange={(e) => setVehicleSearchQuery(e.target.value)}
                  placeholder="بحث سريع برقم اللوحة (مثال: 3119)..."
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: SELECT VEHICLE IN CHOSEN BRANCH */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-400" />
                <span>الخطوة الثانية: حدد السيارة للتعديل ({filteredVehicles.length} متاحة)</span>
              </label>
              {formData && (
                <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                  لوحة: {formData.plateLetters} {formData.vehicleNumber}
                </span>
              )}
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>لا توجد سيارات بهذا الفرع. اختر فرعاً آخر من القائمة أعلاه.</span>
              </div>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => handleSelectVehicleChange(e.target.value)}
                className="w-full bg-[#070b15] border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                required
              >
                {filteredVehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#090e1a] text-white">
                    لوحة: {v.plateLetters || ''} {v.vehicleNumber} | موديل: {v.model} | فرع: {v.branch}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* FORM FIELDS (When vehicle is loaded) */}
          {formData && (
            <>
              {/* Basic Vehicle Data */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">أرقام اللوحة (مصر)</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">حروف اللوحة</label>
                  <input
                    type="text"
                    value={formData.plateLetters || 'أ ب ج'}
                    onChange={(e) => setFormData({ ...formData, plateLetters: e.target.value })}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">موديل السيارة</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-slate-300 font-medium">الفرع المخصص</label>
                    <button
                      type="button"
                      onClick={() => setShowNewBranchInput(prev => !prev)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                    >
                      {showNewBranchInput ? 'إلغاء' : '+ فرع جديد'}
                    </button>
                  </div>
                  {showNewBranchInput ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        placeholder="اسم الفرع الجديد..."
                        className="w-full bg-[#0d1424] border border-emerald-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewBranch}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        إضافة
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-semibold"
                    >
                      {Array.from(new Set([...branches, formData.branch].filter(Boolean))).map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Traffic License Section */}
              <div className="p-3.5 rounded-xl bg-[#0b1120] border border-cyan-500/25 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Car className="w-4 h-4" />
                    <span>رخصة تسيير المركبة (إدارة المرور - مصر)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickRenewTraffic(12)}
                      className="px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      ⚡ تجديد سنة (+1 عام)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRenewTraffic(6)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      +6 أشهر
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">رقم رخصة المرور</label>
                    <input
                      type="text"
                      value={formData.trafficLicense.licenseNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        trafficLicense: { ...formData.trafficLicense, licenseNumber: e.target.value }
                      })}
                      placeholder="مثال: مرور القاهرة - 123456"
                      className="w-full bg-[#080d1a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-400">تاريخ الإصدار</label>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          trafficLicense: { ...formData.trafficLicense, issueDate: 'قيد التحديث' }
                        })}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                      >
                        قيد التحديث
                      </button>
                    </div>
                    <input
                      type={formData.trafficLicense.issueDate === 'قيد التحديث' ? 'text' : 'date'}
                      value={formData.trafficLicense.issueDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        trafficLicense: { ...formData.trafficLicense, issueDate: e.target.value }
                      })}
                      className="w-full bg-[#080d1a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                    <div className="mt-1 text-[10px] text-cyan-300/80 font-medium truncate">
                      {formatDateWithDayName(formData.trafficLicense.issueDate)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-400">تاريخ الانتهاء</label>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          trafficLicense: { ...formData.trafficLicense, expiryDate: 'قيد التحديث' }
                        })}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                      >
                        قيد التحديث
                      </button>
                    </div>
                    <input
                      type={formData.trafficLicense.expiryDate === 'قيد التحديث' ? 'text' : 'date'}
                      value={formData.trafficLicense.expiryDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        trafficLicense: { ...formData.trafficLicense, expiryDate: e.target.value }
                      })}
                      className="w-full bg-[#080d1a] border border-cyan-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                      required
                    />
                    <div className="mt-1 text-[10px] text-cyan-300 font-bold truncate">
                      {formatDateWithDayName(formData.trafficLicense.expiryDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commercial Ad Permit Section */}
              <div className="p-3.5 rounded-xl bg-[#0b1120] border border-amber-500/25 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Megaphone className="w-4 h-4" />
                    <span>تصريح إعلانات سعودي سوبر ماركت (المحليات والأحياء)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickRenewCommercial(12)}
                      className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      ⚡ تجديد سنة (+1 عام)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRenewCommercial(6)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      +6 أشهر
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">رقم تصريح الإعلان</label>
                    <input
                      type="text"
                      value={formData.commercialLicense.licenseNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        commercialLicense: { ...formData.commercialLicense, licenseNumber: e.target.value }
                      })}
                      placeholder="مثال: تصريح حي - 87654"
                      className="w-full bg-[#080d1a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-400">تاريخ الإصدار</label>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          commercialLicense: { ...formData.commercialLicense, issueDate: 'قيد التحديث' }
                        })}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                      >
                        قيد التحديث
                      </button>
                    </div>
                    <input
                      type={formData.commercialLicense.issueDate === 'قيد التحديث' ? 'text' : 'date'}
                      value={formData.commercialLicense.issueDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        commercialLicense: { ...formData.commercialLicense, issueDate: e.target.value }
                      })}
                      className="w-full bg-[#080d1a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                    <div className="mt-1 text-[10px] text-amber-300/80 font-medium truncate">
                      {formatDateWithDayName(formData.commercialLicense.issueDate)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-400">تاريخ الانتهاء</label>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          commercialLicense: { ...formData.commercialLicense, expiryDate: 'قيد التحديث' }
                        })}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                      >
                        قيد التحديث
                      </button>
                    </div>
                    <input
                      type={formData.commercialLicense.expiryDate === 'قيد التحديث' ? 'text' : 'date'}
                      value={formData.commercialLicense.expiryDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        commercialLicense: { ...formData.commercialLicense, expiryDate: e.target.value }
                      })}
                      className="w-full bg-[#080d1a] border border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                      required
                    />
                    <div className="mt-1 text-[10px] text-amber-300 font-bold truncate">
                      {formatDateWithDayName(formData.commercialLicense.expiryDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">ملاحظات التشغيل بالفرع</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات تجديد فحص دوري، خطوط السير والتسليم..."
                  className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div>
                  {canDelete && onDelete && formData && (
                    !confirmDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/35 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف السيارة نهائياً</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/50 px-3 py-1.5 rounded-xl">
                        <span className="text-[11px] font-bold text-rose-200">تأكيد الحذف النهائي؟</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(formData.id);
                            setConfirmDelete(false);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black cursor-pointer"
                        >
                          نعم، احذف
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    )
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 border border-white/10 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 transition-all cursor-pointer shadow-lg shadow-emerald-950 border border-emerald-400/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ وتحديث رخص السيارة</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
