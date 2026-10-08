import { Vehicle, TransferRecord, AuditRecord, SystemNotification, AppSettings, SystemUser } from '../types';
import { USER_PROVIDED_LICENSES } from './userLicenseData';
import { ROLE_DEFAULT_PERMISSIONS } from '../utils/permissionUtils';

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'user-admin-1',
    username: 'admin',
    name: 'وليد عادل',
    email: 'Walid.Adel@Seoudisupermarket.com',
    password: 'admin',
    role: 'admin',
    title: 'مدير عام المنظومة (Master Admin)',
    status: 'active',
    createdAt: '2025-01-01',
    lastLogin: '2025-06-04 10:15',
    phone: '01144542800',
    permissions: { ...ROLE_DEFAULT_PERMISSIONS.admin }
  },
  {
    id: 'user-fleet-1',
    username: 'fleet',
    name: 'أحمد عثمان (مدير الأسطول)',
    email: 'fleet@seoudisupermarket.com',
    password: '123456',
    role: 'fleet_manager',
    title: 'مدير الحركة والأسطول المركزي',
    status: 'active',
    createdAt: '2025-01-15',
    lastLogin: '2025-06-04 09:30',
    phone: '01000000001',
    permissions: { ...ROLE_DEFAULT_PERMISSIONS.fleet_manager }
  },
  {
    id: 'user-branch-1',
    username: 'branch',
    name: 'محمود الصاوي (مدير فرع زايد)',
    email: 'zayed.branch@seoudisupermarket.com',
    password: '123456',
    role: 'branch_manager',
    title: 'مسؤول تشغيل فرع الشيخ زايد',
    assignedBranch: 'دارك ستور الشيخ زايد (DS Zayed)',
    status: 'active',
    createdAt: '2025-02-01',
    lastLogin: '2025-06-03 14:20',
    phone: '01000000002',
    permissions: { ...ROLE_DEFAULT_PERMISSIONS.branch_manager }
  },
  {
    id: 'user-viewer-1',
    username: 'viewer',
    name: 'مدقق ومشاهد التراخيص (View Only)',
    email: 'viewer@seoudisupermarket.com',
    password: '123456',
    role: 'viewer',
    title: 'مراقب ومدقق تراخيص (قراءة فقط)',
    status: 'active',
    createdAt: '2025-02-10',
    lastLogin: '2025-06-04 08:45',
    phone: '01000000003',
    permissions: { ...ROLE_DEFAULT_PERMISSIONS.viewer }
  }
];

export const INITIAL_BRANCHES = [
  'هايد بارك (Hyde Park)',
  'ديستريكت فايف (District 5)',
  'دارك ستور الشيخ زايد (DS Zayed)',
  'دريم لاند (Dream Land)',
  'مول العرب (Mall of Arabia)',
  'سوديك ويست (SODIC WEST)',
  'سوديك إيست (SODIC EAST)',
  'سيتي ستارز (City Star)',
  'دارك ستور المعادي (DS Maadi)',
  'واتر واي (Water Way)',
  'الشروق (Shorouk)',
  'مدينتي (Madinaty)',
  'سيلفر ستار (Silver Star)',
  'العلمين (El Alamein)',
  'دارك ستور الكيت كات (DS Kitkat)',
  'مكرم عبيد (Makram)',
  'شيراتون (Sheraton)',
  'روكسي (Roxy)'
];

export const INITIAL_SETTINGS: AppSettings = {
  expiringDaysThreshold: 30,
  criticalDaysThreshold: 7,
  systemNameAr: 'سعودي سوبر ماركت - مصر',
  systemNameEn: 'Seoudi Supermarket Egypt - Delivery Fleet Platform',
  companyName: 'شركة سعودي سوبر ماركت (مصر) - إدارة الحركة والأسطول والتجارة الإلكترونية',
  officialRegNumber: 'س.ت: 129482 (مكتب استثمار القاهرة)',
  taxNumber: 'ب.ض: 204-893-112',
  fleetManagerName: 'م. أحمد عثمان — مدير إدارة الأسطول والحركة المركزية',
  fleetManagerEmail: 'fleet.operations@seoudi.com',
  trafficLicenseFeeEst: 3500,
  commercialLicenseFeeEst: 2600,
  inspectionFeeEst: 850,
  taxRatePct: 14,
  maxVehicleAgeYears: 8,
  enableNotifications: true,
  enableSoundAlerts: true,
  dateFormat: 'gregorian',
  theme: 'dark'
};

