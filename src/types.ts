export type LicenseType = 'traffic' | 'commercial'; // ONLY traffic (سير) or commercial (إعلان)

export type LicenseStatus = 'valid' | 'expiring_soon' | 'expired';

export type UserRole = 'admin' | 'fleet_manager' | 'branch_manager' | 'viewer';

export interface UserPermissions {
  canViewLicenses: boolean;
  canEditLicenses: boolean;
  canAddVehicles: boolean;
  canTransferVehicles: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewAuditLog: boolean;
  canDeleteRecords?: boolean;
}

export interface SystemUser {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  title?: string;
  assignedBranch?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  permissions?: UserPermissions;
}

export interface LicenseInfo {
  licenseNumber: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  documentUrl?: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  plateLetters?: string;
  vin?: string;
  model: string;
  branch: string;
  trafficLicense: LicenseInfo;
  commercialLicense: LicenseInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferRecord {
  id: string;
  vehicleId?: string;
  vehicleNumber: string;
  fromBranch: string;
  toBranch: string;
  date: string;
  time: string;
  transferredBy: string;
  reason: string;
  notes?: string;
}

export interface AuditRecord {
  id: string;
  user: string;
  userRole?: string;
  action: string;
  vehicleNumber: string;
  oldValue: string;
  newValue: string;
  date: string;
  time: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  vehicleNumber?: string;
  priority: 'high' | 'medium' | 'low';
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  timestamp?: string;
  type?: 'traffic_expiry' | 'ad_expiry' | 'transfer' | 'system';
}

export interface AppSettings {
  expiringDaysThreshold: number; // default: 30
  criticalDaysThreshold?: number; // default: 7
  systemNameAr: string;
  systemNameEn: string;
  companyName: string;
  officialRegNumber?: string;
  taxNumber?: string;
  fleetManagerName?: string;
  fleetManagerEmail?: string;
  trafficLicenseFeeEst?: number; // EGP
  commercialLicenseFeeEst?: number; // EGP
  inspectionFeeEst?: number; // EGP
  taxRatePct?: number; // VAT %
  maxVehicleAgeYears?: number;
  enableNotifications: boolean;
  enableSoundAlerts?: boolean;
  dateFormat?: 'gregorian' | 'hijri_gregorian';
  theme: 'dark';
}

export interface FilterState {
  search: string;
  branch: string;
  licenseType: 'all' | 'traffic' | 'commercial';
  status: 'all' | 'valid' | 'expiring_soon' | 'expired';
  model?: string;
  vehicleNumber?: string;
  remainingDaysThreshold?: number;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'licenses' 
  | 'manage_data' 
  | 'add_license' 
  | 'transfers' 
  | 'reports' 
  | 'notifications' 
  | 'audit_log' 
  | 'settings';

