import React from 'react';
import { 
  Plus, 
  SquarePen, 
  ArrowLeftRight, 
  Download 
} from 'lucide-react';
import { Language } from '../utils/i18n';

interface QuickActionsPanelProps {
  lang: Language;
  onAddLicense: () => void;
  onEditData: () => void;
  onTransferVehicle: () => void;
  onExportData: () => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onAddLicense,
  onEditData,
  onTransferVehicle,
  onExportData,
}) => {
  return (
    <div className="rounded-xl bg-[#080d19] border border-[#a67c2e]/55 p-4 shadow-xl">
      {/* Header - Centered title matching master image */}
      <h3 className="text-base font-black text-white text-center mb-3.5 tracking-wide">
        الإجراءات السريعة
      </h3>

      {/* 4 Action Buttons */}
      <div className="space-y-2.5">
        {/* 1. Add License (Green with white circular plus icon) */}
        <button
          type="button"
          onClick={onAddLicense}
          className="w-full h-12 flex items-center justify-between px-3.5 rounded-xl text-sm font-bold text-white bg-[#356e18] hover:bg-[#3f801d] transition-all shadow-md cursor-pointer border border-[#549c28] active:scale-[0.99]"
        >
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Plus className="w-4 h-4 text-[#356e18] stroke-[3.5]" />
          </div>
          <span className="flex-1 text-center font-bold text-sm text-white">إضافة رخصة جديدة</span>
          <div className="w-6 h-6 opacity-0 pointer-events-none flex-shrink-0" />
        </button>

        {/* 2. Edit Data (Navy) */}
        <button
          type="button"
          onClick={onEditData}
          className="w-full h-12 flex items-center justify-between px-3.5 rounded-xl text-sm font-bold text-white bg-[#142337] hover:bg-[#1b2f4a] transition-all shadow-md cursor-pointer border border-[#2b4468] active:scale-[0.99]"
        >
          <SquarePen className="w-5 h-5 text-white stroke-[2.2] flex-shrink-0" />
          <span className="flex-1 text-center font-bold text-sm text-white">تعديل البيانات</span>
          <div className="w-5 h-5 opacity-0 pointer-events-none flex-shrink-0" />
        </button>

        {/* 3. Transfer Vehicle (Amber/Bronze) */}
        <button
          type="button"
          onClick={onTransferVehicle}
          className="w-full h-12 flex items-center justify-between px-3.5 rounded-xl text-sm font-bold text-white bg-[#965713] hover:bg-[#ab6316] transition-all shadow-md cursor-pointer border border-[#c4751a] active:scale-[0.99]"
        >
          <ArrowLeftRight className="w-5 h-5 text-white stroke-[2.5] flex-shrink-0" />
          <span className="flex-1 text-center font-bold text-sm text-white">نقل سيارة من فرع لفرع</span>
          <div className="w-5 h-5 opacity-0 pointer-events-none flex-shrink-0" />
        </button>

        {/* 4. Export Data (Navy) */}
        <button
          type="button"
          onClick={onExportData}
          className="w-full h-12 flex items-center justify-between px-3.5 rounded-xl text-sm font-bold text-white bg-[#142337] hover:bg-[#1b2f4a] transition-all shadow-md cursor-pointer border border-[#2b4468] active:scale-[0.99]"
        >
          <Download className="w-5 h-5 text-white stroke-[2.2] flex-shrink-0" />
          <span className="flex-1 text-center font-bold text-sm text-white">تصدير البيانات</span>
          <div className="w-5 h-5 opacity-0 pointer-events-none flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};