// Helper to calculate realistic valid / expiring / expired dates based on 2025-06-04 reference
function generateLicenseDates(index: number, vehicleYear: number) {
  // Pattern distribution:
  // 68% Valid (> 30 days)
  // 22% Expiring soon (1 to 30 days)
  // 10% Expired (< 0 days)
  const pattern = index % 10;
  
  let trafficExpiry: string;
  let trafficIssue: string;
  let commercialExpiry: string;
  let commercialIssue: string;

  if (pattern === 0) {
    // Expired traffic & expired commercial
    trafficIssue = '2024-05-10';
    trafficExpiry = '2025-05-18'; // -17 days
    commercialIssue = '2024-05-10';
    commercialExpiry = '2025-05-25'; // -10 days
  } else if (pattern === 1) {
    // Expiring soon traffic (within 10 days)
    trafficIssue = '2024-06-12';
    trafficExpiry = '2025-06-12'; // +8 days
    commercialIssue = '2024-07-01';
    commercialExpiry = '2025-07-01'; // +27 days
  } else if (pattern === 2) {
    // Expiring soon commercial (within 20 days)
    trafficIssue = '2024-09-15';
    trafficExpiry = '2025-09-15'; // Valid
    commercialIssue = '2024-06-22';
    commercialExpiry = '2025-06-22'; // +18 days
  } else if (pattern === 3) {
    // Expired commercial only
    trafficIssue = '2024-08-20';
    trafficExpiry = '2025-08-20'; // Valid
    commercialIssue = '2024-05-01';
    commercialExpiry = '2025-05-29'; // -6 days
  } else if (pattern === 4) {
    // Expiring soon traffic (within 25 days)
    trafficIssue = '2024-06-28';
    trafficExpiry = '2025-06-28'; // +24 days
    commercialIssue = '2024-08-15';
    commercialExpiry = '2025-08-15'; // Valid
  } else {
    // Safe & Valid (various long future dates in late 2025, 2026, 2027)
    const monthOffset = (index % 12) + 3;
    const yearOffset = vehicleYear >= 2024 ? 2026 : 2025;
    const padMonth = String((monthOffset % 12) + 1).padStart(2, '0');
    trafficIssue = `${yearOffset - 1}-08-15`;
    trafficExpiry = `${yearOffset}-${padMonth}-18`;
    commercialIssue = `${yearOffset - 1}-09-01`;
    commercialExpiry = `${yearOffset}-${padMonth}-25`;
  }

  return { trafficIssue, trafficExpiry, commercialIssue, commercialExpiry };
}

// Map user sheet branch names to standardized Arabic names
const BRANCH_NAME_MAP: Record<string, string> = {
  'DS Maadi': 'دارك ستور المعادي (DS Maadi)',
  'Mall of Arabia': 'مول العرب (Mall of Arabia)',
  'MOA': 'مول العرب (Mall of Arabia)',
  'DS Zayed': 'دارك ستور الشيخ زايد (DS Zayed)',
  'DS-Zayed': 'دارك ستور الشيخ زايد (DS Zayed)',
  'Shorouk': 'الشروق (Shorouk)',
  'Alshroq': 'الشروق (Shorouk)',
  'Roxy': 'روكسي (Roxy)',
  'DS Kitkat': 'دارك ستور الكيت كات (DS Kitkat)',
  'Dream Land': 'دريم لاند (Dream Land)',
  'Dreem': 'دريم لاند (Dream Land)',
  'Water Way': 'واتر واي (Water Way)',
  'Waterway': 'واتر واي (Water Way)',
  'City Star': 'سيتي ستارز (City Star)',
  'CityStars': 'سيتي ستارز (City Star)',
  'Makram': 'مكرم عبيد (Makram)',
  'District 5': 'ديستريكت فايف (District 5)',
  'Silver Star': 'سيلفر ستار (Silver Star)',
  'SliverStar': 'سيلفر ستار (Silver Star)',
  'Madinaty': 'مدينتي (Madinaty)',
  'Madinty': 'مدينتي (Madinaty)',
  'Sheraton': 'شيراتون (Sheraton)',
  'sheraton': 'شيراتون (Sheraton)',
  'SODIC WEST': 'سوديك ويست (SODIC WEST)',
  'SODIC EAST': 'سوديك إيست (SODIC EAST)',
  'SODIC E': 'سوديك إيست (SODIC EAST)',
  'Hyde Park': 'هايد بارك (Hyde Park)',
  'El Alamein': 'العلمين (El Alamein)',
};

