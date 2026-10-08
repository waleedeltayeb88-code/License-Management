import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle } from '../types';
import { EgyptianTransportPlate } from './common/EgyptianTransportPlate';
import { calculateRemainingDays, getLicenseStatus, formatDateSlash, formatDateWithDayName, DEFAULT_REPORT_DATE } from '../utils/dateUtils';
import { Language } from '../utils/i18n';
import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Car,
  Megaphone,
  ArrowLeftRight,
  Edit,
  Eye,
  FileSpreadsheet,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Search
} from 'lucide-react';

interface LicenseTableProps {
  lang: Language;
  vehicles?: Vehicle[];
  thresholdDays?: number;
  referenceDate?: string;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onManageVehicle?: (vehicle: Vehicle) => void;
  onTransferVehicle?: (vehicle: Vehicle) => void;
}

type SortField = 'vehicleNumber' | 'model' | 'branch' | 'trafficExpiry' | 'trafficDays' | 'commercialExpiry' | 'commercialDays';
type SortOrder = 'asc' | 'desc';
type ViewDensity = 'compact' | 'comfortable';

export const LicenseTable: React.FC<LicenseTableProps> = ({
  vehicles = [],
  thresholdDays = 30,
  referenceDate = DEFAULT_REPORT_DATE,
  onSelectVehicle,
  onManageVehicle,
  onTransferVehicle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<SortField>('trafficDays');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [density, setDensity] = useState<ViewDensity>('comfortable');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'expiring_soon' | 'expired'>('all');

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Status counts for the 3 buttons
  const statusCounts = useMemo(() => {
    let valid = 0;
    let expiring = 0;
    let expired = 0;

    vehicles.forEach(v => {
      const tStat = getLicenseStatus(v.trafficLicense.expiryDate, thresholdDays, referenceDate);
      const cStat = getLicenseStatus(v.commercialLicense.expiryDate, thresholdDays, referenceDate);

      if (tStat === 'expired' || cStat === 'expired') {
        expired++;
      } else if (tStat === 'expiring_soon' || cStat === 'expiring_soon') {
        expiring++;
      } else {
        valid++;
      }
    });

    return { all: vehicles.length, valid, expiring, expired };
  }, [vehicles, thresholdDays, referenceDate]);

  // Filter vehicles by selected status (سارية / أوشكت على الانتهاء / منتهية)
  const displayedVehicles = useMemo(() => {
    if (statusFilter === 'all') return vehicles;
    return vehicles.filter(v => {
      const tStat = getLicenseStatus(v.trafficLicense.expiryDate, thresholdDays, referenceDate);
      const cStat = getLicenseStatus(v.commercialLicense.expiryDate, thresholdDays, referenceDate);

      if (statusFilter === 'expired') {
        return tStat === 'expired' || cStat === 'expired';
      }
      if (statusFilter === 'expiring_soon') {
        return (tStat === 'expiring_soon' || cStat === 'expiring_soon') && tStat !== 'expired' && cStat !== 'expired';
      }
      if (statusFilter === 'valid') {
        return tStat === 'valid' && cStat === 'valid';
      }
      return true;
    });
  }, [vehicles, statusFilter, thresholdDays, referenceDate]);

  // Sort vehicles
  const sortedVehicles = useMemo(() => {
    return [...displayedVehicles].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'vehicleNumber') {
        valA = a.vehicleNumber;
        valB = b.vehicleNumber;
      } else if (sortField === 'model') {
        valA = a.model;
        valB = b.model;
      } else if (sortField === 'branch') {
        valA = a.branch;
        valB = b.branch;
      } else if (sortField === 'trafficExpiry') {
        valA = a.trafficLicense.expiryDate;
        valB = b.trafficLicense.expiryDate;
      } else if (sortField === 'trafficDays') {
        valA = calculateRemainingDays(a.trafficLicense.expiryDate, referenceDate);
        valB = calculateRemainingDays(b.trafficLicense.expiryDate, referenceDate);
      } else if (sortField === 'commercialExpiry') {
        valA = a.commercialLicense.expiryDate;
        valB = b.commercialLicense.expiryDate;
      } else if (sortField === 'commercialDays') {
        valA = calculateRemainingDays(a.commercialLicense.expiryDate, referenceDate);
        valB = calculateRemainingDays(b.commercialLicense.expiryDate, referenceDate);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [displayedVehicles, sortField, sortOrder, referenceDate]);

  const totalPages = Math.ceil(sortedVehicles.length / pageSize) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const currentVehicles = sortedVehicles.slice(startIndex, startIndex + pageSize);

  // Status badge styling with glowing dots
  const renderStatusBadge = (status: 'valid' | 'expiring_soon' | 'expired', days: number, expiryDate?: string) => {
    if (!expiryDate || expiryDate === 'قيد التحديث' || expiryDate.toLowerCase().includes('pending')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          قيد التحديث
        </span>
      );
    }
    const safeDays = typeof days === 'number' && !isNaN(days) && days !== -9999 ? days : 0;
    
    // Explicit expiration: if status is expired OR calculated days are negative
    if (status === 'expired' || safeDays < 0) {
      const daysAgo = Math.abs(safeDays);
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          {daysAgo === 0 ? 'منتهية اليوم' : `منتهية (منذ ${daysAgo} يوم)`}
        </span>
      );
    }
    
    // Expiring soon: within configured threshold
    if (status === 'expiring_soon' || safeDays <= thresholdDays) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          {safeDays === 0 ? 'تنتهي اليوم' : `أوشكت (${safeDays} يوم)`}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        سارية (متبقي {safeDays} يوم)
      </span>
    );
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-emerald-400 font-bold" />
      : <ArrowDown className="w-3.5 h-3.5 text-emerald-400 font-bold" />;
  };

  const pyPadding = density === 'compact' ? 'py-1.5' : 'py-3';

  return (
    <div className="rounded-2xl bg-[#090e1a]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.35)] overflow-hidden">
      {/* 1. TABLE TOP CONTROL BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 py-3.5 border-b border-white/[0.08] bg-[#070c17] gap-3">
        {/* Left Branding and fleet counter */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                جدول رخص وتراخيص أسطول سيارات سعودي سوبر ماركت
              </h3>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                سعودي 🇪🇬
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {sortedVehicles.length} سيارة
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              بيانات رخص التسيير وتصاريح الإعلانات مقسمة بوضوح مع إمكانية الفرز والتعديل والنقل السريع
            </p>
          </div>
        </div>

        {/* Right Tools (Status Filter Buttons, Density, Rows per page) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          {/* 3 Status Filter Buttons + All (سارية / أوشكت على الانتهاء / منتهية / الكل) */}
          <div className="flex items-center p-0.5 bg-[#040711] border border-white/10 rounded-xl gap-1">
            {/* الكل */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>الكل</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${
                statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
              }`}>
                {statusCounts.all}
              </span>
            </button>

            {/* سارية */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter(prev => prev === 'valid' ? 'all' : 'valid');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                statusFilter === 'valid'
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>سارية</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                statusFilter === 'valid' ? 'bg-emerald-500/30 text-emerald-100' : 'bg-emerald-500/15 text-emerald-300'
              }`}>
                {statusCounts.valid}
              </span>
            </button>

            {/* أوشكت على الانتهاء */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter(prev => prev === 'expiring_soon' ? 'all' : 'expiring_soon');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                statusFilter === 'expiring_soon'
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>أوشكت على الانتهاء</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                statusFilter === 'expiring_soon' ? 'bg-amber-500/30 text-amber-100' : 'bg-amber-500/15 text-amber-300'
              }`}>
                {statusCounts.expiring}
              </span>
            </button>

            {/* منتهية */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter(prev => prev === 'expired' ? 'all' : 'expired');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                statusFilter === 'expired'
                  ? 'bg-rose-500/30 text-rose-200 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.35)] ring-1 ring-rose-500/30'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>منتهية</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                statusFilter === 'expired' ? 'bg-rose-500/30 text-rose-100' : 'bg-rose-500/15 text-rose-300'
              }`}>
                {statusCounts.expired}
              </span>
            </button>
          </div>

          {/* Density Switch */}
          <div className="flex items-center bg-[#040711] border border-white/10 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setDensity('compact')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                density === 'compact' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              مدمج
            </button>
            <button
              type="button"
              onClick={() => setDensity('comfortable')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                density === 'comfortable' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              مريح
            </button>
          </div>

          {/* Page size dropdown */}
          <div className="flex items-center gap-1.5 bg-[#040711] border border-white/10 rounded-xl px-2 py-1">
            <span className="text-slate-400 text-[11px]">عرض:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value={10} className="bg-[#090e1a]">10 سيارات</option>
              <option value={20} className="bg-[#090e1a]">20 سيارة</option>
              <option value={50} className="bg-[#090e1a]">50 سيارة</option>
              <option value={105} className="bg-[#090e1a]">كل الأسطول (105)</option>
              <option value={150} className="bg-[#090e1a]">الكل</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. THE MASTER DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            {/* Top Level Category Banner */}
            <tr className="border-b border-white/[0.1] text-xs font-bold tracking-wider">
              {/* Vehicle Identity */}
              <th colSpan={3} className="py-2.5 px-3 text-center bg-[#0d1424] text-slate-200 border-l border-white/[0.08]">
                <div className="flex items-center justify-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  <span>بيانات سيارة التوصيل (الأسطول)</span>
                </div>
              </th>

              {/* Traffic Department License Header Group */}
              <th colSpan={4} className="py-2.5 px-3 text-center bg-[#071926] text-cyan-300 border-l border-white/[0.08] shadow-inner">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                  <span className="font-black">رخصة التسيير (المرور المصري)</span>
                  <span className="text-[10px] text-cyan-400/80 font-normal bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">فحص وتسيير</span>
                </div>
              </th>

              {/* Commercial Advertising License Header Group */}
              <th colSpan={4} className="py-2.5 px-3 text-center bg-[#1f1709] text-amber-300 border-l border-white/[0.08] shadow-inner">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                  <span className="font-black">تصاريح الإعلانات (المحليات والأحياء)</span>
                  <span className="text-[10px] text-amber-400/80 font-normal bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">صندوق السيارة</span>
                </div>
              </th>

              {/* Action Column */}
              <th className="py-2.5 px-3 text-center bg-[#0d1424] text-slate-300">
                إجراءات سريعة
              </th>
            </tr>

            {/* Sub-column Titles with Interactive Sorting */}
            <tr className="border-b border-white/[0.08] bg-[#070c17] text-slate-300 font-semibold text-[11px]">
              {/* Vehicle Plate Column */}
              <th 
                onClick={() => handleSort('vehicleNumber')}
                className="py-3 px-3 text-center w-36 cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>لوحة السيارة</span>
                  {renderSortIndicator('vehicleNumber')}
                </div>
              </th>

              {/* Vehicle Model Column */}
              <th 
                onClick={() => handleSort('model')}
                className="py-3 px-3 text-center cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>موديل السيارة</span>
                  {renderSortIndicator('model')}
                </div>
              </th>

              {/* Branch Column */}
              <th 
                onClick={() => handleSort('branch')}
                className="py-3 px-3 text-center border-l border-white/[0.08] cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>فرع سعودي</span>
                  {renderSortIndicator('branch')}
                </div>
              </th>

              {/* Traffic: License Number */}
              <th className="py-3 px-2 text-center bg-cyan-500/[0.02] text-cyan-200/90 font-medium">رقم رخصة المرور</th>

              {/* Traffic: Issue Date */}
              <th className="py-3 px-2 text-center bg-cyan-500/[0.02] text-cyan-200/90 font-medium">تاريخ الإصدار</th>

              {/* Traffic: Expiry Date */}
              <th 
                onClick={() => handleSort('trafficExpiry')}
                className="py-3 px-2 text-center cursor-pointer hover:bg-white/[0.04] transition-colors select-none group bg-cyan-500/[0.02]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-cyan-200 font-bold">تاريخ الانتهاء</span>
                  {renderSortIndicator('trafficExpiry')}
                </div>
              </th>

              {/* Traffic: Status */}
              <th 
                onClick={() => handleSort('trafficDays')}
                className="py-3 px-3 text-center border-l border-white/[0.08] cursor-pointer hover:bg-white/[0.04] transition-colors select-none group bg-cyan-500/[0.02]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-cyan-200 font-bold">حالة رخصة السير</span>
                  {renderSortIndicator('trafficDays')}
                </div>
              </th>

              {/* Commercial: Permit Number */}
              <th className="py-3 px-2 text-center bg-amber-500/[0.02] text-amber-200/90 font-medium">رقم التصريح</th>

              {/* Commercial: Issue Date */}
              <th className="py-3 px-2 text-center bg-amber-500/[0.02] text-amber-200/90 font-medium">تاريخ الإصدار</th>

              {/* Commercial: Expiry Date */}
              <th 
                onClick={() => handleSort('commercialExpiry')}
                className="py-3 px-2 text-center cursor-pointer hover:bg-white/[0.04] transition-colors select-none group bg-amber-500/[0.02]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-amber-200 font-bold">تاريخ الانتهاء</span>
                  {renderSortIndicator('commercialExpiry')}
                </div>
              </th>

              {/* Commercial: Status */}
              <th 
                onClick={() => handleSort('commercialDays')}
                className="py-3 px-3 text-center border-l border-white/[0.08] cursor-pointer hover:bg-white/[0.04] transition-colors select-none group bg-amber-500/[0.02]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-amber-200 font-bold">حالة تصريح الإعلان</span>
                  {renderSortIndicator('commercialDays')}
                </div>
              </th>

              {/* Quick Actions */}
              <th className="py-3 px-3 text-center w-28 font-bold">إجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.05]">
            {currentVehicles.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-14 text-center text-slate-400 bg-[#080d19]/40">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <AlertCircle className="w-9 h-9 text-amber-400/70" />
                    <span className="text-sm font-bold text-white">لا توجد سيارات مطابقة لمعايير الفرز أو التصفية المحددة</span>
                    <span className="text-xs text-slate-500">جرب اختيار زر "الكل" أو تعديل فلاتر البحث</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentVehicles.map((v, idx) => {
                // Calculations
                const tDays = calculateRemainingDays(v.trafficLicense.expiryDate, referenceDate);
                const tStat = getLicenseStatus(v.trafficLicense.expiryDate, thresholdDays, referenceDate);

                const cDays = calculateRemainingDays(v.commercialLicense.expiryDate, referenceDate);
                const cStat = getLicenseStatus(v.commercialLicense.expiryDate, thresholdDays, referenceDate);

                const isUrgentRow = tStat === 'expired' || cStat === 'expired';

                return (
                  <tr
                    key={v.id || v.vehicleNumber}
                    onClick={() => onSelectVehicle(v)}
                    className={`hover:bg-white/[0.06] transition-all cursor-pointer group ${
                      isUrgentRow 
                        ? 'bg-rose-950/10 hover:bg-rose-950/20' 
                        : idx % 2 === 0 ? 'bg-[#090e1a]' : 'bg-[#0b1222]/80'
                    }`}
                  >
                    {/* 1. Authentic Egyptian Transport Plate (لوحة نقل مصرية رسمية) */}
                    <td className={`${pyPadding} px-3 text-center`}>
                      <div className="inline-flex justify-center items-center">
                        <EgyptianTransportPlate
                          vehicleNumber={v.vehicleNumber}
                          plateLetters={v.plateLetters}
                          size="md"
                        />
                      </div>
                    </td>

                    {/* 2. Model */}
                    <td className={`${pyPadding} px-3 text-center text-slate-200 font-medium whitespace-nowrap`}>
                      {v.model || 'سوزوكي سوبر كاري'}
                    </td>

                    {/* 3. Branch with Icon */}
                    <td className={`${pyPadding} px-3 text-center border-l border-white/[0.08] whitespace-nowrap`}>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-200 text-xs font-medium border border-white/[0.06] group-hover:border-emerald-500/30 transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{v.branch}</span>
                      </span>
                    </td>

                    {/* 4. Traffic License Number */}
                    <td className={`${pyPadding} px-2 text-center font-mono text-cyan-200 text-[11px] whitespace-nowrap bg-cyan-500/[0.015]`}>
                      {v.trafficLicense.licenseNumber || '—'}
                    </td>

                    {/* 5. Traffic Issue Date */}
                    <td className={`${pyPadding} px-2.5 text-center text-slate-300 text-[11px] whitespace-nowrap bg-cyan-500/[0.015]`}>
                      <span className="font-medium">{formatDateWithDayName(v.trafficLicense.issueDate)}</span>
                    </td>

                    {/* 6. Traffic Expiry Date */}
                    <td className={`${pyPadding} px-2.5 text-center text-[11px] whitespace-nowrap bg-cyan-500/[0.015]`}>
                      <span className="font-bold text-white tracking-wide bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                        {formatDateWithDayName(v.trafficLicense.expiryDate)}
                      </span>
                    </td>

                    {/* 7. Traffic Status Badge */}
                    <td className={`${pyPadding} px-3 text-center border-l border-white/[0.08] bg-cyan-500/[0.015]`}>
                      {renderStatusBadge(tStat, tDays, v.trafficLicense.expiryDate)}
                    </td>

                    {/* 8. Commercial Permit Number */}
                    <td className={`${pyPadding} px-2 text-center font-mono text-amber-200 text-[11px] whitespace-nowrap bg-amber-500/[0.015]`}>
                      {v.commercialLicense.licenseNumber || '—'}
                    </td>

                    {/* 9. Commercial Issue Date */}
                    <td className={`${pyPadding} px-2.5 text-center text-slate-300 text-[11px] whitespace-nowrap bg-amber-500/[0.015]`}>
                      <span className="font-medium">{formatDateWithDayName(v.commercialLicense.issueDate)}</span>
                    </td>

                    {/* 10. Commercial Expiry Date */}
                    <td className={`${pyPadding} px-2.5 text-center text-[11px] whitespace-nowrap bg-amber-500/[0.015]`}>
                      <span className="font-bold text-white tracking-wide bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                        {formatDateWithDayName(v.commercialLicense.expiryDate)}
                      </span>
                    </td>

                    {/* 11. Commercial Status Badge */}
                    <td className={`${pyPadding} px-3 text-center border-l border-white/[0.08] bg-amber-500/[0.015]`}>
                      {renderStatusBadge(cStat, cDays, v.commercialLicense.expiryDate)}
                    </td>

                    {/* 12. Quick Action Buttons */}
                    <td className={`${pyPadding} px-3 text-center`}>
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectVehicle(v)}
                          title="عرض بطاقة وتفاصيل السيارة"
                          className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {onManageVehicle && (
                          <button
                            type="button"
                            onClick={() => onManageVehicle(v)}
                            title="تعديل رخص وبيانات السيارة"
                            className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onTransferVehicle && (
                          <button
                            type="button"
                            onClick={() => onTransferVehicle(v)}
                            title="نقل السيارة لفرع سعودي آخر"
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATION & FLEET NAVIGATION FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3.5 border-t border-white/[0.08] bg-[#070c17] text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <span>
            عرض <strong className="text-white font-mono">{startIndex + 1}</strong> إلى <strong className="text-white font-mono">{Math.min(startIndex + pageSize, sortedVehicles.length)}</strong> من أصل <strong className="text-emerald-400 font-mono font-bold">{sortedVehicles.length}</strong> سيارة أسطول
          </span>
          {statusFilter !== 'all' && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              statusFilter === 'valid'
                ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                : statusFilter === 'expiring_soon'
                ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
                : 'text-rose-400 bg-rose-500/15 border-rose-500/30'
            }`}>
              تصفية: {statusFilter === 'valid' ? 'رخص سارية' : statusFilter === 'expiring_soon' ? 'أوشكت على الانتهاء' : 'رخص منتهية'}
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <span className="px-3 py-1 text-slate-200 font-mono text-xs font-semibold bg-white/[0.03] rounded-lg border border-white/[0.06]">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(p => Math.min(totalPages, p + 1));
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-all cursor-pointer"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
