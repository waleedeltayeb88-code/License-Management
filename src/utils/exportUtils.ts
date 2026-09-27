import ExcelJS from 'exceljs';
import { Vehicle } from '../types';
import { calculateRemainingDays, getLicenseStatus, formatDateWithDayName, DEFAULT_REPORT_DATE } from './dateUtils';

interface ExportExcelOptions {
  reportTitle?: string;
  reportSubtitle?: string;
  reportCategory?: string;
}

/**
 * Generates an executive, branded, richly styled Excel (.xlsx) workbook for Seoudi Supermarket
 * using ExcelJS:
 * - Proper RTL configuration
 * - Corporate Seoudi Supermarket Gold & Emerald branding
 * - KPI Executive summary cards on top
 * - High-contrast color-coded license compliance status rows (Emerald / Amber / Rose)
 * - Auto-fitted column widths, elegant typography, zebra striping, and cell borders
 * - Summary & statistics sheet + detailed fleet sheet
 */
export async function exportVehiclesToExcel(
  vehicles: Vehicle[],
  thresholdDays: number = 30,
  referenceDate: string = DEFAULT_REPORT_DATE,
  filename: string = 'سعودي_سوبر_ماركت_تقرير_الأسطول_والرخص.xlsx',
  options?: ExportExcelOptions
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'سعودي سوبر ماركت - الإدارة العامة للحركة والأسطول';
  workbook.lastModifiedBy = 'منظومة إدارة أسطول سيارات سعودي سوبر ماركت';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Colors Palette
  const SEOUDI_GREEN = 'FF0D5C3A'; // Seoudi Dark Emerald Green
  const SEOUDI_GOLD = 'FFD97706'; // Rich Gold/Amber
  const HEADER_FILL = 'FF0F2B1D'; // Deep Luxury Green for Main Headers
  const SUBHEADER_FILL = 'FF1E293B'; // Slate 800
  const BORDER_COLOR = 'FFCBD5E1'; // Slate 300
  const ZEBRA_LIGHT = 'FFF8FAFC'; // Slate 50

  // 1. Calculate KPI statistics
  let trafficValid = 0;
  let trafficExpiring = 0;
  let trafficExpired = 0;

  let commValid = 0;
  let commExpiring = 0;
  let commExpired = 0;

  vehicles.forEach((v) => {
    const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
    if (tStat === 'valid') trafficValid++;
    else if (tStat === 'expiring_soon') trafficExpiring++;
    else trafficExpired++;

    const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
    if (cStat === 'valid') commValid++;
    else if (cStat === 'expiring_soon') commExpiring++;
    else commExpired++;
  });

  const totalVehicles = vehicles.length;
  const complianceRate = totalVehicles > 0 ? Math.round((trafficValid / totalVehicles) * 100) : 0;

  // ==========================================
  // SHEET 1: جدول بيانات الأسطول والتراخيص التفصيلي
  // ==========================================
  const sheet = workbook.addWorksheet('تقرير الأسطول والرخص التفصيلي', {
    views: [{ showGridLines: true } as any],
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });
  // Enable Right-To-Left view in Excel
  sheet.views = [{ rightToLeft: true, showGridLines: true } as any];

  // Row 1: Top Brand Banner
  const titleRow = sheet.addRow(['سعودي سوبر ماركت (مصر) — الإدارة العامة للخدمات اللوجستية وإدارة الأسطول']);
  sheet.mergeCells('A1:O1');
  titleRow.height = 36;
  const titleCell = sheet.getCell('A1');
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: HEADER_FILL },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 2: Subtitle & Meta Info
  const subTitleText = `${options?.reportTitle || 'التقرير الرسمي الشامل لمتابعة رخص المرور وتصاريح الإعلانات لسيارات التوصيل'} | التاريخ المرجعي للتدقيق: ${referenceDate} | مهلة التنبيه: ${thresholdDays} يوم`;
  const subRow = sheet.addRow([subTitleText]);
  sheet.mergeCells('A2:O2');
  subRow.height = 24;
  const subCell = sheet.getCell('A2');
  subCell.font = { name: 'Calibri', size: 11, bold: false, color: { argb: 'FFE2E8F0' } };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF164E63' }, // Cyan-900 / Deep Teal
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 3: Blank separator
  sheet.addRow([]);
  sheet.getRow(3).height = 10;

  // Row 4 & 5: KPI Executive Cards (Merged Blocks)
  // Card 1: Total Fleet (A4:B5)
  sheet.mergeCells('A4:C4');
  sheet.mergeCells('A5:C5');
  const card1Title = sheet.getCell('A4');
  card1Title.value = 'إجمالي سيارات التوصيل';
  card1Title.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  card1Title.alignment = { vertical: 'middle', horizontal: 'center' };
  card1Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

  const card1Val = sheet.getCell('A5');
  card1Val.value = `${totalVehicles} مركبة`;
  card1Val.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF0F172A' } };
  card1Val.alignment = { vertical: 'middle', horizontal: 'center' };
  card1Val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

  // Card 2: Traffic Licenses Valid (D4:F5)
  sheet.mergeCells('D4:F4');
  sheet.mergeCells('D5:F5');
  const card2Title = sheet.getCell('D4');
  card2Title.value = 'رخص مرور سارية (مطابقة)';
  card2Title.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } };
  card2Title.alignment = { vertical: 'middle', horizontal: 'center' };
  card2Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } };

  const card2Val = sheet.getCell('D5');
  card2Val.value = `${trafficValid} رخصة (${complianceRate}%)`;
  card2Val.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF047857' } };
  card2Val.alignment = { vertical: 'middle', horizontal: 'center' };
  card2Val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };

  // Card 3: Expiring Soon (G4:I5)
  sheet.mergeCells('G4:I4');
  sheet.mergeCells('G5:I5');
  const card3Title = sheet.getCell('G4');
  card3Title.value = `وشيكة الانتهاء (خلال ${thresholdDays} يوم)`;
  card3Title.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF92400E' } };
  card3Title.alignment = { vertical: 'middle', horizontal: 'center' };
  card3Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } };

  const card3Val = sheet.getCell('G5');
  card3Val.value = `مرور: ${trafficExpiring} | إعلان: ${commExpiring}`;
  card3Val.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFB45309' } };
  card3Val.alignment = { vertical: 'middle', horizontal: 'center' };
  card3Val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };

  // Card 4: Expired Action Required (J4:L5)
  sheet.mergeCells('J4:L4');
  sheet.mergeCells('J5:L5');
  const card4Title = sheet.getCell('J4');
  card4Title.value = 'تراخيص منتهية (مطلوب تجديد عاجل)';
  card4Title.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF991B1B' } };
  card4Title.alignment = { vertical: 'middle', horizontal: 'center' };
  card4Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFECDD3' } };

  const card4Val = sheet.getCell('J5');
  card4Val.value = `مرور: ${trafficExpired} | إعلان: ${commExpired}`;
  card4Val.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFE11D48' } };
  card4Val.alignment = { vertical: 'middle', horizontal: 'center' };
  card4Val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };

  // Card 5: Overall Compliance (M4:O5)
  sheet.mergeCells('M4:O4');
  sheet.mergeCells('M5:O5');
  const card5Title = sheet.getCell('M4');
  card5Title.value = 'معدل الامتثال القانوني للأسطول';
  card5Title.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  card5Title.alignment = { vertical: 'middle', horizontal: 'center' };
  card5Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEOUDI_GREEN } };

  const card5Val = sheet.getCell('M5');
  card5Val.value = `${complianceRate}% قانوني`;
  card5Val.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF065F46' } };
  card5Val.alignment = { vertical: 'middle', horizontal: 'center' };
  card5Val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };

  // Add thin borders to cards
  ['A4', 'D4', 'G4', 'J4', 'M4', 'A5', 'D5', 'G5', 'J5', 'M5'].forEach((cRef) => {
    const c = sheet.getCell(cRef);
    c.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Row 6: Blank separator
  sheet.addRow([]);
  sheet.getRow(6).height = 12;

  // Row 7: Section Header for Fleet Table
  const tableTitle = sheet.addRow(['قائمة بيانات وتراخيص سيارات التوصيل وفروع سعودي سوبر ماركت']);
  sheet.mergeCells('A7:O7');
  tableTitle.height = 24;
  const tableTitleCell = sheet.getCell('A7');
  tableTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  tableTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUBHEADER_FILL } };
  tableTitleCell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };

  // Row 8: Table Header Columns
  const headers = [
    'م',
    'رقم اللوحة / السيارة',
    'موديل السيارة',
    'فرع سعودي التابع له',
    'رقم رخصة المرور (مصر)',
    'تاريخ إصدار المرور',
    'تاريخ انتهاء المرور',
    'الأيام المتبقية (مرور)',
    'حالة رخصة المرور',
    'رقم تصريح الإعلان (محليات)',
    'تاريخ إصدار الإعلان',
    'تاريخ انتهاء الإعلان',
    'الأيام المتبقية (إعلان)',
    'حالة تصريح الإعلان',
    'ملاحظات التشغيل والصيانة'
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.height = 32;

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    
    // Group headers by section color
    if (colNumber <= 4) {
      // Vehicle Info: Dark Slate
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    } else if (colNumber >= 5 && colNumber <= 9) {
      // Traffic License: Dark Emerald Green
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
    } else if (colNumber >= 10 && colNumber <= 14) {
      // Commercial Advertising License: Dark Blue / Indigo
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF312E81' } };
    } else {
      // Notes: Slate
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    }

    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FF64748B' } },
      right: { style: 'thin', color: { argb: 'FF64748B' } },
    };
  });

  // Table Data Rows
  vehicles.forEach((v, idx) => {
    const rawTDays = calculateRemainingDays(v.trafficLicense?.expiryDate, referenceDate);
    const tDays = isNaN(rawTDays) ? 0 : rawTDays;
    const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
    const tStatLabel = tStat === 'valid' ? 'سارية ومطابقة' : tStat === 'expiring_soon' ? 'وشيكة الانتهاء' : 'منتهية الصلاحية';

    const rawCDays = calculateRemainingDays(v.commercialLicense?.expiryDate, referenceDate);
    const cDays = isNaN(rawCDays) ? 0 : rawCDays;
    const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
    const cStatLabel = cStat === 'valid' ? 'سارية ومطابقة' : cStat === 'expiring_soon' ? 'وشيكة الانتهاء' : 'منتهية الصلاحية';

    const rowData = [
      idx + 1,
      `${v.plateLetters || ''} ${v.vehicleNumber}`.trim(),
      v.model || '—',
      v.branch || '—',
      v.trafficLicense?.licenseNumber || '—',
      formatDateWithDayName(v.trafficLicense?.issueDate),
      formatDateWithDayName(v.trafficLicense?.expiryDate),
      tDays,
      tStatLabel,
      v.commercialLicense?.licenseNumber || '—',
      formatDateWithDayName(v.commercialLicense?.issueDate),
      formatDateWithDayName(v.commercialLicense?.expiryDate),
      cDays,
      cStatLabel,
      v.notes || '—'
    ];

    const dataRow = sheet.addRow(rowData);
    dataRow.height = 24;

    const isEven = idx % 2 === 0;
    const defaultBg = isEven ? 'FFFFFFFF' : ZEBRA_LIGHT;

    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
      };

      // Alignment customizations
      if (colNumber === 2) {
        // Vehicle Plate Number (Bold)
        cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colNumber === 4) {
        // Branch (Bold Seoudi text)
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } };
      } else if (colNumber === 15) {
        // Notes: right-aligned
        cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
      }

      // Column 8: Traffic Remaining Days styling
      if (colNumber === 8) {
        cell.font = { name: 'Calibri', size: 10.5, bold: true };
        if (tStat === 'expired') {
          cell.font.color = { argb: 'FFE11D48' }; // Rose
        } else if (tStat === 'expiring_soon') {
          cell.font.color = { argb: 'FFB45309' }; // Amber
        } else {
          cell.font.color = { argb: 'FF047857' }; // Emerald
        }
      }

      // Column 9: Traffic Status Badge Cell
      if (colNumber === 9) {
        cell.font = { name: 'Calibri', size: 10, bold: true };
        if (tStat === 'valid') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // Light Emerald
          cell.font.color = { argb: 'FF065F46' };
        } else if (tStat === 'expiring_soon') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Light Amber
          cell.font.color = { argb: 'FF92400E' };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } }; // Light Rose
          cell.font.color = { argb: 'FF9F1239' };
        }
      }

      // Column 13: Commercial Remaining Days styling
      if (colNumber === 13) {
        cell.font = { name: 'Calibri', size: 10.5, bold: true };
        if (cStat === 'expired') {
          cell.font.color = { argb: 'FFE11D48' };
        } else if (cStat === 'expiring_soon') {
          cell.font.color = { argb: 'FFB45309' };
        } else {
          cell.font.color = { argb: 'FF047857' };
        }
      }

      // Column 14: Commercial Status Badge Cell
      if (colNumber === 14) {
        cell.font = { name: 'Calibri', size: 10, bold: true };
        if (cStat === 'valid') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
          cell.font.color = { argb: 'FF065F46' };
        } else if (cStat === 'expiring_soon') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          cell.font.color = { argb: 'FF92400E' };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
          cell.font.color = { argb: 'FF9F1239' };
        }
      }
    });
  });

  // Footer Row: Official Signature & Verification Block
  const footerStart = sheet.rowCount + 2;
  const footerRow = sheet.getRow(footerStart);
  footerRow.getCell(2).value = 'اعتماد مدير الحركة والأسطول: ..............................';
  footerRow.getCell(6).value = 'اعتماد مدير الشؤون الإدارية: ..............................';
  footerRow.getCell(11).value = `تاريخ استخراج التقرير: ${new Date().toLocaleDateString('ar-EG')}`;
  
  [2, 6, 11].forEach((colIdx) => {
    const c = footerRow.getCell(colIdx);
    c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF475569' } };
  });

  // Column Widths Customization
  sheet.columns = [
    { key: 'index', width: 6 },   // م
    { key: 'plate', width: 22 },  // رقم اللوحة / السيارة
    { key: 'model', width: 20 },  // موديل السيارة
    { key: 'branch', width: 24 }, // الفرع
    { key: 'tNum', width: 22 },   // رقم رخصة المرور
    { key: 'tIssue', width: 22 }, // إصدار المرور
    { key: 'tExp', width: 24 },   // انتهاء المرور
    { key: 'tDays', width: 18 },  // أيام مرور
    { key: 'tStat', width: 20 },  // حالة رخصة المرور
    { key: 'cNum', width: 22 },   // رقم تصريح إعلان
    { key: 'cIssue', width: 22 }, // إصدار إعلان
    { key: 'cExp', width: 24 },   // انتهاء إعلان
    { key: 'cDays', width: 18 },  // أيام إعلان
    { key: 'cStat', width: 20 },  // حالة تصريح إعلان
    { key: 'notes', width: 30 },  // ملاحظات
  ];

  // ==========================================
  // SHEET 2: ملخص الرخص المتأخرة والوشيكة (Executive Action Items)
  // ==========================================
  const urgentVehicles = vehicles.filter((v) => {
    const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
    const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
    return tStat === 'expired' || tStat === 'expiring_soon' || cStat === 'expired' || cStat === 'expiring_soon';
  });

  if (urgentVehicles.length > 0) {
    const urgentSheet = workbook.addWorksheet('إجراءات عاجلة (المنتهية والوشيكة)', {
      pageSetup: { orientation: 'landscape', paperSize: 9 },
    });
    urgentSheet.views = [{ rightToLeft: true, showGridLines: true } as any];

    // Header banner
    const uHeader = urgentSheet.addRow(['قائمة الرخص التي تتطلب إجراءات تجديد فورية — سعودي سوبر ماركت']);
    urgentSheet.mergeCells('A1:J1');
    uHeader.height = 34;
    const uHeaderCell = urgentSheet.getCell('A1');
    uHeaderCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    uHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } }; // Deep Red
    uHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };

    urgentSheet.addRow([]);

    const uColHeaders = [
      'م',
      'رقم السيارة',
      'الفرع',
      'نوع الرخصة المعنية',
      'رقم الرخصة / التصريح',
      'تاريخ الانتهاء',
      'الأيام المتبقية',
      'الحالة الحالية',
      'الإجراء المطلوب من الفرع',
      'مسؤول المتابعة'
    ];

    const uColRow = urgentSheet.addRow(uColHeaders);
    uColRow.height = 28;
    uColRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });

    let uIdx = 1;
    urgentVehicles.forEach((v) => {
      const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
      const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);

      if (tStat === 'expired' || tStat === 'expiring_soon') {
        const rawDays = calculateRemainingDays(v.trafficLicense?.expiryDate, referenceDate);
        const days = isNaN(rawDays) ? 0 : rawDays;
        const row = urgentSheet.addRow([
          uIdx++,
          `${v.plateLetters || ''} ${v.vehicleNumber}`.trim(),
          v.branch,
          'رخصة تسيير مرور (مصر)',
          v.trafficLicense?.licenseNumber || '—',
          formatDateWithDayName(v.trafficLicense?.expiryDate),
          days,
          tStat === 'expired' ? 'منتهية الصلاحية' : `وشيكة الانتهاء (${days} يوم)`,
          tStat === 'expired' ? 'سحب السيارة من خط التوزيع والتجديد فوراً' : 'بدء إجراءات الفحص الفني والتجديد',
          'مسؤول حركة الفرع'
        ]);
        row.height = 24;
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Calibri', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: BORDER_COLOR } },
            bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
            left: { style: 'thin', color: { argb: BORDER_COLOR } },
            right: { style: 'thin', color: { argb: BORDER_COLOR } },
          };
          if (colNumber === 8) {
            cell.font = { name: 'Calibri', size: 10, bold: true };
            if (tStat === 'expired') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
              cell.font.color = { argb: 'FF9F1239' };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
              cell.font.color = { argb: 'FF92400E' };
            }
          }
        });
      }

      if (cStat === 'expired' || cStat === 'expiring_soon') {
        const rawDays = calculateRemainingDays(v.commercialLicense?.expiryDate, referenceDate);
        const days = isNaN(rawDays) ? 0 : rawDays;
        const row = urgentSheet.addRow([
          uIdx++,
          `${v.plateLetters || ''} ${v.vehicleNumber}`.trim(),
          v.branch,
          'تصريح ملصق إعلان (محليات)',
          v.commercialLicense?.licenseNumber || '—',
          formatDateWithDayName(v.commercialLicense?.expiryDate),
          days,
          cStat === 'expired' ? 'منتهي الصلاحية' : `وشيك الانتهاء (${days} يوم)`,
          cStat === 'expired' ? 'إزالة الملصق أو سداد رسوم المحليات فوراً' : 'سداد الرسوم بالحي التابع له وتجديد الإيصال',
          'الشؤون القانونية والإدارية'
        ]);
        row.height = 24;
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Calibri', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: BORDER_COLOR } },
            bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
            left: { style: 'thin', color: { argb: BORDER_COLOR } },
            right: { style: 'thin', color: { argb: BORDER_COLOR } },
          };
          if (colNumber === 8) {
            cell.font = { name: 'Calibri', size: 10, bold: true };
            if (cStat === 'expired') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
              cell.font.color = { argb: 'FF9F1239' };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
              cell.font.color = { argb: 'FF92400E' };
            }
          }
        });
      }
    });

    urgentSheet.columns = [
      { width: 6 },
      { width: 20 },
      { width: 22 },
      { width: 24 },
      { width: 22 },
      { width: 24 },
      { width: 16 },
      { width: 24 },
      { width: 38 },
      { width: 24 },
    ];
  }

  // ==========================================
  // SHEET 3: إحصائيات توزيع الفروع (Branch Analytics)
  // ==========================================
  const branchMap: { [branch: string]: { total: number; valid: number; expiring: number; expired: number } } = {};
  vehicles.forEach((v) => {
    const b = v.branch || 'غير محدد';
    if (!branchMap[b]) {
      branchMap[b] = { total: 0, valid: 0, expiring: 0, expired: 0 };
    }
    branchMap[b].total++;
    const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
    const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
    if (tStat === 'expired' || cStat === 'expired') {
      branchMap[b].expired++;
    } else if (tStat === 'expiring_soon' || cStat === 'expiring_soon') {
      branchMap[b].expiring++;
    } else {
      branchMap[b].valid++;
    }
  });

  const branchSheet = workbook.addWorksheet('إحصائيات الفروع');
  branchSheet.views = [{ rightToLeft: true, showGridLines: true } as any];

  const bHeader = branchSheet.addRow(['إحصائيات ومؤشرات التزام الفروع — أسطول سعودي سوبر ماركت']);
  branchSheet.mergeCells('A1:F1');
  bHeader.height = 32;
  const bHeaderCell = branchSheet.getCell('A1');
  bHeaderCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  bHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
  bHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };

  branchSheet.addRow([]);

  const bCols = ['م', 'اسم الفرع', 'إجمالي السيارات', 'سيارات مطابقة 100%', 'تحتوي رخص وشيكة', 'تحتوي رخص منتهية'];
  const bColRow = branchSheet.addRow(bCols);
  bColRow.height = 26;
  bColRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  let bIdx = 1;
  Object.entries(branchMap).forEach(([branchName, stats]) => {
    const row = branchSheet.addRow([
      bIdx++,
      branchName,
      stats.total,
      stats.valid,
      stats.expiring,
      stats.expired,
    ]);
    row.height = 22;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
      };
      if (colNum === 2) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      }
      if (colNum === 4 && stats.valid > 0) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
      }
      if (colNum === 5 && stats.expiring > 0) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB45309' } };
      }
      if (colNum === 6 && stats.expired > 0) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFE11D48' } };
      }
    });
  });

  branchSheet.columns = [
    { width: 6 },
    { width: 28 },
    { width: 18 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
  ];

  // Write file buffer and trigger download in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
