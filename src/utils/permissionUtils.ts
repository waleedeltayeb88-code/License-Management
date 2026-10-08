import { UserRole, UserPermissions, SystemUser } from '../types';

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewLicenses: true,
    canEditLicenses: true,
    canAddVehicles: true,
    canTransferVehicles: true,
    canExportReports: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewAuditLog: true,
    canDeleteRecords: true,
  },
  fleet_manager: {
    canViewLicenses: true,
    canEditLicenses: true,
    canAddVehicles: true,
    canTransferVehicles: true,
    canExportReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewAuditLog: true,
    canDeleteRecords: false,
  },
  branch_manager: {
    canViewLicenses: true,
    canEditLicenses: true,
    canAddVehicles: false,
    canTransferVehicles: false,
    canExportReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewAuditLog: false,
    canDeleteRecords: false,
  },
  viewer: {
    canViewLicenses: true,
    canEditLicenses: false,
    canAddVehicles: false,
    canTransferVehicles: false,
    canExportReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewAuditLog: false,
    canDeleteRecords: false,
  },
};

export interface PermissionDefinition {
  key: keyof UserPermissions;
  labelAr: string;
  labelEn: string;
  category: 'fleet' | 'admin' | 'reporting';
  descriptionAr: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'canViewLicenses',
    labelAr: 'استعراض بيانات وتراخيص الأسطول',
    labelEn: 'View Licenses',
    category: 'fleet',
    descriptionAr: 'الاطلاع على رخص التسيير وتصاريح الإعلانات وتواريخ الصلاحية والتنبيهات',
  },
  {
    key: 'canEditLicenses',
    labelAr: 'تجديد وتعديل الرخص والتصاريح',
    labelEn: 'Edit Licenses',
    category: 'fleet',
    descriptionAr: 'تحديث تواريخ انتهاء الرخص، رفع المستندات وتعديل أرقام وتفاصيل التراخيص',
  },
  {
    key: 'canAddVehicles',
    labelAr: 'إضافة مركبات جديدة للأسطول',
    labelEn: 'Add Vehicles',
    category: 'fleet',
    descriptionAr: 'تسجيل سيارات جديدة وإدخال بيانات الشاسيه ورقم اللوحة والفرع التابع',
  },
  {
    key: 'canTransferVehicles',
    labelAr: 'نقل السيارات بين الفروع',
    labelEn: 'Transfer Vehicles',
    category: 'fleet',
    descriptionAr: 'نقل تخصيص المركبة من فرع لآخر وتوثيق مسوغات النقل والمستلم',
  },
  {
    key: 'canExportReports',
    labelAr: 'تصدير التقارير وجداول Excel',
    labelEn: 'Export Reports',
    category: 'reporting',
    descriptionAr: 'تنزيل كشوف الرخص المنتهية، كشوف الفروع ومطبوعات الجرد الرسمي',
  },
  {
    key: 'canManageUsers',
    labelAr: 'إدارة المستخدمين والصلاحيات',
    labelEn: 'Manage Users',
    category: 'admin',
    descriptionAr: 'إنشاء حسابات دخول جديدة، تغيير كلمات المرور، تعليق الحسابات وتوزيع الأدوار',
  },
  {
    key: 'canManageSettings',
    labelAr: 'ضبط إعدادات النظام ومحددات التنبيه',
    labelEn: 'Manage Settings',
    category: 'admin',
    descriptionAr: 'تعديل مهلة أيام التنبيه (30/60 يوم)، الرسوم المقدرة، والبيانات المؤسسية',
  },
  {
    key: 'canViewAuditLog',
    labelAr: 'الاطلاع على سجل تدقيق الأمان والحركات',
    labelEn: 'View Audit Log',
    category: 'admin',
    descriptionAr: 'فحص الحركات المنفذة بالنظام، هوية المستخدم ووقت التعديل والقيم القديمة والجديدة',
  },
  {
    key: 'canDeleteRecords',
    labelAr: 'حذف المركبات أو السجلات',
    labelEn: 'Delete Records',
    category: 'admin',
    descriptionAr: 'حذف مركبة خارجة من الخدمة أو شطب سجل بشكل نهائي من قاعدة البيانات',
  },
];

