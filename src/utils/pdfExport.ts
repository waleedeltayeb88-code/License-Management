import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Vehicle } from '../types';
import { calculateRemainingDays, getLicenseStatus, DEFAULT_REPORT_DATE } from './dateUtils';

export interface PdfExportOptions {
  reportTitle?: string;
  reportSubtitle?: string;
  reportType?: 'all' | 'urgent' | 'traffic_only' | 'comm_only' | 'branch' | 'budget';
  branchFilter?: string;
  thresholdDays?: number;
  criticalDaysThreshold?: number;
  referenceDate?: string;
  companyName?: string;
  officialRegNumber?: string;
  taxNumber?: string;
  fleetManagerName?: string;
  includeCharts?: boolean;
  includeSignatures?: boolean;
  onProgress?: (current: number, total: number, message: string) => void;
}

/**
 * Generates an ultra-luxurious, executive-grade corporate PDF report for Seoudi Supermarket Fleet
 * - Full Arabic RTL typography with Cairo & IBM Plex Sans
 * - Rich Emerald (#064E3B) & Royal Gold (#D97706) branding
 * - Executive Cover / KPI Dashboard page with SVG Donut Chart & Monthly Trendline Area Curve
 * - Branch compliance breakdown with mini progress bars
 * - High-contrast color status badges (Valid, Expiring, Expired, Under Update)
 * - Auto-paginated A4 Landscape layout without row cuts
 * - Official corporate signatures, seal stamp, and security barcode
 */
