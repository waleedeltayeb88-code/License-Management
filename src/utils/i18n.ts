export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    systemName: 'سعودي سوبر ماركت',
    brandName: 'SEOUDI SUPERMARKET',
    tagline: 'منظومة إدارة ومتابعة رخص أسطول سيارات التوصيل والفروع (مصر)',
    licenseCategories: 'رخصة تسيير المرور - تصريح إعلان المحليات',
    reportDate: 'تاريخ التقرير',
    lastUpdate: 'آخر تحديث',
    refreshData: 'تحديث البيانات',
    searchPlaceholder: 'ابحث برقم السيارة (مثال: أ ب ج 3119)، الشاسيه، الفرع...',
    quickSearch: 'بحث سريع',
    
    // Sidebar Tabs
    navDashboard: 'لوحة التحكم',
    navLicenseTracking: 'متابعة الرخص',
    navAllVehicles: 'جميع السيارات',
    navAddLicense: 'إضافة رخصة جديدة',
    navEditData: 'إدارة البيانات',
    navTransferHistory: 'سجل نقل السيارات',
    navReports: 'التقارير والتحليلات',
    navNotifications: 'التنبيهات',
    navAuditLog: 'سجل العمليات',
    navSettings: 'الإعدادات',

    // Quick Actions
    quickActions: 'الإجراءات السريعة',
    addLicenseBtn: 'إضافة رخصة جديدة',
    editDataBtn: 'تعديل وإدارة البيانات',
    transferVehicleBtn: 'نقل سيارة بين الفروع',
    exportDataBtn: 'تصدير تقرير الأسطول (Excel)',

    // License Types
    trafficLicense: 'رخصة تسيير (المرور المصري)',
    trafficLicenseShort: 'رخصة سير',
    commercialLicense: 'تصريح إعلان تجاري (المحليات)',
    commercialLicenseShort: 'تصريح إعلان',

    // Statuses
    statusValid: 'سارية',
    statusExpiringSoon: 'قريبة من الإنتهاء',
    statusExpired: 'منتهية',
    allStatuses: 'جميع الحالات',
    allBranches: 'جميع الفروع',
    allTypes: 'جميع أنواع الرخص',

    // KPIs
    totalVehicles: 'إجمالي أسطول التوصيل',
    vehiclesUnit: 'سيارة',
    validRate: 'نسبة الجاهزية والامتثال',
    within30Days: 'خلال 30 يوم',
    licenseStatusDistribution: 'توزيع الرخص حسب الحالة (إجمالي)',
    expiredByBranch: 'الرخص المنتهية حسب فروع مصر',
    expiringByBranch: 'قريبة من الإنتهاء حسب فروع مصر',
    trafficVsCommercial: 'مقارنة: رخص التسيير (المرور) vs تصاريح الإعلانات',

    // Table Columns
    colSeq: '#',
    colVehicleNum: 'رقم اللوحة (مصر)',
    colModel: 'موديل السيارة',
    colBranch: 'الفرع',
    colLicenseNum: 'رقم الرخصة',
    colIssueDate: 'تاريخ الإصدار',
    colExpiryDate: 'تاريخ الانتهاء',
    colDaysLeft: 'الأيام المتبقية',
    colStatus: 'الحالة',
    colNotes: 'ملاحظات',
    colActions: 'الإجراء',

    // Details & Drawer
    vehicleDetails: 'تفاصيل السيارة والرخص',
    vehicleProfile: 'ملف السيارة',
    generalStatus: 'الحالة العامة',
    documents: 'الوثائق والمستندات',
    activityTimeline: 'سجل النشاط الزمني',
    manageDataForVehicle: 'إدارة وتعديل بيانات السيارة',

    // Filter Panel
    filterPanelTitle: 'فلتر البحث والتصفية',
    filterBranch: 'الفرع',
    filterLicenseType: 'نوع الرخصة',
    filterStatus: 'الحالة',
    filterModel: 'موديل السيارة',
    filterVehicleNum: 'رقم السيارة',
    resetFilters: 'إعادة ضبط',
    applyFilters: 'تطبيق الفلتر',

    // Edit & Transfer
    searchVehicleToManage: 'ابحث عن رقم السيارة لإدارتها',
    transferSectionTitle: 'نقل السيارة لفرع آخر',
    currentBranch: 'الفرع الحالي',
    targetBranch: 'الفرع الجديد المستهدف',
    transferReason: 'سبب النقل',
    transferDate: 'تاريخ النقل',
    confirmTransfer: 'تأكيد عملية النقل',
    saveChanges: 'حفظ التعديلات',

    // Add Form
    selectVehicle: 'اختر السيارة',
    selectBranch: 'اختر الفرع',
    selectLicenseType: 'اختر نوع الرخصة',
    uploadLicensePhoto: 'رفع صورة / مستند الرخصة',
    dragDropPhoto: 'اسحب وأفلت صورة الرخصة هنا أو اضغط للاستعراض',
    licenseSavedSuccess: 'تم حفظ بيانات الرخصة بنجاح!',

    // Roles
    roleAdmin: 'مدير عام (Admin)',
    roleFleetManager: 'مدير أسطول النقل (Fleet Manager)',
    roleBranchManager: 'مدير فرع (Branch Manager)',
    roleViewer: 'مشاهد (Viewer - قراءة فقط)',
    roleBadge: 'الصلاحية الحالية',
    switchRoleNotice: 'تبديل الصلاحية للمعاينة والاختبار',
    permissionDeniedMsg: 'عذرًا، هذه العملية غير متاحة لصلاحية المستخدم الحالي (قراءة فقط).',

    // Reports
    reportAllVehicles: 'تقرير جميع سيارات الأسطول',
    reportTrafficLicenses: 'تقرير رخص التسيير فقط',
    reportCommercialLicenses: 'تقرير رخص وتصاريح الإعلان فقط',
    reportExpiredOnly: 'تقرير الرخص المنتهية',
    reportExpiringSoonOnly: 'تقرير الرخص القريبة من الانتهاء',
    reportBranchSummary: 'تقرير ملخص فروع سعودي سوبر ماركت',
    reportDailyTransfers: 'سجل حركة السيارات اليومي بين الفروع',
    exportExcelBtn: 'تصدير إلى Excel (.xlsx)',
    printReportBtn: 'طباعة التقرير',

    // Notifications & Logs
    notificationsTitle: 'مركز التنبيهات الذكي',
    markAllRead: 'تحديد الكل كمقروء',
    unreadCount: 'غير مقروءة',
    auditLogTitle: 'سجل الحركات الشامل (Audit Trail)',
    logUser: 'المستخدم',
    logAction: 'العملية',
    logVehicle: 'السيارة',
    logOldValue: 'القيمة السابقة',
    logNewValue: 'القيمة الجديدة',
    logDateTime: 'التاريخ والوقت',

    // Settings
    settingsTitle: 'إعدادات منظومة أسطول سعودي سوبر ماركت',
    settingsThresholdLabel: 'مهلة التنبيه بالانتهاء القريب (بالأيام)',
    settingsThresholdDesc: 'عدد الأيام المتبقية لاعتبار الرخصة "قريبة من الإنتهاء" (افتراضيًا: 30 يوم)',
    systemReferenceDate: 'تاريخ التقرير المرجعي بالنظام',
    saveSettings: 'حفظ الإعدادات'
  },
  en: {
    systemName: 'Seoudi Supermarket',
    brandName: 'SEOUDI SUPERMARKET',
    tagline: 'Delivery Fleet License Management System (Egypt)',
    licenseCategories: 'Traffic License - Commercial Ad Permit',
    reportDate: 'Report Date',
    lastUpdate: 'Last Updated',
    refreshData: 'Refresh Data',
    searchPlaceholder: 'Search vehicle no., license no., branch...',
    quickSearch: 'Quick Search',
    
    // Sidebar Tabs
    navDashboard: 'Dashboard',
    navLicenseTracking: 'License Tracking',
    navAllVehicles: 'All Vehicles',
    navAddLicense: 'Add New License',
    navEditData: 'Data Management',
    navTransferHistory: 'Vehicle Transfer Log',
    navReports: 'Reports & Analytics',
    navNotifications: 'Notifications',
    navAuditLog: 'Audit Log',
    navSettings: 'Settings',

    // Quick Actions
    quickActions: 'Quick Actions',
    addLicenseBtn: 'Add New License',
    editDataBtn: 'Edit & Manage Data',
    transferVehicleBtn: 'Transfer Vehicle Branch',
    exportDataBtn: 'Export to Excel (.xlsx)',

    // License Types
    trafficLicense: 'Traffic Registration License',
    trafficLicenseShort: 'Traffic License',
    commercialLicense: 'Commercial Ad License',
    commercialLicenseShort: 'Commercial Ad',

    // Statuses
    statusValid: 'Valid',
    statusExpiringSoon: 'Expiring Soon',
    statusExpired: 'Expired',
    allStatuses: 'All Statuses',
    allBranches: 'All Branches',
    allTypes: 'All License Types',

    // KPIs
    totalVehicles: 'Total Vehicles',
    vehiclesUnit: 'Vehicles',
    validRate: 'Valid Licenses Rate',
    within30Days: 'Within 30 Days',
    licenseStatusDistribution: 'License Status Distribution (Total)',
    expiredByBranch: 'Expired Licenses by Branch',
    expiringByBranch: 'Expiring Soon by Branch',
    trafficVsCommercial: 'Comparison: Traffic vs Commercial Licenses',

    // Table Columns
    colSeq: '#',
    colVehicleNum: 'Vehicle #',
    colModel: 'Model',
    colBranch: 'Branch',
    colLicenseNum: 'License #',
    colIssueDate: 'Issue Date',
    colExpiryDate: 'Expiry Date',
    colDaysLeft: 'Remaining Days',
    colStatus: 'Status',
    colNotes: 'Notes',
    colActions: 'Action',

    // Details & Drawer
    vehicleDetails: 'Vehicle & License Details',
    vehicleProfile: 'Vehicle Profile',
    generalStatus: 'General Status',
    documents: 'Documents & Attachments',
    activityTimeline: 'Activity Timeline',
    manageDataForVehicle: 'Manage & Edit Vehicle',

    // Filter Panel
    filterPanelTitle: 'Search & Global Filters',
    filterBranch: 'Branch',
    filterLicenseType: 'License Type',
    filterStatus: 'Status',
    filterModel: 'Model',
    filterVehicleNum: 'Vehicle #',
    resetFilters: 'Reset Filters',
    applyFilters: 'Apply Filters',

    // Edit & Transfer
    searchVehicleToManage: 'Search vehicle number to manage',
    transferSectionTitle: 'Transfer Vehicle to Another Branch',
    currentBranch: 'Current Branch',
    targetBranch: 'Target Branch',
    transferReason: 'Transfer Reason',
    transferDate: 'Transfer Date',
    confirmTransfer: 'Confirm Transfer',
    saveChanges: 'Save Changes',

    // Add Form
    selectVehicle: 'Select Vehicle',
    selectBranch: 'Select Branch',
    selectLicenseType: 'Select License Type',
    uploadLicensePhoto: 'Upload License Document',
    dragDropPhoto: 'Drag and drop license document or click to browse',
    licenseSavedSuccess: 'License details saved successfully!',

    // Roles
    roleAdmin: 'Administrator (Full Access)',
    roleFleetManager: 'Fleet Manager',
    roleBranchManager: 'Branch Manager',
    roleViewer: 'Viewer (Read Only)',
    roleBadge: 'Active Role',
    switchRoleNotice: 'Switch role to test access boundaries',
    permissionDeniedMsg: 'Permission denied: This action is restricted for your role.',

    // Reports
    reportAllVehicles: 'All Fleet Vehicles Report',
    reportTrafficLicenses: 'Traffic Licenses Report',
    reportCommercialLicenses: 'Commercial Ad Licenses Report',
    reportExpiredOnly: 'Expired Licenses Report',
    reportExpiringSoonOnly: 'Expiring Soon Licenses Report',
    reportBranchSummary: 'Branch Summary Report',
    reportDailyTransfers: 'Daily Comprehensive Vehicle Log',
    exportExcelBtn: 'Export to Excel (.xlsx)',
    printReportBtn: 'Print Report',

    // Notifications & Logs
    notificationsTitle: 'Notification Center',
    markAllRead: 'Mark all as read',
    unreadCount: 'Unread',
    auditLogTitle: 'System Audit Trail',
    logUser: 'User',
    logAction: 'Action',
    logVehicle: 'Vehicle',
    logOldValue: 'Previous Value',
    logNewValue: 'New Value',
    logDateTime: 'Date & Time',

    // Settings
    settingsTitle: 'FLEETORA System Settings',
    settingsThresholdLabel: 'Expiring Soon Threshold (Days)',
    settingsThresholdDesc: 'Days before expiration to mark status as "Expiring Soon" (Default: 30 days)',
    systemReferenceDate: 'Report Baseline Reference Date',
    saveSettings: 'Save Settings'
  }
};