// Raw records sent directly by the user from their fleet spreadsheet
interface RawFleetRecord {
  plateNumber: string;
  department: string;
  branch: string;
  description: string;
  descriptionEng: string;
  brand: string;
  model: string;
  year: number;
  statusNotes?: string;
}

const RAW_USER_FLEET: RawFleetRecord[] = [
  { plateNumber: 'و س 8427', department: 'E-Commerce', branch: 'DS Maadi', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2019 },
  { plateNumber: 'د ج 6423', department: 'E-Commerce', branch: 'Mall of Arabia', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2018 },
  { plateNumber: 'ي ف 1789', department: 'E-Commerce', branch: 'DS Maadi', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ج ي 4618', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ر س 3261', department: 'E-Commerce', branch: 'Shorouk', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2018 },
  { plateNumber: 'ط ن 9169', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ج ي 4615', department: 'E-Commerce', branch: 'Roxy', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ج ي 4621', department: 'E-Commerce', branch: 'DS Kitkat', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ج ي 4623', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ج ي 4627', department: 'E-Commerce', branch: 'Water Way', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'س ب 7769', department: 'E-Commerce', branch: 'Mall of Arabia', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2018 },
  { plateNumber: 'ي ف 1793', department: 'E-Commerce', branch: 'DS Kitkat', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ه ف 7621', department: 'E-Commerce', branch: 'DS Maadi', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2015 },
  { plateNumber: 'ي ف 1839', department: 'E-Commerce', branch: 'Water Way', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ي ف 1843', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016, statusNotes: 'إنتداب للصيانه' },
  { plateNumber: 'د ن 3118', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'د ن 3117', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي سوبر كاري صندوق أرفف', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ب ص 2913', department: 'E-Commerce', branch: 'City Star', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2014 },
  { plateNumber: 'ب ص 2914', department: 'E-Commerce', branch: 'Makram', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2014 },
  { plateNumber: 'د ن 2249', department: 'E-Commerce', branch: 'DS Maadi', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ه ف 7623', department: 'E-Commerce', branch: 'City Star', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2015 },
  { plateNumber: 'ف ل 2286', department: 'E-Commerce', branch: 'DS Maadi', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ي ف 3492', department: 'E-Commerce', branch: 'Water Way', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ي ف 3497', department: 'E-Commerce', branch: 'Sheraton', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ط ن 7899', department: 'E-Commerce', branch: 'El Alamein', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'و أ 5465', department: 'E-Commerce', branch: 'DS Kitkat', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2013 },
  { plateNumber: 'ك ك 5632', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ف ل 2291', department: 'E-Commerce', branch: 'Silver Star', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ف ل 2289', department: 'E-Commerce', branch: 'City Star', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ف ل 2287', department: 'E-Commerce', branch: 'Madinaty', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ه ل 9739', department: 'E-Commerce', branch: 'Water Way', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ه ل 8335', department: 'E-Commerce', branch: 'City Star', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ه ل 8337', department: 'E-Commerce', branch: 'Makram', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ه ل 8336', department: 'E-Commerce', branch: 'Sheraton', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ه ل 8334', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ه ل 8339', department: 'E-Commerce', branch: 'Makram', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2020 },
  { plateNumber: 'ن ه 1412', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2022 },
  { plateNumber: 'ن ه 1415', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2022 },
  { plateNumber: 'ن ه 1417', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2022 },
  { plateNumber: 'ك ك 4718', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ن ه 1419', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2022 },
  { plateNumber: 'ن ه 1416', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2022 },
  { plateNumber: 'ن ه 1418', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2022 },
  { plateNumber: 'ن ه 1413', department: 'E-Commerce', branch: 'Silver Star', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2022 },
  { plateNumber: 'ط ن 4353', department: 'E-Commerce', branch: 'Shorouk', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ط ن 4354', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ط ن 9161', department: 'E-Commerce', branch: 'Mall of Arabia', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ط ن 9171', department: 'E-Commerce', branch: 'Mall of Arabia', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ط ن 7922', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022, statusNotes: 'حادث' },
  { plateNumber: 'ط ن 4349', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ط ن 4348', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ط ن 7911', department: 'E-Commerce', branch: 'Madinaty', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ك ك 5627', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ي ب 7953', department: 'E-Commerce', branch: 'SODIC WEST', description: 'فيات دوبلو', descriptionEng: 'Fiat Doblo', brand: 'Fiat', model: 'Doblò', year: 2021 },
  { plateNumber: 'ي ف 2961', department: 'E-Commerce', branch: 'SODIC EAST', description: 'فيات دوبلو', descriptionEng: 'Fiat Doblo', brand: 'Fiat', model: 'Doblò', year: 2021 },
  { plateNumber: 'ف م 6346', department: 'E-Commerce', branch: 'SODIC WEST', description: 'فيات دوبلو', descriptionEng: 'Fiat Doblo', brand: 'Fiat', model: 'Doblò', year: 2022 },
  { plateNumber: 'ى ل 1474', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ف م 3599', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ف م 3622', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ف م 3611', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ى ل 1481', department: 'E-Commerce', branch: 'Shorouk', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ى ل 1484', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ف م 3763', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ف م 3757', department: 'E-Commerce', branch: 'Shorouk', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ف م 3753', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2023 },
  { plateNumber: 'ى ا 1612', department: 'E-Commerce', branch: 'Shorouk', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'ف م 3783', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'ك ك 4713', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ي ل 1613', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'ي ف 1842', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2016 },
  { plateNumber: 'ى ا 1595', department: 'E-Commerce', branch: 'Shorouk', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'ف م 3661', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'ى ل 1614', department: 'E-Commerce', branch: 'City Star', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'ف م 3767', department: 'E-Commerce', branch: 'Mall of Arabia', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'ن ه 1421', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2022 },
  { plateNumber: 'ف م 3811', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'د ن 3119', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'د ن 3122', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'د ن 3144', department: 'E-Commerce', branch: 'El Alamein', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ف م 3799', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي فان', descriptionEng: 'Suzuki Van', brand: 'Suzuki', model: 'Van', year: 2023 },
  { plateNumber: 'د ن 3116', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2022 },
  { plateNumber: 'ك ك 4716', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'Golf Car 1', department: 'E-Commerce', branch: 'SODIC WEST', description: 'جولف كار', descriptionEng: 'Golf Car 1', brand: 'MATGAR', model: 'Golf Car', year: 2024 },
  { plateNumber: 'Golf Car 2', department: 'E-Commerce', branch: 'SODIC WEST', description: 'جولف كار', descriptionEng: 'Golf Car 2', brand: 'MATGAR', model: 'Golf Car', year: 2024 },
  { plateNumber: 'Golf Car 3', department: 'E-Commerce', branch: 'SODIC WEST', description: 'جولف كار', descriptionEng: 'Golf Car 3', brand: 'MATGAR', model: 'Golf Car', year: 2024 },
  { plateNumber: 'ك ك 4715', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ك ك 4697', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ك ك 4712', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ك ك 5638', department: 'E-Commerce', branch: 'Dream Land', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ك ك 5629', department: 'E-Commerce', branch: 'DS Zayed', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ك ك 4693', department: 'E-Commerce', branch: 'Water Way', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ك ك 4698', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ك ك 5631', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي بيك أب صندوق بأرفف', descriptionEng: 'Suzuki Pickup', brand: 'Suzuki', model: 'Suzuki Pickup', year: 2025 },
  { plateNumber: 'ب ق 5898', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ن ي 8198', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ن ى 8789', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ن ى 8785', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ب ق 5589', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ب ق 5586', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ب ق 5587', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ن ي 8218', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025, statusNotes: 'حادث' },
  { plateNumber: 'ن ي 8212', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ن ى 8786', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ن ي 8191', department: 'E-Commerce', branch: 'Hyde Park', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
  { plateNumber: 'ب ق 5591', department: 'E-Commerce', branch: 'District 5', description: 'سوزوكي سوبر كاري', descriptionEng: 'Suzuki Super Carry', brand: 'Suzuki', model: 'Super Carry', year: 2025 },
];

// Helper to separate digits and letters from Egyptian plate or Golf Car
function parsePlate(plateStr: string) {
  const trimmed = plateStr.trim();
  // Check if golf car
  if (trimmed.toLowerCase().includes('golf')) {
    return {
      vehicleNumber: trimmed,
      plateLetters: 'جولف كار',
    };
  }

  // Split by whitespace
  const parts = trimmed.split(/\s+/);
  // Last part is digits if it has numbers
  const digitsMatch = trimmed.match(/\d+/);
  const lettersMatch = trimmed.replace(/\d+/g, '').trim();

  return {
    vehicleNumber: digitsMatch ? digitsMatch[0] : parts[parts.length - 1],
    plateLetters: lettersMatch || parts.slice(0, parts.length - 1).join(' ') || 'س ع د'
  };
}

// Build 105 official Vehicles from the exact list provided
export const INITIAL_VEHICLES: Vehicle[] = RAW_USER_FLEET.map((raw, idx) => {
  const { vehicleNumber, plateLetters } = parsePlate(raw.plateNumber);
  const branchName = BRANCH_NAME_MAP[raw.branch] || raw.branch;
  const userLic = USER_PROVIDED_LICENSES[vehicleNumber];

  // Status notes check
  let extraNotes = raw.statusNotes || '';
  if (raw.model === 'Golf Car' || raw.descriptionEng.includes('Golf')) {
    extraNotes = 'عربة جولف داخلية لخدمة كمبوند ومجمعات سوديك ويست';
  } else if (raw.statusNotes === 'حادث') {
    extraNotes = 'السيارة متوقفة للإصلاح وتأمين الحوادث';
  } else if (raw.statusNotes === 'إنتداب للصيانه') {
    extraNotes = 'إنتداب لورشة الصيانة المركزية لتجهيز الصندوق والأرفف';
  }

  const modelDisplay = `${raw.description} (${raw.year})`;

  // If user provided exact license data, use it; otherwise mark as "قيد التحديث"
  const trafficNum = userLic?.trafficNumber || (raw.model === 'Golf Car' ? 'تصريح داخلي - 9901' : 'قيد التحديث');
  const trafficIssue = userLic?.trafficIssue || 'قيد التحديث';
  const trafficExpiry = userLic?.trafficExpiry || 'قيد التحديث';

  const commNum = userLic?.commercialNumber || (raw.model === 'Golf Car' ? 'تصريح كمبوند سوديك' : 'قيد التحديث');
  const commIssue = userLic?.commercialIssue || 'قيد التحديث';
  const commExpiry = userLic?.commercialExpiry || 'قيد التحديث';

  return {
    id: `v-seoudi-${idx + 1}`,
    vehicleNumber,
    plateLetters,
    vin: `EGY-SEOUDI-${raw.year}-${String(idx + 1).padStart(4, '0')}`,
    model: modelDisplay,
    branch: branchName,
    trafficLicense: {
      licenseNumber: trafficNum,
      issueDate: trafficIssue,
      expiryDate: trafficExpiry,
      notes: raw.statusNotes ? `ملاحظات: ${raw.statusNotes}` : `فحص وتجديد رخصة التسيير الدورية`
    },
    commercialLicense: {
      licenseNumber: commNum,
      issueDate: commIssue,
      expiryDate: commExpiry,
      notes: `تصريح إعلانات سعودي سوبر ماركت - ${raw.branch}`
    },
    notes: extraNotes || `سيارة توصيل طلبات أونلاين (${raw.department}) - موديل ${raw.year}`,
    createdAt: `${raw.year}-01-15`,
    updatedAt: '2025-06-04'
  };
});

export const INITIAL_TRANSFERS: TransferRecord[] = [
  {
    id: 'tr-1',
    vehicleId: 'v-seoudi-105',
    vehicleNumber: '5591',
    fromBranch: 'المركز اللوجستي (DS Kitkat)',
    toBranch: 'هايد بارك (Hyde Park)',
    date: '2025-06-04',
    time: '10:15 ص',
    transferredBy: 'أحمد كمال (مدير حركة أسطول سعودي سوبر ماركت)',
    reason: 'تعزيز أسطول التوصيل المنزلي السريع بالقاهرة الجديدة والتجمع',
    notes: 'السيارة مجهزة بصناديق عزل البقالة والمجمدات ونظام التتبع GPS'
  },
  {
    id: 'tr-2',
    vehicleId: 'v-seoudi-15',
    vehicleNumber: '1843',
    fromBranch: 'دارك ستور الشيخ زايد (DS Zayed)',
    toBranch: 'ورشة الصيانة المركزية',
    date: '2025-05-28',
    time: '02:30 م',
    transferredBy: 'محمود الصاوي (مشرف الحركة)',
    reason: 'إنتداب للصيانة وتجهيز السيارة',
    notes: 'تحويل لورشة الصيانة والتجهيز'
  },
  {
    id: 'tr-3',
    vehicleId: 'v-seoudi-102',
    vehicleNumber: '8212',
    fromBranch: 'هايد بارك (Hyde Park)',
    toBranch: 'ديستريكت فايف (District 5)',
    date: '2025-05-15',
    time: '11:00 ص',
    transferredBy: 'طارق عبد العزيز (مسؤول الأسطول)',
    reason: 'دعم لوجستي لساعات الذروة والعروض الأسبوعية للتوصيل'
  }
];

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-1',
    user: 'مدير أسطول سعودي سوبر ماركت',
    userRole: 'Fleet Manager',
    action: 'تحديث بيانات أسطول سيارات التجارة الإلكترونية بالكامل',
    vehicleNumber: '105 سيارة',
    oldValue: 'بيانات أولية تجريبية',
    newValue: '105 سيارة أصلية معتمدة لجميع فروع سعودي',
    date: '2025-06-04',
    time: '10:30 ص'
  },
  {
    id: 'aud-2',
    user: 'مشرف الحركة - DS Zayed',
    userRole: 'Operations Specialist',
    action: 'إثبات حالة سيارة بالأسطول',
    vehicleNumber: '1843 (ي ف)',
    oldValue: 'تشغيل اعتيادي',
    newValue: 'إنتداب للصيانة والتجهيز',
    date: '2025-06-03',
    time: '04:15 م'
  },
  {
    id: 'aud-3',
    user: 'مشرف فرع ديستريكت فايف',
    userRole: 'Branch Manager',
    action: 'تسجيل حالة حادث ومتابعة التأمين',
    vehicleNumber: '7922 (ط ن)',
    oldValue: 'سارية بالتشغيل',
    newValue: 'حادث - جاري الإصلاح والتأمين',
    date: '2025-06-02',
    time: '01:20 م'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'تحديث بيانات أسطول سعودي سوبر ماركت (105 سيارة)',
    message: 'تم اعتماد وتحديث كافة أرقام سيارات الفروع (هايد بارك، ديستريكت 5، زايد، المعادي، وغيرها)',
    priority: 'high',
    isRead: false,
    createdAt: 'الآن',
    type: 'system'
  },
  {
    id: 'notif-2',
    title: 'تنبيه سيارات متوقفة للصيانة والحوادث',
    message: 'السيارة 1843 (إنتداب للصيانة) والسيارات 7922 و 8218 (حوادث) تتطلب متابعة قسم الصيانة والتأمين',
    priority: 'high',
    isRead: false,
    createdAt: 'منذ 15 دقيقة',
    type: 'traffic_expiry'
  },
  {
    id: 'notif-3',
    title: 'وصول أسطول موديل 2025 الجديد (بيك أب سوبر كاري)',
    message: 'تم إضافة سيارات أسطول 2025 المزودة بصندوق أرفف لتوزيع طلبات الأونلاين بفروع زايد والتجمع',
    priority: 'medium',
    isRead: true,
    createdAt: 'منذ ساعة',
    type: 'system'
  }
];

export const BRANCHES = INITIAL_BRANCHES;
export const initialVehicles = INITIAL_VEHICLES;
export const initialTransfers = INITIAL_TRANSFERS;
export const initialAuditLogs = INITIAL_AUDIT_LOGS;
export const initialNotifications = INITIAL_NOTIFICATIONS;