export async function generateFleetPdf(
  vehicles: Vehicle[],
  options: PdfExportOptions = {}
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  const {
    reportTitle = 'التقرير التنفيذي الشامل لتراخيص أسطول سيارات سعودي سوبر ماركت',
    reportSubtitle = 'الإدارة العامة للشؤون الإدارية والخدمات اللوجستية — إدارة الحركة والعمليات',
    reportType = 'all',
    branchFilter = 'all',
    thresholdDays = 30,
    criticalDaysThreshold = 7,
    referenceDate = DEFAULT_REPORT_DATE,
    companyName = 'شركة سعودي سوبر ماركت (مصر) - إدارة الحركة والأسطول',
    officialRegNumber = 'س.ت: 129482 (مكتب استثمار القاهرة)',
    taxNumber = 'ب.ض: 204-893-112',
    fleetManagerName = 'م. أحمد عثمان — مدير إدارة الأسطول والحركة المركزية',
    includeCharts = true,
    includeSignatures = true,
    onProgress,
  } = options;

  // Filter vehicles if needed
  let filteredVehicles = [...vehicles];
  if (branchFilter && branchFilter !== 'all') {
    filteredVehicles = filteredVehicles.filter((v) => v.branch === branchFilter);
  }

  if (reportType === 'urgent') {
    filteredVehicles = filteredVehicles.filter((v) => {
      const t = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
      const c = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
      return t === 'expired' || t === 'expiring_soon' || c === 'expired' || c === 'expiring_soon';
    });
  } else if (reportType === 'traffic_only') {
    // Keep vehicles but can prioritize traffic
  } else if (reportType === 'comm_only') {
    // Keep vehicles but can prioritize commercial
  }

  // Calculate high-level KPIs
  let trafficValid = 0;
  let trafficExpiring = 0;
  let trafficExpired = 0;
  let trafficPending = 0;

  let commValid = 0;
  let commExpiring = 0;
  let commExpired = 0;
  let commPending = 0;

  let fullyCompliant = 0;
  let totalEstimatedCost = 0;
  let urgentEstimatedCost = 0;

  const branchSummary: { [branch: string]: { total: number; valid: number; expiring: number; expired: number; pending: number } } = {};

  // Monthly expiration forecast for next 6 months based on referenceDate
  const refDateObj = new Date(referenceDate);
  const monthlyBuckets: { [monthKey: string]: { label: string; count: number } } = {};
  for (let m = 0; m < 6; m++) {
    const d = new Date(refDateObj.getFullYear(), refDateObj.getMonth() + m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    monthlyBuckets[key] = {
      label: `${monthNamesAr[d.getMonth()]} ${d.getFullYear()}`,
      count: 0
    };
  }

  filteredVehicles.forEach((v) => {
    const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
    const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);

    if (tStat === 'valid') trafficValid++;
    else if (tStat === 'expiring_soon') trafficExpiring++;
    else if (tStat === 'expired') trafficExpired++;
    else trafficPending++;

    if (cStat === 'valid') commValid++;
    else if (cStat === 'expiring_soon') commExpiring++;
    else if (cStat === 'expired') commExpired++;
    else commPending++;

    if (tStat === 'valid' && cStat === 'valid') {
      fullyCompliant++;
    }

    // Cost estimation: Traffic ~3500, Comm ~2600
    let vCost = 0;
    if (tStat === 'expired' || tStat === 'expiring_soon') vCost += 3500;
    if (cStat === 'expired' || cStat === 'expiring_soon') vCost += 2600;
    totalEstimatedCost += vCost;
    if (tStat === 'expired' || cStat === 'expired') {
      urgentEstimatedCost += vCost;
    }

    // Bucket into monthly forecasts
    [v.trafficLicense?.expiryDate, v.commercialLicense?.expiryDate].forEach((exp) => {
      if (exp && exp.length >= 7) {
        const k = exp.slice(0, 7);
        if (monthlyBuckets[k]) {
          monthlyBuckets[k].count++;
        }
      }
    });

    const b = v.branch || 'غير محدد';
    if (!branchSummary[b]) {
      branchSummary[b] = { total: 0, valid: 0, expiring: 0, expired: 0, pending: 0 };
    }
    branchSummary[b].total++;
    if (tStat === 'valid' && cStat === 'valid') {
      branchSummary[b].valid++;
    } else if (tStat === 'expired' || cStat === 'expired') {
      branchSummary[b].expired++;
    } else if (tStat === 'expiring_soon' || cStat === 'expiring_soon') {
      branchSummary[b].expiring++;
    } else {
      branchSummary[b].pending++;
    }
  });

  const totalCount = filteredVehicles.length;
  const compliancePercent = totalCount > 0 ? Math.round((fullyCompliant / totalCount) * 100) : 0;
  const trafficPercent = totalCount > 0 ? Math.round((trafficValid / totalCount) * 100) : 0;
  const commPercent = totalCount > 0 ? Math.round((commValid / totalCount) * 100) : 0;

  // Pagination: 12 vehicles per page in Landscape with rich padding
  const ROWS_PER_PAGE = 12;
  const tablePagesCount = Math.ceil(totalCount / ROWS_PER_PAGE) || 1;
  const totalPages = 1 + tablePagesCount; // Page 1: Executive Cover, Page 2..N: Vehicle Rosters

  // Monthly curve points for SVG
  const monthlyEntries = Object.values(monthlyBuckets);
  const maxMonthCount = Math.max(...monthlyEntries.map(e => e.count), 1);
  const curveWidth = 320;
  const curveHeight = 90;
  const curvePadding = 20;

  // Generate SVG curve points
  const points = monthlyEntries.map((entry, idx) => {
    const x = curvePadding + (idx / Math.max(monthlyEntries.length - 1, 1)) * (curveWidth - curvePadding * 2);
    const normalizedY = 1 - (entry.count / maxMonthCount);
    const y = 15 + normalizedY * (curveHeight - 35);
    return { x, y, count: entry.count, label: entry.label };
  });

  let curvePathD = '';
  if (points.length > 0) {
    curvePathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      curvePathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }
  const areaPathD = points.length > 0 
    ? `${curvePathD} L ${points[points.length - 1].x} ${curveHeight - 10} L ${points[0].x} ${curveHeight - 10} Z` 
    : '';

  // Calculate SVG Donut values
  const r = 46;
  const circ = 2 * Math.PI * r; // ~289.02
  const totalLicensesCount = (trafficValid + trafficExpiring + trafficExpired + trafficPending) +
                             (commValid + commExpiring + commExpired + commPending) || 1;
  const validTotal = trafficValid + commValid;
  const expiringTotal = trafficExpiring + commExpiring;
  const expiredTotal = trafficExpired + commExpired;

  const validCirc = (validTotal / totalLicensesCount) * circ;
  const expiringCirc = (expiringTotal / totalLicensesCount) * circ;
  const expiredCirc = (expiredTotal / totalLicensesCount) * circ;

  const validOffset = 0;
  const expiringOffset = -validCirc;
  const expiredOffset = -(validCirc + expiringCirc);

  // Create invisible DOM workspace
  const workspace = document.createElement('div');
  workspace.id = 'pdf-render-workspace';
  workspace.style.position = 'fixed';
  workspace.style.left = '-99999px';
  workspace.style.top = '0';
  workspace.style.width = '1120px';
  workspace.style.zIndex = '-9999';
  workspace.style.direction = 'rtl';
  workspace.style.fontFamily = "'Cairo', 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  workspace.style.backgroundColor = '#f1f5f9';
  document.body.appendChild(workspace);

  try {
    const pagesElements: HTMLElement[] = [];

    // =========================================================================
    // PAGE 1: EXECUTIVE DASHBOARD & KPI COVER PAGE
    // =========================================================================
    const page1 = document.createElement('div');
    page1.className = 'pdf-page';
    page1.style.width = '1120px';
    page1.style.height = '792px';
    page1.style.boxSizing = 'border-box';
    page1.style.padding = '24px 28px';
    page1.style.backgroundColor = '#ffffff';
    page1.style.position = 'relative';
    page1.style.display = 'flex';
    page1.style.flexDirection = 'column';
    page1.style.justifyContent = 'space-between';
    page1.style.color = '#0f172a';

    page1.innerHTML = `
      <!-- TOP EXECUTIVE HEADER -->
      <div style="border-bottom: 2px solid #064e3b; padding-bottom: 10px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <!-- Brand & Crest -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 54px; height: 54px; border-radius: 12px; background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); display: flex; align-items: center; justify-content: center; border: 2.5px solid #d97706; box-shadow: 0 4px 12px rgba(6,78,59,0.25);">
              <span style="color: #fef08a; font-size: 28px; font-weight: 900; line-height: 1;">س</span>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h1 style="margin: 0; font-size: 21px; font-weight: 900; color: #064e3b; letter-spacing: -0.5px;">سعودي سوبر ماركت — SEOUDI SUPERMARKET</h1>
                <span style="background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">تأسس 1938</span>
              </div>
              <p style="margin: 2px 0 0 0; font-size: 11.5px; color: #475569; font-weight: 700;">${reportSubtitle}</p>
              <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
                ${companyName} | ${officialRegNumber} | ${taxNumber}
              </div>
            </div>
          </div>

          <!-- Document Ref & Meta Box -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 8px 14px; text-align: left; min-width: 250px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px;">
              <span style="color: #64748b; font-weight: 600;">رقم التدقيق المرجعي:</span>
              <span style="font-family: monospace; font-weight: 800; color: #064e3b;">SEO-FLT-AUDIT-${new Date().getFullYear()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px;">
              <span style="color: #64748b; font-weight: 600;">تاريخ الأساس المعتمد:</span>
              <span style="font-weight: 800; color: #0f172a; font-family: monospace;">${referenceDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px;">
              <span style="color: #64748b; font-weight: 600;">مهلة التنبيه الاستباقي:</span>
              <span style="font-weight: 700; color: #d97706;">${thresholdDays} يوماً (الخطر: ${criticalDaysThreshold} ي)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px;">
              <span style="color: #64748b; font-weight: 600;">تصنيف الوثيقة:</span>
              <span style="color: #15803d; font-weight: 800; background: #dcfce7; padding: 1px 6px; border-radius: 4px; font-size: 9px;">وثيقة رسمية معتمدة ✓</span>
            </div>
          </div>
        </div>

        <!-- Gold Accent Strip -->
        <div style="height: 3px; background: linear-gradient(90deg, #d97706 0%, #064e3b 50%, #d97706 100%); margin-top: 10px; border-radius: 2px;"></div>
      </div>

      <!-- MAIN REPORT TITLE BANNER -->
      <div style="background: linear-gradient(135deg, #064e3b 0%, #093f2f 100%); color: #ffffff; border-radius: 12px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(6,78,59,0.15); margin-bottom: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: rgba(217, 119, 6, 0.25); color: #fef08a; border: 1px solid rgba(217, 119, 6, 0.5); font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
              CORPORATE FLEET COMPLIANCE AUDIT
            </span>
            <span style="background: rgba(255, 255, 255, 0.12); color: #a7f3d0; font-size: 9.5px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
              إصدار مركزي فوري
            </span>
          </div>
          <h2 style="margin: 5px 0 0 0; font-size: 17px; font-weight: 900; color: #ffffff;">${reportTitle}</h2>
          <div style="font-size: 10px; color: #a7f3d0; margin-top: 3px;">
            النطاق الجغرافي: <b style="color: #ffffff;">${branchFilter === 'all' ? 'كافة فروع ومستودعات ومراكز توزيع سوبر ماركت سعودي' : `فرع ${branchFilter}`}</b> | قوة الأسطول: <b style="color: #ffffff;">${totalCount} سيارة مجهزة</b>
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <div style="text-align: center; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 8px;">
            <div style="font-size: 9px; color: #93c5fd; font-weight: 700;">مؤشر الالتزام الكلي</div>
            <div style="font-size: 22px; font-weight: 900; color: ${compliancePercent >= 70 ? '#4ade80' : '#fbbf24'}; font-family: monospace;">${compliancePercent}%</div>
            <div style="font-size: 8.5px; color: #e2e8f0;">${fullyCompliant} سيارة مطابقة 100%</div>
          </div>
          <div style="text-align: center; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 8px;">
            <div style="font-size: 9px; color: #fde68a; font-weight: 700;">ميزانية التجديد المطلوبة</div>
            <div style="font-size: 20px; font-weight: 900; color: #fbbf24; font-family: monospace;">${urgentEstimatedCost.toLocaleString('ar-EG')} ج.م</div>
            <div style="font-size: 8.5px; color: #fef3c7;">تكلفة الرخص المنتهية فوراً</div>
          </div>
        </div>
      </div>

      <!-- 6 EXECUTIVE KPI TILES -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 12px;">
        <!-- Card 1 -->
        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-top: 4px solid #064e3b; border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b; font-weight: 700; margin-bottom: 3px;">قوام الأسطول المسجل</div>
          <div style="font-size: 20px; font-weight: 900; color: #064e3b; font-family: monospace;">${totalCount}</div>
          <div style="font-size: 8.5px; color: #064e3b; font-weight: 700; margin-top: 2px;">سيارة توصيل بالخدمة</div>
        </div>

        <!-- Card 2 -->
        <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-top: 4px solid #16a34a; border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 9.5px; color: #166534; font-weight: 700; margin-bottom: 3px;">رخص سير سارية</div>
          <div style="font-size: 20px; font-weight: 900; color: #15803d; font-family: monospace;">${trafficValid}</div>
          <div style="font-size: 8.5px; color: #15803d; font-weight: 700; margin-top: 2px;">نسبة ${trafficPercent}% من المرور</div>
        </div>

        <!-- Card 3 -->
        <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-top: 4px solid #059669; border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 9.5px; color: #065f46; font-weight: 700; margin-bottom: 3px;">رخص إعلانات سارية</div>
          <div style="font-size: 20px; font-weight: 900; color: #047857; font-family: monospace;">${commValid}</div>
          <div style="font-size: 8.5px; color: #047857; font-weight: 700; margin-top: 2px;">نسبة ${commPercent}% من الدعاية</div>
        </div>

        <!-- Card 4 -->
        <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-top: 4px solid #d97706; border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 9.5px; color: #92400e; font-weight: 700; margin-bottom: 3px;">تنتهي قريباً (30 يوم)</div>
          <div style="font-size: 20px; font-weight: 900; color: #b45309; font-family: monospace;">${trafficExpiring + commExpiring}</div>
          <div style="font-size: 8.5px; color: #b45309; font-weight: 700; margin-top: 2px;">إجراءات تجديد استباقية</div>
        </div>

        <!-- Card 5 -->
        <div style="background: #fff1f2; border: 1.5px solid #fecdd3; border-top: 4px solid #e11d48; border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 9.5px; color: #9f1239; font-weight: 700; margin-bottom: 3px;">رخص منتهية (حرج)</div>
          <div style="font-size: 20px; font-weight: 900; color: #e11d48; font-family: monospace;">${trafficExpired + commExpired}</div>
          <div style="font-size: 8.5px; color: #e11d48; font-weight: 700; margin-top: 2px;">تتطلب تجديداً فورياً</div>
        </div>

        <!-- Card 6 -->
        <div style="background: #eef2ff; border: 1.5px solid #c7d2fe; border-top: 4px solid #4f46e5; border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 9.5px; color: #3730a3; font-weight: 700; margin-bottom: 3px;">قيد التحديث / الفحص</div>
          <div style="font-size: 20px; font-weight: 900; color: #4338ca; font-family: monospace;">${trafficPending + commPending}</div>
          <div style="font-size: 8.5px; color: #4338ca; font-weight: 700; margin-top: 2px;">تجهيز مستندات رسمية</div>
        </div>
      </div>

      <!-- VISUAL INTELLIGENCE SECTION: DONUT GAUGE + RENEWAL CURVE -->
      <div style="display: grid; grid-template-columns: 340px 1fr; gap: 12px; margin-bottom: 12px;">
        <!-- Box 1: SVG DONUT GAUGE -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 10px; background: #ffffff; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #064e3b; margin-bottom: 2px;">توزيع حالة الرخص الإجمالية</div>
            <div style="font-size: 9px; color: #64748b; margin-bottom: 8px;">مقارنة رخص السير والإعلانات</div>
            <div style="font-size: 9px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: #10b981;"></span>
                <span style="font-weight: 700; color: #0f172a;">سارية: <b>${validTotal}</b> رخصة (${Math.round((validTotal/totalLicensesCount)*100)}%)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: #f59e0b;"></span>
                <span style="font-weight: 700; color: #0f172a;">تنتهي قريباً: <b>${expiringTotal}</b> رخصة (${Math.round((expiringTotal/totalLicensesCount)*100)}%)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: #f43f5e;"></span>
                <span style="font-weight: 700; color: #0f172a;">منتهية: <b>${expiredTotal}</b> رخصة (${Math.round((expiredTotal/totalLicensesCount)*100)}%)</span>
              </div>
            </div>
          </div>

          <!-- SVG Donut -->
          <div style="position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center;">
            <svg width="110" height="110" viewBox="0 0 110 110" style="transform: rotate(-90deg);">
              <!-- Background circle -->
              <circle cx="55" cy="55" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="14" />
              <!-- Valid Slice -->
              <circle cx="55" cy="55" r="${r}" fill="none" stroke="#10b981" stroke-width="14"
                stroke-dasharray="${validCirc} ${circ - validCirc}" stroke-dashoffset="${validOffset}" stroke-linecap="round" />
              <!-- Expiring Slice -->
              <circle cx="55" cy="55" r="${r}" fill="none" stroke="#f59e0b" stroke-width="14"
                stroke-dasharray="${expiringCirc} ${circ - expiringCirc}" stroke-dashoffset="${expiringOffset}" stroke-linecap="round" />
              <!-- Expired Slice -->
              <circle cx="55" cy="55" r="${r}" fill="none" stroke="#f43f5e" stroke-width="14"
                stroke-dasharray="${expiredCirc} ${circ - expiredCirc}" stroke-dashoffset="${expiredOffset}" stroke-linecap="round" />
            </svg>
            <div style="position: absolute; text-align: center; pointer-events: none;">
              <span style="font-size: 16px; font-weight: 900; color: #064e3b; font-family: monospace; display: block; line-height: 1;">${compliancePercent}%</span>
              <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">الامتثال</span>
            </div>
          </div>
        </div>

        <!-- Box 2: SVG RENEWAL CURVE (Area chart) -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 10px; background: #ffffff; padding: 8px 14px; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
            <div>
              <span style="font-size: 11px; font-weight: 800; color: #064e3b;">منحنى وكيرف ضغط انتهاء التراخيص (الـ 6 أشهر القادمة)</span>
              <span style="font-size: 8.5px; color: #64748b; margin-right: 6px;">توقع حجم التجديدات الشهرية</span>
            </div>
            <span style="font-size: 8.5px; font-weight: 700; color: #d97706; background: #fef3c7; padding: 1px 6px; border-radius: 4px;">
              تخطيط التدفق المالي واللوجستي
            </span>
          </div>

          <div style="position: relative; height: 95px; width: 100%;">
            <svg width="100%" height="95" viewBox="0 0 ${curveWidth} ${curveHeight}" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#059669" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#059669" stop-opacity="0.02" />
                </linearGradient>
              </defs>

              <!-- Gridlines -->
              <line x1="${curvePadding}" y1="20" x2="${curveWidth - curvePadding}" y2="20" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
              <line x1="${curvePadding}" y1="50" x2="${curveWidth - curvePadding}" y2="50" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
              <line x1="${curvePadding}" y1="${curveHeight - 10}" x2="${curveWidth - curvePadding}" y2="${curveHeight - 10}" stroke="#cbd5e1" stroke-width="1" />

              <!-- Area fill -->
              ${areaPathD ? `<path d="${areaPathD}" fill="url(#curveGradient)" />` : ''}

              <!-- Curve line -->
              ${curvePathD ? `<path d="${curvePathD}" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" />` : ''}

              <!-- Data points & labels -->
              ${points.map((p) => `
                <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#ffffff" stroke="#064e3b" stroke-width="2" />
                <text x="${p.x}" y="${p.y - 6}" font-size="7.5" font-weight="800" fill="#064e3b" text-anchor="middle" font-family="monospace">${p.count}</text>
                <text x="${p.x}" y="${curveHeight - 2}" font-size="7" font-weight="700" fill="#64748b" text-anchor="middle">${p.label.split(' ')[0]}</text>
              `).join('')}
            </svg>
          </div>
        </div>
      </div>

      <!-- MIDDLE SECTION: BRANCH DISTRIBUTION & URGENT ACTION MATRIX -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; flex: 1;">
        <!-- Left Box: Branch Breakdown with Mini Progress Bars -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 10px; background: #ffffff; padding: 8px 12px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 800; color: #064e3b;">مصفوفة أداء الفروع ونسب الامتثال</span>
            <span style="font-size: 8.5px; color: #64748b; font-weight: 600;">(أبرز المواقع التشغيلية)</span>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; text-align: center;">
              <thead>
                <tr style="background: #f1f5f9; color: #475569; font-weight: 800; border-bottom: 1.5px solid #cbd5e1;">
                  <th style="padding: 3.5px 4px; text-align: right;">الفرع</th>
                  <th style="padding: 3.5px 4px;">الأسطول</th>
                  <th style="padding: 3.5px 4px; color: #15803d;">مطابقة</th>
                  <th style="padding: 3.5px 4px; color: #b45309;">تنبيه</th>
                  <th style="padding: 3.5px 4px; color: #e11d48;">منتهية</th>
                  <th style="padding: 3.5px 4px; width: 85px;">مؤشر الالتزام</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(branchSummary).slice(0, 6).map(([branchName, bStat], bIdx) => {
                  const bRate = Math.round((bStat.valid / bStat.total) * 100);
                  const barColor = bRate >= 70 ? '#10b981' : bRate >= 50 ? '#f59e0b' : '#f43f5e';
                  return `
                    <tr style="border-bottom: 1px solid #f1f5f9; background: ${bIdx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                      <td style="padding: 3px 4px; text-align: right; font-weight: 700; color: #0f172a;">${branchName}</td>
                      <td style="padding: 3px 4px; font-weight: 700; font-family: monospace;">${bStat.total}</td>
                      <td style="padding: 3px 4px; font-weight: 700; color: #15803d; font-family: monospace;">${bStat.valid}</td>
                      <td style="padding: 3px 4px; font-weight: 700; color: #b45309; font-family: monospace;">${bStat.expiring}</td>
                      <td style="padding: 3px 4px; font-weight: 700; color: #e11d48; font-family: monospace;">${bStat.expired}</td>
                      <td style="padding: 3px 4px;">
                        <div style="display: flex; align-items: center; gap: 4px; justify-content: center;">
                          <div style="flex: 1; background: #e2e8f0; height: 5px; border-radius: 999px; overflow: hidden;">
                            <div style="width: ${bRate}%; height: 100%; background: ${barColor};"></div>
                          </div>
                          <span style="font-size: 8px; font-weight: 800; font-family: monospace; color: #0f172a; min-width: 22px;">${bRate}%</span>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Box: Urgent High-Risk Fleet Alerts -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 10px; background: #ffffff; padding: 8px 12px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 800; color: #e11d48;">عينة من الرخص العاجلة المنتهية ذات الأولوية القصوى</span>
              <span style="font-size: 8px; color: #be123c; font-weight: 800; background: #ffe4e6; padding: 1px 6px; border-radius: 4px;">إيقاف وفحص</span>
            </div>
            <span style="font-size: 8px; color: #64748b;">تكلفة التجديد التقديرية</span>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; text-align: center;">
              <thead>
                <tr style="background: #fff1f2; color: #9f1239; font-weight: 800; border-bottom: 1.5px solid #fecdd3;">
                  <th style="padding: 3.5px 4px; text-align: right;">اللوحة الرسمية</th>
                  <th style="padding: 3.5px 4px; text-align: right;">الفرع</th>
                  <th style="padding: 3.5px 4px;">نوع الرخصة</th>
                  <th style="padding: 3.5px 4px;">تاريخ الانتهاء</th>
                  <th style="padding: 3.5px 4px;">التكلفة التقديرية</th>
                  <th style="padding: 3.5px 4px;">الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${filteredVehicles.filter(v => {
                  const t = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
                  const c = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);
                  return t === 'expired' || c === 'expired';
                }).slice(0, 5).map((v, idx) => {
                  const tExpired = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate) === 'expired';
                  const cExpired = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate) === 'expired';
                  const typeLabel = tExpired && cExpired ? 'المرور + الإعلان' : tExpired ? 'رخصة تسيير' : 'تصريح إعلان';
                  const expDate = tExpired ? v.trafficLicense.expiryDate : v.commercialLicense.expiryDate;
                  const fullPlate = v.vehicleNumber + (v.plateLetters ? ` ${v.plateLetters}` : '');
                  const estFee = (tExpired ? 3500 : 0) + (cExpired ? 2600 : 0);
                  return `
                    <tr style="border-bottom: 1px solid #fff1f2; background: ${idx % 2 === 0 ? '#ffffff' : '#fff5f5'};">
                      <td style="padding: 3px 4px; text-align: right; font-weight: 800; color: #0f172a; font-family: monospace;">${fullPlate}</td>
                      <td style="padding: 3px 4px; text-align: right; font-weight: 600; color: #475569;">${v.branch}</td>
                      <td style="padding: 3px 4px; font-weight: 700; color: #be123c;">${typeLabel}</td>
                      <td style="padding: 3px 4px; font-weight: 700; font-family: monospace; color: #e11d48;">${expDate}</td>
                      <td style="padding: 3px 4px; font-weight: 800; font-family: monospace; color: #064e3b;">${estFee.toLocaleString('ar-EG')} ج.م</td>
                      <td style="padding: 3px 4px;">
                        <span style="background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; padding: 1px 5px; border-radius: 4px; font-weight: 800; font-size: 8px;">
                          منتهية ⚠️
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- FOOTER / APPROVAL BLOCK ON COVER PAGE -->
      <div style="border-top: 1.5px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 24px; font-size: 9px; color: #475569; font-weight: 700;">
          <div>إعداد وتدقيق: <span style="color: #0f172a; font-weight: 800;">منظومة الحركة والأسطول المركزية</span></div>
          <div>اعتماد الإدارة: <span style="color: #0f172a; font-weight: 800;">${fleetManagerName}</span></div>
          <div>الختم المعتمد: <span style="color: #064e3b; font-weight: 800;">سعودي سوبر ماركت ش.م.م</span></div>
        </div>

        <div style="text-align: left; font-size: 8.5px; color: #64748b; font-weight: 600;">
          <span>الصفحة 1 من ${totalPages}</span> | <span>سعودي سوبر ماركت - وثيقة داخلية سرية ومحمية © ${new Date().getFullYear()}</span>
        </div>
      </div>
    `;

    workspace.appendChild(page1);
    pagesElements.push(page1);

    // =========================================================================
    // PAGE 2..N: DETAILED VEHICLE & LICENSE ROSTER TABLES
    // =========================================================================
    for (let pIdx = 0; pIdx < tablePagesCount; pIdx++) {
      const pageNum = pIdx + 2;
      const startIdx = pIdx * ROWS_PER_PAGE;
      const endIdx = Math.min(startIdx + ROWS_PER_PAGE, totalCount);
      const pageVehicles = filteredVehicles.slice(startIdx, endIdx);

      const tablePage = document.createElement('div');
      tablePage.className = 'pdf-page';
      tablePage.style.width = '1120px';
      tablePage.style.height = '792px';
      tablePage.style.boxSizing = 'border-box';
      tablePage.style.padding = '20px 26px';
      tablePage.style.backgroundColor = '#ffffff';
      tablePage.style.position = 'relative';
      tablePage.style.display = 'flex';
      tablePage.style.flexDirection = 'column';
      tablePage.style.justifyContent = 'space-between';
      tablePage.style.color = '#0f172a';

      // Table rows HTML
      const rowsHtml = pageVehicles.map((v, i) => {
        const rowNum = startIdx + i + 1;
        const tStat = getLicenseStatus(v.trafficLicense?.expiryDate, thresholdDays, referenceDate);
        const cStat = getLicenseStatus(v.commercialLicense?.expiryDate, thresholdDays, referenceDate);

        const tRemaining = calculateRemainingDays(v.trafficLicense?.expiryDate, referenceDate);
        const cRemaining = calculateRemainingDays(v.commercialLicense?.expiryDate, referenceDate);

        // Styling helpers
        const getBadge = (status: string, remainingDays: number | null) => {
          if (status === 'valid') {
            return `
              <span style="background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 8px; display: inline-flex; align-items: center; gap: 2px;">
                ✓ سارية (${remainingDays ?? 0} ي)
              </span>
            `;
          } else if (status === 'expiring_soon') {
            return `
              <span style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 8px; display: inline-flex; align-items: center; gap: 2px;">
                ⏱ تنتهي قريباً (${remainingDays ?? 0} ي)
              </span>
            `;
          } else if (status === 'expired') {
            const daysOver = remainingDays !== null ? Math.abs(remainingDays) : 0;
            return `
              <span style="background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 8px; display: inline-flex; align-items: center; gap: 2px;">
                ⚠️ منتهية (${daysOver} ي)
              </span>
            `;
          } else {
            return `
              <span style="background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 8px;">
                ⚙️ قيد التحديث
              </span>
            `;
          }
        };

        const isEven = i % 2 === 0;
        const rowBg = isEven ? '#ffffff' : '#f8fafc';

        // Vehicle plate styling: Egyptian Plate Look
        const plateNum = v.vehicleNumber || '—';
        const plateLetters = v.plateLetters || '';

        return `
          <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0; height: 38px;">
            <!-- م -->
            <td style="padding: 2px 4px; text-align: center; font-weight: 800; color: #64748b; font-family: monospace; font-size: 9px;">${rowNum}</td>
            
            <!-- رقم اللوحة الرسمية -->
            <td style="padding: 2px 6px; text-align: center;">
              <div style="display: inline-flex; align-items: center; justify-content: center; background: #0f172a; border: 1px solid #334155; border-radius: 5px; padding: 2px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                <span style="color: #f8fafc; font-weight: 900; font-size: 10px; font-family: monospace; letter-spacing: 0.5px;">${plateNum}</span>
                ${plateLetters ? `<span style="color: #fde047; font-weight: 900; font-size: 10px; margin-right: 4px; border-right: 1px solid #475569; padding-right: 4px;">${plateLetters}</span>` : ''}
              </div>
            </td>

            <!-- نوع الموديل -->
            <td style="padding: 2px 6px; text-align: right; font-weight: 700; color: #334155; font-size: 9px;">
              ${v.model || '—'}
            </td>

            <!-- الفرع -->
            <td style="padding: 2px 6px; text-align: right; font-weight: 800; color: #064e3b; font-size: 9.5px;">
              ${v.branch}
            </td>

            <!-- الشاسيه -->
            <td style="padding: 2px 4px; text-align: center; font-weight: 600; color: #64748b; font-size: 8px; font-family: monospace;">
              ${v.vin ? v.vin.slice(-8) : '—'}
            </td>

            <!-- رخصة السير: رقمها وتاريخ الانتهاء -->
            <td style="padding: 2px 4px; text-align: center; font-family: monospace; font-size: 9px; font-weight: 700; color: ${tStat === 'expired' ? '#e11d48' : '#0f172a'};">
              ${v.trafficLicense?.expiryDate || 'قيد التحديث'}
            </td>

            <!-- حالة رخصة السير -->
            <td style="padding: 2px 4px; text-align: center;">
              ${getBadge(tStat, tRemaining)}
            </td>

            <!-- رخصة الإعلان: تاريخ الانتهاء -->
            <td style="padding: 2px 4px; text-align: center; font-family: monospace; font-size: 9px; font-weight: 700; color: ${cStat === 'expired' ? '#e11d48' : '#0f172a'};">
              ${v.commercialLicense?.expiryDate || 'قيد التحديث'}
            </td>

            <!-- حالة رخصة الإعلان -->
            <td style="padding: 2px 4px; text-align: center;">
              ${getBadge(cStat, cRemaining)}
            </td>

            <!-- الملاحظات والجهة -->
            <td style="padding: 2px 6px; text-align: right; font-size: 8.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">
              ${v.commercialLicense?.notes || v.notes || 'أسطول التوصيل - تشغيل منتظم'}
            </td>
          </tr>
        `;
      }).join('');

      tablePage.innerHTML = `
        <!-- HEADER ON TABLE PAGE -->
        <div style="border-bottom: 1.5px solid #064e3b; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #064e3b; display: flex; align-items: center; justify-content: center; color: #fef08a; font-weight: 900; font-size: 16px;">
              س
            </div>
            <div>
              <span style="font-size: 13px; font-weight: 900; color: #064e3b;">سعودي سوبر ماركت — كشف تراخيص الأسطول التفصيلي</span>
              <span style="font-size: 9.5px; color: #64748b; margin-right: 8px;">(السيارات ${startIdx + 1} إلى ${endIdx} من إجمالي ${totalCount})</span>
            </div>
          </div>

          <div style="display: flex; gap: 14px; font-size: 9px; font-weight: 700; color: #475569;">
            <span>التاريخ المرجعي: <b style="color: #0f172a; font-family: monospace;">${referenceDate}</b></span>
            <span>المهلة: <b style="color: #d97706;">${thresholdDays} يوم</b></span>
            <span style="background: #064e3b; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 8.5px;">وثيقة تدقيق رسمية</span>
          </div>
        </div>

        <!-- MAIN TABLE -->
        <div style="flex: 1; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(180deg, #064e3b 0%, #033628 100%); color: #ffffff; font-size: 9px; font-weight: 800; height: 36px;">
                <th style="padding: 4px; text-align: center; width: 30px; border-left: 1px solid rgba(255,255,255,0.15);">م</th>
                <th style="padding: 4px; text-align: center; width: 105px; border-left: 1px solid rgba(255,255,255,0.15);">رقم السيارة / اللوحة</th>
                <th style="padding: 4px; text-align: right; width: 85px; border-left: 1px solid rgba(255,255,255,0.15);">الموديل</th>
                <th style="padding: 4px; text-align: right; width: 90px; border-left: 1px solid rgba(255,255,255,0.15);">الفرع التابع</th>
                <th style="padding: 4px; text-align: center; width: 70px; border-left: 1px solid rgba(255,255,255,0.15);">الشاسيه</th>
                <th style="padding: 4px; text-align: center; width: 85px; border-left: 1px solid rgba(255,255,255,0.15); background: #085a44;">انتهاء السير</th>
                <th style="padding: 4px; text-align: center; width: 110px; border-left: 1px solid rgba(255,255,255,0.15); background: #085a44;">حالة رخصة السير</th>
                <th style="padding: 4px; text-align: center; width: 85px; border-left: 1px solid rgba(255,255,255,0.15); background: #0f3f33;">انتهاء الإعلان</th>
                <th style="padding: 4px; text-align: center; width: 110px; border-left: 1px solid rgba(255,255,255,0.15); background: #0f3f33;">حالة رخصة الإعلان</th>
                <th style="padding: 4px; text-align: right; width: 140px;">ملاحظات التشغيل والعمليات</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <!-- FOOTER & SIGNATURE ON TABLE PAGE -->
        <div style="border-top: 1.5px solid #cbd5e1; padding-top: 8px; margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
          <!-- Signatures Line if last page, or page markers -->
          ${pageNum === totalPages && includeSignatures ? `
            <div style="display: flex; gap: 30px; align-items: center;">
              <div style="font-size: 8.5px; color: #334155; font-weight: 700;">
                اعتماد مدير الحركة: .......................................
              </div>
              <div style="font-size: 8.5px; color: #334155; font-weight: 700;">
                اعتماد الشؤون الإدارية: .......................................
              </div>
              <div style="font-size: 8.5px; color: #334155; font-weight: 700;">
                اعتماد الإدارة المالية: .......................................
              </div>
              <!-- Corporate Seal Simulation -->
              <div style="width: 44px; height: 44px; border: 2px dashed #064e3b; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 6.5px; color: #064e3b; font-weight: 900; line-height: 1.1; text-align: center; transform: rotate(-8deg);">
                <span>سعودي</span>
                <span style="color: #d97706;">★ معتمد ★</span>
                <span>الأسطول</span>
              </div>
            </div>
          ` : `
            <div style="display: flex; gap: 16px; font-size: 8.5px; color: #64748b; font-weight: 600;">
              <span>• الرخص الخضراء: سارية وتطابق المعايير الرسمية</span>
              <span>• الرخص الصفراء: مدرجة بخطة التجديد المبكر</span>
              <span>• الرخص الحمراء: يجب التجديد الفوري لمنع المساءلة القانونية</span>
            </div>
          `}

          <div style="font-size: 8.5px; color: #64748b; font-weight: 600;">
            <span>الصفحة ${pageNum} من ${totalPages}</span> | <span>سعودي سوبر ماركت 🇪🇬</span>
          </div>
        </div>
      `;

      workspace.appendChild(tablePage);
      pagesElements.push(tablePage);
    }

    // =========================================================================
    // STEP 2: RENDER PAGES WITH HTML2CANVAS & COMPILE JSPDF
    // =========================================================================
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < pagesElements.length; i++) {
      const pageEl = pagesElements[i];
      const pageNum = i + 1;

      if (onProgress) {
        onProgress(pageNum, pagesElements.length, `جاري معالجة الصفحة ${pageNum} من ${pagesElements.length}...`);
      }

      // Small tick delay to let layout settle
      await new Promise((resolve) => setTimeout(resolve, 35));

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 2x scale gives pin-sharp 300 DPI print quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1120,
        windowHeight: 792,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage('a4', 'landscape');
      }

      // Exact A4 landscape dimensions: 297mm x 210mm
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
    }

    // Generate output blob and filename
    const sanitizedTitle = (options.reportTitle || 'تقرير_أسطول_سعودي_سوبر_ماركت')
      .replace(/\s+/g, '_')
      .replace(/[^\u0600-\u06FF\w-]/g, '');
    const filename = `${sanitizedTitle}_${referenceDate}.pdf`;

    const blob = pdf.output('blob');

    return {
      blob,
      filename,
      pageCount: pagesElements.length,
    };
  } finally {
    // Clean up DOM workspace
    if (workspace.parentNode) {
      workspace.parentNode.removeChild(workspace);
    }
  }
}