export interface RoleMeta {
  role: UserRole;
  titleAr: string;
  badgeAr: string;
  descriptionAr: string;
  colorClass: string;
  badgeClass: string;
  iconName: 'Crown' | 'Truck' | 'Building2' | 'Eye';
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleMeta> = {
  admin: {
    role: 'admin',
    titleAr: 'مدير النظام العام (Master Administrator)',
    badgeAr: 'مدير عام 👑',
    descriptionAr: 'تحكم مطلق وغير مقيد في كافة مفاصل النظام، المستخدمين، الصلاحيات، الفروع والإعدادات الحساسة.',
    colorClass: 'text-amber-400 border-amber-500/50 bg-amber-500/10',
    badgeClass: 'bg-gradient-to-r from-amber-500/25 to-amber-600/20 text-amber-300 border-amber-400/40 shadow-sm',
    iconName: 'Crown',
  },
  fleet_manager: {
    role: 'fleet_manager',
    titleAr: 'مدير الحركة والأسطول (Fleet Operations Manager)',
    badgeAr: 'مدير الأسطول 🚛',
    descriptionAr: 'إدارة تشغيلية كاملة لأسطول التوصيل بكافة الفروع، تحديث الرخص، إضافة المركبات ونقل السيارات.',
    colorClass: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    iconName: 'Truck',
  },
  branch_manager: {
    role: 'branch_manager',
    titleAr: 'مدير فرع / مسؤول تشغيل الموقع (Branch Supervisor)',
    badgeAr: 'مدير فرع 🏢',
    descriptionAr: 'متابعة وتحديث رخص مركبات الفرع المخصص له حصراً (تم إيقاف وحجب صلاحية نقل السيارات بين الفروع).',
    colorClass: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    iconName: 'Building2',
  },
  viewer: {
    role: 'viewer',
    titleAr: 'مشاهد ومدقق تراخيص (Auditor / Viewer)',
    badgeAr: 'مدقق ومشاهد 👁️',
    descriptionAr: 'صلاحية قراءة وفحص التقارير والمطابقة وتنزيل كشوف الرخص دون إمكانية التعديل أو الحذف.',
    colorClass: 'text-slate-300 border-slate-500/50 bg-slate-500/10',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    iconName: 'Eye',
  },
};

/**
 * Sanitizes permissions for a given role while preserving explicit custom permission overrides
 * set by the administrator in the User Management system.
 */
export function sanitizeUserPermissions(
  role: UserRole,
  customPerms?: Partial<UserPermissions> | null
): UserPermissions {
  const defaults = ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.viewer;
  if (!customPerms) {
    return { ...defaults };
  }

  const merged: UserPermissions = {
    ...defaults,
    ...customPerms,
  };

  if (role === 'admin') {
    return {
      ...ROLE_DEFAULT_PERMISSIONS.admin,
      ...customPerms,
      canViewLicenses: true,
      canManageUsers: true,
    };
  }

  return {
    ...merged,
    canViewLicenses: true,
  };
}

/**
 * Returns the effective permissions for a user or active/simulated role.
 */
export function getUserPermissions(
  user?: SystemUser | null,
  activeRole?: UserRole
): UserPermissions {
  if (!user) {
    const r = activeRole || 'viewer';
    return { ...(ROLE_DEFAULT_PERMISSIONS[r] || ROLE_DEFAULT_PERMISSIONS.viewer) };
  }

  // If Admin is simulating another role in the UI, strictly apply that simulated role's permissions
  if (activeRole && activeRole !== user.role) {
    return { ...(ROLE_DEFAULT_PERMISSIONS[activeRole] || ROLE_DEFAULT_PERMISSIONS.viewer) };
  }

  return sanitizeUserPermissions(user.role, user.permissions);
}

/**
 * Checks whether a user has permission to perform a specific action.
 */
export function canUserPerformAction(
  action: keyof UserPermissions,
  user?: SystemUser | null,
  role?: UserRole
): boolean {
  const perms = getUserPermissions(user, role || user?.role || 'viewer');
  return !!perms[action];
}

