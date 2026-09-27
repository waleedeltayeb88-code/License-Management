import { LicenseStatus } from '../types';

// Dynamic today's date string (YYYY-MM-DD) for accurate live calculation
export const getSystemTodayDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DEFAULT_REPORT_DATE = getSystemTodayDate();

// Helper to parse ISO or slash date strings reliably into UTC timestamp
export function parseDateToUtc(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return NaN;
  const clean = dateStr.trim();
  if (!clean || clean === 'قيد التحديث' || clean.toLowerCase().includes('pending')) return NaN;

  // Case 1: YYYY-MM-DD or YYYY/MM/DD (ISO standard: Year first)
  const isoMatch = clean.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m <= 11 && d >= 1 && d <= 31) {
      return Date.UTC(y, m, d);
    }
  }

  // Case 2: DD/MM/YYYY or DD-MM-YYYY (Egyptian/Arabic standard: Day first, e.g. "الخميس 10/9/2026" or "10/9/2026")
  const dmyMatch = clean.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m <= 11 && d >= 1 && d <= 31) {
      return Date.UTC(y, m, d);
    }
  }

  // Fallback: standard Date parsing
  const parsed = new Date(clean);
  const time = parsed.getTime();
  return isNaN(time) ? NaN : time;
}

export function calculateRemainingDays(expiryDateStr: string, refDateStr: string = DEFAULT_REPORT_DATE): number {
  if (!expiryDateStr || expiryDateStr === 'قيد التحديث' || expiryDateStr.toLowerCase().includes('pending')) {
    return -9999;
  }
  
  const expiryTime = parseDateToUtc(expiryDateStr);
  const refTime = parseDateToUtc(refDateStr || DEFAULT_REPORT_DATE);

  if (isNaN(expiryTime) || isNaN(refTime)) {
    return -9999;
  }

  // Set both to pure calendar day diff
  const diffTime = expiryTime - refTime;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(diffDays) ? -9999 : diffDays;
}

export function getLicenseStatus(
  expiryDateStr: string,
  thresholdDays: number = 30,
  refDateStr: string = DEFAULT_REPORT_DATE
): LicenseStatus {
  if (!expiryDateStr || expiryDateStr === 'قيد التحديث' || expiryDateStr.toLowerCase().includes('pending')) {
    return 'expired'; // Count un-updated or missing license as expired / requiring urgent renewal
  }
  const days = calculateRemainingDays(expiryDateStr, refDateStr);
  
  if (isNaN(days) || days < 0) {
    return 'expired';
  }
  if (days <= thresholdDays) {
    return 'expiring_soon';
  }
  return 'valid';
}

export function formatDaysDisplay(days: number, isArabic: boolean = true): string {
  const safeDays = isNaN(days) ? 0 : days;
  if (isArabic) {
    return `${safeDays} يوم`;
  }
  return `${safeDays} days`;
}

export function formatDateSlash(dateStr: string): string {
  if (!dateStr) return '—';
  // If YYYY-MM-DD convert to D/M/YYYY
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const year = parts[0];
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

const ARABIC_WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

/**
 * Formats a date string (YYYY-MM-DD or ISO) into Arabic day name + D/M/YYYY format
 * Example: '2026-09-23' -> 'الأربعاء 23/9/2026'
 */
export function formatDateWithDayName(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '—';
  const clean = dateStr.trim();
  if (clean === 'قيد التحديث' || clean.toLowerCase().includes('pending')) {
    return 'قيد التحديث';
  }
  
  const utc = parseDateToUtc(clean);
  if (!isNaN(utc)) {
    const d = new Date(utc);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const dayOfWeek = d.getUTCDay();
    const dayName = ARABIC_WEEKDAYS[dayOfWeek] || '';
    return `${dayName} ${day}/${month}/${year}`;
  }
  
  return dateStr || '—';
}

export function getArabicDayName(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const dateObj = new Date(year, month - 1, day, 12, 0, 0);
      return ARABIC_WEEKDAYS[dateObj.getDay()] || '';
    }
  }
  return '';
}

export function getStatusTheme(status: LicenseStatus) {
  switch (status) {
    case 'valid':
      return {
        labelAr: 'سارية',
        labelEn: 'Valid',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-600',
        dot: 'bg-emerald-400',
        iconColor: '#10b981'
      };
    case 'expiring_soon':
      return {
        labelAr: 'قريبة من الإنتهاء',
        labelEn: 'Expiring Soon',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        badgeBg: 'bg-amber-600',
        dot: 'bg-amber-400',
        iconColor: '#f59e0b'
      };
    case 'expired':
      return {
        labelAr: 'منتهية',
        labelEn: 'Expired',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        badgeBg: 'bg-rose-600',
        dot: 'bg-rose-400',
        iconColor: '#ef4444'
      };
  }
}
