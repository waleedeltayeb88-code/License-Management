import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Car, 
  Megaphone, 
  Building2, 
  MapPin, 
  Check, 
  Store,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Vehicle } from '../../types';
import { Language } from '../../utils/i18n';
import { formatDateWithDayName } from '../../utils/dateUtils';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: string[];
  onAdd: (newVehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddBranch?: (branchName: string) => void;
  lang: Language;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  branches = [],
  onAdd,
  onAddBranch,
}) => {
  // Step 1: Branch selection first
  const [branch, setBranch] = useState(branches[0] || 'هايد بارك (Hyde Park)');
  const [showNewBranchInput, setShowNewBranchInput] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  // Step 2: Vehicle details
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [plateLetters, setPlateLetters] = useState('أ ب ج');
  const [model, setModel] = useState('سوزوكي سوبر كاري (2025)');

  // Step 3: Traffic License (Egypt Traffic Department)
  const [tLicenseNum, setTLicenseNum] = useState('');
  const [tIssueDate, setTIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tExpiryDate, setTExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });

  // Step 4: Commercial License (Egypt Municipalities/Districts Ad Permit)
  const [cLicenseNum, setCLicenseNum] = useState('');
  const [cIssueDate, setCIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cExpiryDate, setCExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });

  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleCreateNewBranch = () => {
    const clean = newBranchName.trim();
    if (!clean) return;
    if (onAddBranch) {
      onAddBranch(clean);
    }
    setBranch(clean);
    setNewBranchName('');
    setShowNewBranchInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) return;

    onAdd({
      vehicleNumber: vehicleNumber.trim(),
      plateLetters: plateLetters.trim() || 'أ ب ج',
      model,
      branch,
      trafficLicense: {
        licenseNumber: tLicenseNum.trim() || `مرور مصر - ${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: tIssueDate,
        expiryDate: tExpiryDate,
      },
      commercialLicense: {
        licenseNumber: cLicenseNum.trim() || `إعلان حي - ${Math.floor(10000 + Math.random() * 90000)}`,
        issueDate: cIssueDate,
        expiryDate: cExpiryDate,
      },
      notes: notes.trim(),
    });
    setVehicleNumber('');
    setTLicenseNum('');
    setCLicenseNum('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#090e1a] border border-emerald-500/40 shadow-2xl p-4 sm:p-6 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">إضافة سيارة ورخص جديدة لأسطول سعودي</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  مصر 🇪🇬
                </span>
              </div>
              <p className="text-xs text-slate-400">حدد فرع سعودي أولاً، ثم سجل بيانات لوحة المركبة ورخصتي التسيير والإعلان</p>
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
          {/* STEP 1: CHOOSE BRANCH FIRST */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>الخطوة الأولى: تحديد فرع سعودي سوبر ماركت التابع له السيارة</span>
              </label>
              <button
                type="button"
                onClick={() => setShowNewBranchInput(prev => !prev)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                {showNewBranchInput ? 'إلغاء' : '+ إضافة فرع جديد'}
              </button>
            </div>

            {showNewBranchInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="اكتب اسم الفرع الجديد (مثال: فرع المعادي الجديدة)..."
                  className="w-full bg-[#070b15] border border-emerald-500/60 rounded-xl px-3.5 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateNewBranch}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                >
                  حفظ الفرع
                </button>
              </div>
            ) : (
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#070b15] border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {Array.from(new Set([...branches, branch].filter(Boolean))).map((b) => (
                  <option key={b} value={b} className="bg-[#090e1a]">
                    {b}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* STEP 2: VEHICLE & LICENSE PLATE DETAILS */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-white/10 space-y-3">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-amber-400" />
              <span>الخطوة الثانية: بيانات لوحة السيارة والموديل (جمهورية مصر العربية)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">أرقام اللوحة (مصر)</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="مثال: 3119"
                  className="w-full bg-[#070b15] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">حروف اللوحة</label>
                <input
                  type="text"
                  value={plateLetters}
                  onChange={(e) => setPlateLetters(e.target.value)}
                  placeholder="مثال: أ ب ج"
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">موديل ونوع السيارة</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="سوزوكي سوبر كاري (2025)">سوزوكي سوبر كاري (2025)</option>
                  <option value="سوزوكي فان (2023)">سوزوكي فان (2023)</option>
                  <option value="سوزوكي بيك أب صندوق بأرفف (2025)">سوزوكي بيك أب صندوق بأرفف (2025)</option>
                  <option value="فيات دوبلو (2022)">فيات دوبلو (2022)</option>
                  <option value="جولف كار (2024)">جولف كار (2024)</option>
                  <option value="سوزوكي سوبر كاري صندوق أرفف (2022)">سوزوكي سوبر كاري صندوق أرفف (2022)</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: TRAFFIC LICENSE DATA */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-cyan-500/25 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Car className="w-4 h-4" />
                <span>رخصة التسيير (إدارة المرور المصرية)</span>
              </div>
              <span className="text-[10px] text-slate-400">فحص فني وتسيير</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">رقم رخصة المرور</label>
                <input
                  type="text"
                  value={tLicenseNum}
                  onChange={(e) => setTLicenseNum(e.target.value)}
                  placeholder="مثال: مرور القاهرة - 418290"
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">تاريخ الإصدار</label>
                <input
                  type="date"
                  value={tIssueDate}
                  onChange={(e) => setTIssueDate(e.target.value)}
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <div className="mt-1 text-[10px] text-cyan-300/80 font-medium truncate">
                  {formatDateWithDayName(tIssueDate)}
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={tExpiryDate}
                  onChange={(e) => setTExpiryDate(e.target.value)}
                  className="w-full bg-[#070b15] border border-cyan-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                  required
                />
                <div className="mt-1 text-[10px] text-cyan-300 font-bold truncate">
                  {formatDateWithDayName(tExpiryDate)}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: COMMERCIAL AD PERMIT */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Megaphone className="w-4 h-4" />
                <span>تصريح إعلانات سعودي سوبر ماركت (المحليات والأحياء)</span>
              </div>
              <span className="text-[10px] text-slate-400">ملصقات الصندوق التجاري</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">رقم تصريح الإعلان</label>
                <input
                  type="text"
                  value={cLicenseNum}
                  onChange={(e) => setCLicenseNum(e.target.value)}
                  placeholder="مثال: تصريح حي - 18820"
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">تاريخ الإصدار</label>
                <input
                  type="date"
                  value={cIssueDate}
                  onChange={(e) => setCIssueDate(e.target.value)}
                  className="w-full bg-[#070b15] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <div className="mt-1 text-[10px] text-amber-300/80 font-medium truncate">
                  {formatDateWithDayName(cIssueDate)}
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={cExpiryDate}
                  onChange={(e) => setCExpiryDate(e.target.value)}
                  className="w-full bg-[#070b15] border border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                  required
                />
                <div className="mt-1 text-[10px] text-amber-300 font-bold truncate">
                  {formatDateWithDayName(cExpiryDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1">ملاحظات التشغيل بالفرع</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: سيارة جديدة مخصصة لطلبات التوصيل السريع لفرع..."
              className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
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
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل السيارة وإدراج الرخص</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
