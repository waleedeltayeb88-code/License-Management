/**
 * Verified user-provided license data.
 * Extracted and updated with official traffic and commercial advertising license sheets.
 * Format for dates: YYYY-MM-DD or "قيد التحديث"
 * For missing numbers: "قيد التحديث"
 */

export interface UserLicenseRecord {
  trafficNumber?: string;
  trafficIssue?: string;
  trafficExpiry?: string;
  commercialNumber?: string;
  commercialIssue?: string;
  commercialExpiry?: string;
}

export const USER_PROVIDED_LICENSES: Record<string, UserLicenseRecord> = {
  // 1412 ن ه: Dreem | إعلان: قيد التحديث (2026-05-11 -> 2027-05-11)
  '1412': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-08-06',
    trafficExpiry: '2026-09-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-11',
    commercialExpiry: '2027-05-11',
  },
  // 1413 ن ه: SliverStar | إعلان: قيد التحديث (2026-05-15 -> 2027-05-11)
  '1413': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-05-15',
    trafficExpiry: '2027-05-11',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-15',
    commercialExpiry: '2027-05-11',
  },
  // 1415 ن ه: Dreem | إعلان: قيد التحديث (2026-05-11 -> 2027-05-11)
  '1415': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-08-06',
    trafficExpiry: '2026-09-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-11',
    commercialExpiry: '2027-05-11',
  },
  // 1416 ن ه: Dreem | إعلان: قيد التحديث (2026-05-11 -> 2027-05-11)
  '1416': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-08-06',
    trafficExpiry: '2026-09-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-11',
    commercialExpiry: '2027-05-11',
  },
  // 1417 ن ه: Dreem | إعلان: قيد التحديث (2026-05-11 -> 2027-05-11)
  '1417': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-05-11',
    trafficExpiry: '2026-09-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-11',
    commercialExpiry: '2027-05-11',
  },
  // 1418 ن ه: Dreem | إعلان: قيد التحديث (2026-05-11 -> 2027-05-11)
  '1418': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-05-11',
    trafficExpiry: '2026-09-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-11',
    commercialExpiry: '2027-05-11',
  },
  // 1419 : Dreem | إعلان: قيد التحديث (2026-05-11 -> 2027-05-11)
  '1419': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-05-11',
    trafficExpiry: '2026-09-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-11',
    commercialExpiry: '2027-05-11',
  },
  // 1421 : DS-Zayed | إعلان: قيد التحديث (2026-05-11 -> 2027-05-11)
  '1421': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-08-06',
    trafficExpiry: '2026-09-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-11',
    commercialExpiry: '2027-05-11',
  },
  // 1474 ي ل: Hyde Park | رخصة إعلان معتمدة
  '1474': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-08-09',
    commercialExpiry: '2027-08-08',
  },
  // 1481 ي ل: Alshroq | رخصة إعلان معتمدة
  '1481': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: '229249',
    commercialIssue: '2026-08-09',
    commercialExpiry: '2027-08-08',
  },
  // 1484 ي ل: District 5 | رخصة إعلان معتمدة
  '1484': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-08-09',
    commercialExpiry: '2027-08-08',
  },
  // 1595 ي ل: Alshroq | إعلان: قيد التحديث (2025-09-09 -> 2027-08-12)
  '1595': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-14',
    trafficExpiry: '2027-08-12',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-09-09',
    commercialExpiry: '2027-08-12',
  },
  // 1612 ي ل: Alshroq | إعلان: قيد التحديث (2025-08-14 -> 2027-08-12)
  '1612': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-14',
    trafficExpiry: '2027-08-12',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-14',
    commercialExpiry: '2027-08-12',
  },
  // 1614 ي ل: CityStars | إعلان: قيد التحديث (2025-08-14 -> 2027-08-12)
  '1614': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-14',
    trafficExpiry: '2027-08-12',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-14',
    commercialExpiry: '2027-08-12',
  },
  // 1789 ي ف: DS Maadi | إعلان: قيد التحديث (2025-10-13 -> 2026-10-13)
  '1789': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-10-13',
    trafficExpiry: '2026-10-13',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-10-13',
    commercialExpiry: '2026-10-13',
  },
  // 1793 ي ف: Kitkat | قيد التحديث | 19/10/2025 -> الإثنين 19/10/2026
  '1793': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-10-19',
    trafficExpiry: '2026-10-19',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-10-19',
    commercialExpiry: '2026-10-19',
  },
  // 1839 ي ف: Waterway | إعلان: 181577 (2025-10-16 -> 2026-10-13)
  '1839': {
    trafficNumber: '181577',
    trafficIssue: '2025-10-16',
    trafficExpiry: '2026-10-13',
    commercialNumber: '181577',
    commercialIssue: '2025-10-16',
    commercialExpiry: '2026-10-13',
  },
  // 1843 ي ف: Dreem | إعلان: قيد التحديث (2025-10-21 -> 2026-10-20)
  '1843': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-10-21',
    trafficExpiry: '2026-10-20',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-10-21',
    commercialExpiry: '2026-10-20',
  },
  // 2249 د ن: DS Maadi | إعلان: قيد التحديث (2025-11-23 -> 2026-11-21)
  '2249': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-11-23',
    trafficExpiry: '2026-11-21',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-11-23',
    commercialExpiry: '2026-11-21',
  },
  // 2286 ف ل: DS Maadi | إعلان: قيد التحديث (2026-06-21 -> 2027-06-19)
  '2286': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-06-21',
    trafficExpiry: '2026-09-20',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-06-21',
    commercialExpiry: '2027-06-19',
  },
  // 2287 ف ل: Madinty | إعلان: قيد التحديث (2025-11-03 -> 2026-11-01)
  '2287': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-11-03',
    trafficExpiry: '2026-11-01',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-11-03',
    commercialExpiry: '2026-11-01',
  },
  // 2289 ف ل: CityStars | قيد التحديث | الإثنين 3/11/2025 -> الأحد 1/11/2026
  '2289': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-11-03',
    trafficExpiry: '2026-11-01',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-11-03',
    commercialExpiry: '2026-11-01',
  },
  // 2291 ف ل: SliverStar | إعلان: قيد التحديث (2025-11-03 -> 2026-11-01)
  '2291': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-11-03',
    trafficExpiry: '2026-11-01',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-11-03',
    commercialExpiry: '2026-11-01',
  },
  // 2913 ب ص: CityStars | قيد التحديث | الجمعة 29/5/2026 -> السبت 29/5/2027
  '2913': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-05-29',
    trafficExpiry: '2027-05-29',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-29',
    commercialExpiry: '2027-05-29',
  },
  // 2961 ي ف: SODIC E | إعلان: قيد التحديث (2025-09-20 -> 2026-09-18)
  '2961': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-09-20',
    trafficExpiry: '2026-09-18',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-09-20',
    commercialExpiry: '2026-09-18',
  },
  // 3116 د ن: Hyde Park | إعلان: 229536 (2025-01-30 -> 2027-01-29)
  '3116': {
    trafficNumber: '229536',
    trafficIssue: '2025-04-29',
    trafficExpiry: '2027-01-29',
    commercialNumber: '229536',
    commercialIssue: '2025-01-30',
    commercialExpiry: '2027-01-29',
  },
  // 3117 : DS-Zayed | إعلان: قيد التحديث (2025-01-30 -> 2027-01-29)
  '3117': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-04-29',
    trafficExpiry: '2027-01-29',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-01-30',
    commercialExpiry: '2027-01-29',
  },
  // 3118 : DS-Zayed | إعلان: قيد التحديث (2025-01-30 -> 2027-01-29)
  '3118': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-04-29',
    trafficExpiry: '2027-01-29',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-01-30',
    commercialExpiry: '2027-01-29',
  },
  // 3119 د ن: Hyde Park | إعلان: 228624 (2025-01-30 -> 2027-01-29)
  '3119': {
    trafficNumber: '228624',
    trafficIssue: '2025-05-26',
    trafficExpiry: '2027-01-29',
    commercialNumber: '228624',
    commercialIssue: '2025-01-30',
    commercialExpiry: '2027-01-29',
  },
  // 3122 د ن: Hyde Park | إعلان: 229556 (2025-01-30 -> 2027-01-29)
  '3122': {
    trafficNumber: '229556',
    trafficIssue: '2025-04-29',
    trafficExpiry: '2027-01-29',
    commercialNumber: '229556',
    commercialIssue: '2025-01-30',
    commercialExpiry: '2027-01-29',
  },
  // 3144 د ن: El Alamein | إعلان: قيد التحديث (2025-04-29 -> 2027-01-29)
  '3144': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-04-29',
    trafficExpiry: '2027-01-29',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-04-29',
    commercialExpiry: '2027-01-29',
  },
  // 3261 ر س: Alshroq | إعلان: قيد التحديث (2025-09-09 -> 2026-09-04)
  '3261': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-09-09',
    trafficExpiry: '2026-09-04',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-09-09',
    commercialExpiry: '2026-09-04',
  },
  // 3492 ي ف: Waterway | إعلان: 181683 (2025-11-18 -> 2026-11-18)
  '3492': {
    trafficNumber: '181683',
    trafficIssue: '2025-11-18',
    trafficExpiry: '2026-11-18',
    commercialNumber: '181683',
    commercialIssue: '2025-11-18',
    commercialExpiry: '2026-11-18',
  },
  // 3497 ي ف: sheraton | قيد التحديث | الأحد 23/11/2025 -> السبت 21/11/2026
  '3497': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-11-23',
    trafficExpiry: '2026-11-21',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-11-23',
    commercialExpiry: '2026-11-21',
  },
  // 3599 ف م: District 5 | رخصة إعلان معتمدة
  '3599': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-08-09',
    commercialExpiry: '2027-08-07',
  },
  // 3611 ف م: Hyde Park | رخصة إعلان معتمدة
  '3611': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-08-09',
    commercialExpiry: '2027-08-07',
  },
  // 3622 ف م: District 5 | رخصة إعلان معتمدة
  '3622': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-08-09',
    commercialExpiry: '2027-08-07',
  },
  // 3661 ف م: Dreem | إعلان: قيد التحديث (2025-08-14 -> 2027-08-12)
  '3661': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-14',
    trafficExpiry: '2026-11-12',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-14',
    commercialExpiry: '2027-08-12',
  },
  // 3753 ف م: District 5 | إعلان: قيد التحديث (2025-08-22 -> 2027-08-22)
  '3753': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-23',
    trafficExpiry: '2027-08-22',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-22',
    commercialExpiry: '2027-08-22',
  },
  // 3757 ف م: Alshroq | إعلان: قيد التحديث (2025-08-23 -> 2027-08-22)
  '3757': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-23',
    trafficExpiry: '2027-08-22',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-23',
    commercialExpiry: '2027-08-22',
  },
  // 3763 ف م: District 5 | إعلان: قيد التحديث (2025-08-23 -> 2027-08-22)
  '3763': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-23',
    trafficExpiry: '2026-11-22',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-23',
    commercialExpiry: '2027-08-22',
  },
  // 3767 ف م: MOA | إعلان: قيد التحديث (2025-08-23 -> 2027-08-22)
  '3767': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-23',
    trafficExpiry: '2026-11-22',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-23',
    commercialExpiry: '2027-08-22',
  },
  // 3783 ف م: Dreem | إعلان: قيد التحديث (2025-08-23 -> 2027-08-22)
  '3783': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-23',
    trafficExpiry: '2026-11-22',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-23',
    commercialExpiry: '2027-08-22',
  },
  // 3799 : DS-Zayed | إعلان: قيد التحديث (2025-08-30 -> 2027-08-26)
  '3799': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-30',
    trafficExpiry: '2026-11-30',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-08-30',
    commercialExpiry: '2027-08-26',
  },
  // 3811 ف م: DS-Zayed | رخصة إعلان معتمدة
  '3811': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-08-09',
    commercialExpiry: '2027-08-07',
  },
  // 4348 ط ن: District 5 | رخصة إعلان معتمدة
  '4348': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-13',
    commercialExpiry: '2027-05-09',
  },
  // 4349 ط ن: District 5 | إعلان: قيد التحديث (2026-05-09 -> 2027-05-09)
  '4349': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-08-06',
    trafficExpiry: '2026-11-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-09',
    commercialExpiry: '2027-05-09',
  },
  // 4353 ط ن: Alshroq | إعلان: قيد التحديث (2026-09-05 -> 2027-05-08)
  '4353': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-08-05',
    trafficExpiry: '2026-11-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-09-05',
    commercialExpiry: '2027-05-08',
  },
  // 4354 ط ن: District 5 | إعلان: قيد التحديث (2025-05-08 -> 2026-11-05)
  '4354': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-05-08',
    trafficExpiry: '2027-05-08',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-05-08',
    commercialExpiry: '2026-11-05',
  },
  // 4615 و ي / ج ي: Roxy | قيد التحديث | الإثنين 10/2/2025 -> الإثنين 8/2/2027
  '4615': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-02-10',
    trafficExpiry: '2027-02-08',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-02-10',
    commercialExpiry: '2027-02-08',
  },
  // 4618 : DS-Zayed | إعلان: قيد التحديث (2025-02-10 -> 2027-02-08)
  '4618': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-03-12',
    trafficExpiry: '2027-02-08',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-02-10',
    commercialExpiry: '2027-02-08',
  },
  // 4621 ج ي: Kitkat | قيد التحديث | الخميس 2/10/2025 -> الإثنين 8/2/2027
  '4621': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-10-02',
    trafficExpiry: '2027-02-08',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-09-15',
    commercialExpiry: '2027-02-08',
  },
  // 4623 ج ي: Dreem | إعلان: قيد التحديث (2025-06-25 -> 2027-02-08)
  '4623': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-09-10',
    trafficExpiry: '2027-02-08',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-06-25',
    commercialExpiry: '2027-02-08',
  },
  // 4627 ج ي: Waterway | إعلان: 215899 (2025-02-10 -> 2027-02-08)
  '4627': {
    trafficNumber: '215899',
    trafficIssue: '2025-02-10',
    trafficExpiry: '2027-02-08',
    commercialNumber: '215899',
    commercialIssue: '2025-02-10',
    commercialExpiry: '2027-02-08',
  },
  // 4693 ك ك: Waterway | إعلان: 650119960 (2025-07-08 -> 2027-07-07)
  '4693': {
    trafficNumber: '650119960',
    trafficIssue: '2025-10-06',
    trafficExpiry: '2026-10-06',
    commercialNumber: '650119960',
    commercialIssue: '2025-07-08',
    commercialExpiry: '2027-07-07',
  },
  // 4697 ك ك: Hyde Park | إعلان: قيد التحديث (2025-07-07 -> 2027-07-07)
  '4697': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-10-06',
    trafficExpiry: '2026-10-06',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-07-07',
    commercialExpiry: '2027-07-07',
  },
  // 4698 ك ك: District 5 | إعلان: قيد التحديث (2026-07-08 -> 2027-07-07)
  '4698': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-07',
    trafficExpiry: '2026-10-06',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-08',
    commercialExpiry: '2027-07-07',
  },
  // 4712 ك ك: DS-Zayed | إعلان: قيد التحديث (2026-07-07 -> 2027-07-07)
  '4712': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-07',
    trafficExpiry: '2026-10-06',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-07',
    commercialExpiry: '2027-07-07',
  },
  // 4713 ك ك: DS-Zayed | إعلان: قيد التحديث (2026-07-07 -> 2027-07-07)
  '4713': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-07',
    trafficExpiry: '2026-10-06',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-07',
    commercialExpiry: '2027-07-07',
  },
  // 4715 ك ك: District 5 | إعلان: قيد التحديث (2026-07-08 -> 2027-07-07)
  '4715': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-07',
    trafficExpiry: '2026-10-06',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-08',
    commercialExpiry: '2027-07-07',
  },
  // 4716 : DS-Zayed | إعلان: قيد التحديث (2026-07-07 -> 2027-07-07)
  '4716': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-07',
    trafficExpiry: '2026-10-06',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-07',
    commercialExpiry: '2027-07-07',
  },
  // 4718 ك ك: DS-Zayed | إعلان: قيد التحديث (2026-07-07 -> 2027-07-07)
  '4718': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-07',
    trafficExpiry: '2026-10-06',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-07',
    commercialExpiry: '2027-07-07',
  },
  // 5465 و أ: Kitkat | قيد التحديث | 14/6/2025 -> 14/6/2026
  '5465': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-06-14',
    trafficExpiry: '2026-06-14',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-06-14',
    commercialExpiry: '2026-06-14',
  },
  // 5586 ب ق: District 5 | إعلان: قيد التحديث (2025-01-13 -> 2026-10-12)
  '5586': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-01-12',
    trafficExpiry: '2026-10-12',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-01-13',
    commercialExpiry: '2026-10-12',
  },
  // 5587 ب ق: Hyde Park | إعلان: 345652 (2026-01-12 -> 2026-10-12)
  '5587': {
    trafficNumber: '345652',
    trafficIssue: '2026-01-12',
    trafficExpiry: '2026-10-12',
    commercialNumber: '345652',
    commercialIssue: '2026-01-12',
    commercialExpiry: '2026-10-12',
  },
  // 5589 ب ق: District 5 | إعلان: قيد التحديث (2025-01-13 -> 2026-10-12)
  '5589': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-01-12',
    trafficExpiry: '2026-10-12',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-01-13',
    commercialExpiry: '2026-10-12',
  },
  // 5591 ب ق: District 5 | إعلان: 50346034 (2025-10-13 -> 2026-10-12)
  '5591': {
    trafficNumber: '50346034',
    trafficIssue: '2025-01-12',
    trafficExpiry: '2026-10-12',
    commercialNumber: '50346034',
    commercialIssue: '2025-10-13',
    commercialExpiry: '2026-10-12',
  },
  // 5627 ك ك: DS-Zayed | إعلان: قيد التحديث (2026-07-20 -> 2027-07-16)
  '5627': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-20',
    trafficExpiry: '2026-10-19',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-20',
    commercialExpiry: '2027-07-16',
  },
  // 5629 ك ك: DS-Zayed | إعلان: قيد التحديث (2026-07-17 -> 2027-07-16)
  '5629': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-20',
    trafficExpiry: '2026-10-19',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-17',
    commercialExpiry: '2027-07-16',
  },
  // 5631 ك ك: Hyde Park | إعلان: قيد التحديث (2025-07-17 -> 2026-10-14)
  '5631': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-10-06',
    trafficExpiry: '2026-10-14',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-07-17',
    commercialExpiry: '2026-10-14',
  },
  // 5632 : DS-Zayed | إعلان: قيد التحديث (2026-07-20 -> 2027-07-16)
  '5632': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-20',
    trafficExpiry: '2026-10-19',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-20',
    commercialExpiry: '2027-07-16',
  },
  // 5638 ك ك: Dreem | إعلان: قيد التحديث (2026-07-20 -> 2027-07-17)
  '5638': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-20',
    trafficExpiry: '2026-10-19',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-20',
    commercialExpiry: '2027-07-17',
  },
  // 5898 ب ق: Hyde Park | إعلان: قيد التحديث (2025-12-23 -> 2026-09-29)
  '5898': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-12-23',
    trafficExpiry: '2026-09-29',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-12-23',
    commercialExpiry: '2026-09-29',
  },
  // 6346 ف م: SODIC WEST | إعلان: قيد التحديث (2026-05-19 -> 2027-05-15)
  '6346': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-05-19',
    trafficExpiry: '2026-11-22',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-19',
    commercialExpiry: '2027-05-15',
  },
  // 6423 : MOA | إعلان: قيد التحديث (2026-05-23 -> 2027-05-21)
  '6423': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-05-23',
    trafficExpiry: '2027-05-21',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-23',
    commercialExpiry: '2027-05-21',
  },
  // 7621 ه ف: DS Maadi | إعلان: قيد التحديث (2026-06-23 -> 2027-06-23)
  '7621': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-06-23',
    trafficExpiry: '2026-09-22',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-06-23',
    commercialExpiry: '2027-06-23',
  },
  // 7623 ه ف: CityStars | قيد التحديث | الإثنين 13/7/2026 -> الإثنين 12/7/2027
  '7623': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-13',
    trafficExpiry: '2027-07-12',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-07-13',
    commercialExpiry: '2027-07-12',
  },
  // 7769 س ب: MOA | إعلان: قيد التحديث (2026-04-07 -> 2027-04-06)
  '7769': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-07-01',
    trafficExpiry: '2026-09-30',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-04-07',
    commercialExpiry: '2027-04-06',
  },
  // 7899 ط ن: El Alamein | رخصة إعلان معتمدة
  '7899': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: 'قيد التحديث',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-05-09',
    commercialExpiry: '2027-05-08',
  },
  // 7911 ط ن: Madinty | إعلان: قيد التحديث (2026-08-05 -> 2027-05-08)
  '7911': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-05-08',
    trafficExpiry: '2026-11-05',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-08-05',
    commercialExpiry: '2027-05-08',
  },
  // 7922 ط ن: District 5 | إعلان: قيد التحديث (2025-05-08 -> قيد التحديث)
  '7922': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-05-08',
    trafficExpiry: 'قيد التحديث',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-05-08',
    commercialExpiry: 'قيد التحديث',
  },
  // 7953 ي ل: SODIC WEST | إعلان: قيد التحديث (2025-09-27 -> 2026-09-26)
  '7953': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-09-27',
    trafficExpiry: '2026-09-26',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-09-27',
    commercialExpiry: '2026-09-26',
  },
  // 8191 ن ي: Hyde Park | إعلان: 345522 (2025-09-11 -> 2026-09-10)
  '8191': {
    trafficNumber: '345522',
    trafficIssue: '2025-12-11',
    trafficExpiry: '2026-09-10',
    commercialNumber: '345522',
    commercialIssue: '2025-09-11',
    commercialExpiry: '2026-09-10',
  },
  // 8198 ن ي: Hyde Park | إعلان: 145455 (2025-09-11 -> 2026-09-10)
  '8198': {
    trafficNumber: '145455',
    trafficIssue: '2025-12-11',
    trafficExpiry: '2026-09-10',
    commercialNumber: '145455',
    commercialIssue: '2025-09-11',
    commercialExpiry: '2026-09-10',
  },
  // 8212 ن ي: Hyde Park | إعلان: قيد التحديث (2025-09-11 -> 2026-09-10)
  '8212': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-12-11',
    trafficExpiry: '2026-09-10',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-09-11',
    commercialExpiry: '2026-09-10',
  },
  // 8218 ن ي: Hyde Park | إعلان: 345989 (2025-11-10 -> 2026-09-10)
  '8218': {
    trafficNumber: '345989',
    trafficIssue: '2025-12-11',
    trafficExpiry: '2026-09-10',
    commercialNumber: '345989',
    commercialIssue: '2025-11-10',
    commercialExpiry: '2026-09-10',
  },
  // 8334 : Dreem | إعلان: قيد التحديث (2025-11-03 -> 2026-11-03)
  '8334': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-11-03',
    trafficExpiry: '2026-11-03',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-11-03',
    commercialExpiry: '2026-11-03',
  },
  // 8335 ه ل: CityStars | قيد التحديث | الإثنين 3/11/2025 -> السبت 19/6/2027
  '8335': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-11-03',
    trafficExpiry: '2027-06-19',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-11-03',
    commercialExpiry: '2027-06-19',
  },
  // 8336 ه ل: sheraton | إعلان: قيد التحديث (2025-11-03 -> 2026-11-03)
  '8336': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-11-03',
    trafficExpiry: '2026-11-03',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-11-03',
    commercialExpiry: '2026-11-03',
  },
  // 8427 و س: DS Maadi | إعلان: قيد التحديث (2025-09-13 -> 2026-09-11)
  '8427': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-09-13',
    trafficExpiry: '2026-09-11',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-09-13',
    commercialExpiry: '2026-09-11',
  },
  // 8785 ن ي: Hyde Park | إعلان: قيد التحديث (2025-12-23 -> 2026-09-29)
  '8785': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-12-23',
    trafficExpiry: '2026-09-29',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-12-23',
    commercialExpiry: '2026-09-29',
  },
  // 8786 ن ي: Hyde Park | إعلان: قيد التحديث (2025-09-20 -> 2026-09-29)
  '8786': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-12-23',
    trafficExpiry: '2026-09-29',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-09-20',
    commercialExpiry: '2026-09-29',
  },
  // 8789 ن ي: Hyde Park | إعلان: قيد التحديث (2025-12-23 -> 2026-09-29)
  '8789': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2025-12-23',
    trafficExpiry: '2026-09-29',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2025-12-23',
    commercialExpiry: '2026-09-29',
  },
  // 9161 ط ن: MOA | إعلان: قيد التحديث (2026-03-16 -> 2027-03-16)
  '9161': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-04-09',
    trafficExpiry: '2027-03-16',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-03-16',
    commercialExpiry: '2027-03-16',
  },
  // 9169 ط ن: DS-Zayed | إعلان: قيد التحديث (2026-03-17 -> 2027-03-16)
  '9169': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-04-09',
    trafficExpiry: '2027-03-16',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-03-17',
    commercialExpiry: '2027-03-16',
  },
  // 9171 ط ن: MOA | إعلان: قيد التحديث (2026-03-17 -> 2027-03-16)
  '9171': {
    trafficNumber: 'قيد التحديث',
    trafficIssue: '2026-04-09',
    trafficExpiry: '2027-03-16',
    commercialNumber: 'قيد التحديث',
    commercialIssue: '2026-03-17',
    commercialExpiry: '2027-03-16',
  },
  // 9739 ه ل: Waterway | إعلان: 500860 (2025-06-23 -> 2027-06-19)
  '9739': {
    trafficNumber: 'L0500860',
    trafficIssue: '2025-10-06',
    trafficExpiry: '2026-09-20',
    commercialNumber: '500860',
    commercialIssue: '2025-06-23',
    commercialExpiry: '2027-06-19',
  },
};
