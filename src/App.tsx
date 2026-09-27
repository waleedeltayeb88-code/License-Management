import React, { useState, useMemo, useEffect } from 'react';
import { 
  Vehicle, 
  FilterState, 
  UserRole, 
  TransferRecord, 
  AuditRecord, 
  SystemNotification,
  AppSettings,
  SystemUser
} from './types';
import { 
  initialVehicles, 
  initialTransfers, 
  initialAuditLogs, 
  initialNotifications, 
  BRANCHES,
  INITIAL_SETTINGS,
  INITIAL_USERS
} from './data/mockData';
import { getLicenseStatus, DEFAULT_REPORT_DATE } from './utils/dateUtils';
import { Language } from './utils/i18n';
import { exportVehiclesToExcel } from './utils/exportUtils';
import { getUserPermissions } from './utils/permissionUtils';
import { Car, FileText, Plus, ArrowLeftRight, Users, ShieldCheck, Crown } from 'lucide-react';

// Master Components
import { Header } from './components/Header';
import { TopMetricCards } from './components/TopMetricCards';
import { ModernFilterBar } from './components/ModernFilterBar';
import { ChartsSection } from './components/ChartsSection';
import { LicenseTable } from './components/LicenseTable';
import { BottomNav, BottomNavTab } from './components/BottomNav';

// Modals & Views
import { EditVehicleModal } from './components/modals/EditVehicleModal';
import { TransferVehicleModal } from './components/modals/TransferVehicleModal';
import { AddVehicleModal } from './components/modals/AddVehicleModal';
import { ExportModal } from './components/modals/ExportModal';
import { VehicleDrawer } from './components/VehicleDrawer';
import { ReportsView } from './components/ReportsView';
import { TransferHistoryView } from './components/TransferHistoryView';
import { SettingsView } from './components/SettingsView';
import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/modals/LoginModal';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { SupabaseModal } from './components/SupabaseModal';
import { 
  fetchVehiclesFromSupabase, 
  saveVehicleToSupabase, 
  saveTransferToSupabase, 
  deleteVehicleFromSupabase 
} from './lib/supabase';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');

  // Sync HTML lang and dir for RTL
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Parameters
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [thresholdDays, setThresholdDays] = useState<number>(INITIAL_SETTINGS.expiringDaysThreshold || 30);
  const [referenceDate, setReferenceDate] = useState<string>(() => DEFAULT_REPORT_DATE);
  const [lastUpdate, setLastUpdate] = useState<string>('10:30 ص');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // User Authentication & Management State (Initialized with Admin only as requested)
  const [users, setUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('seoudi_fleet_users_v3');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Guarantee that branch_manager users do not retain vehicle transfer rights from previous state
          return parsed.map((u: SystemUser) => {
            if (u.role === 'branch_manager' && u.permissions?.canTransferVehicles) {
              return {
                ...u,
                permissions: { ...u.permissions, canTransferVehicles: false },
              };
            }
            return u;
          });
        }
      } catch (e) {}
    }
    // Clean up older cached demo users
    try {
      localStorage.removeItem('seoudi_fleet_users');
    } catch (e) {}
    return INITIAL_USERS;
  });

  // Default to null so landing page is the website's initial starting page
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    const saved = localStorage.getItem('seoudi_fleet_current_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.username === 'admin') {
          parsed.name = 'وليد عادل';
          parsed.email = 'Walid.Adel@Seoudisupermarket.com';
          parsed.phone = '01144542800';
        }
        if (parsed.role === 'branch_manager' && parsed.permissions?.canTransferVehicles) {
          return {
            ...parsed,
            permissions: { ...parsed.permissions, canTransferVehicles: false },
          };
        }
        return parsed;
      } catch (e) {}
    }
    return null;
  });

  const currentUserPermissions = useMemo(() => {
    return getUserPermissions(currentUser, userRole);
  }, [currentUser, userRole]);

  const canUserTransfer = currentUserPermissions.canTransferVehicles;

  const [isLandingView, setIsLandingView] = useState<boolean>(true);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('seoudi_fleet_users_v3', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('seoudi_fleet_current_user', JSON.stringify(currentUser));
      } catch (e) {}
      setUserRole(currentUser.role);
    } else {
      try {
        localStorage.removeItem('seoudi_fleet_current_user');
      } catch (e) {}
    }
  }, [currentUser]);

  const handleQuickLogin = (role: UserRole) => {
    const target = users.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
      setUserRole(target.role);
      setIsLandingView(false);
      setIsLoginOpen(false);
    }
  };

  const handleLogin = (user: SystemUser) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsLandingView(false);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLandingView(true);
  };

  // Primary Data State
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [transfers, setTransfers] = useState<TransferRecord[]>(initialTransfers);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);

  // Bottom Navigation Active Tab
  const [bottomTab, setBottomTab] = useState<BottomNavTab>('dashboard');

  // Modals Open State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  // Auto-fetch data from Supabase on mount if available
  useEffect(() => {
    let isMounted = true;
    async function loadCloudVehicles() {
      try {
        const cloudVehicles = await fetchVehiclesFromSupabase();
        if (isMounted && cloudVehicles && cloudVehicles.length > 0) {
          setVehicles(cloudVehicles);
        }
      } catch (err) {
        console.error('Supabase load error:', err);
      }
    }
    loadCloudVehicles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Global Search & Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    branch: 'all',
    licenseType: 'all',
    status: 'all',
    model: 'all',
    remainingDaysThreshold: thresholdDays,
  });

  // Calculate stats
  const stats = useMemo(() => {
    let tValid = 0;
    let tExpiring = 0;
    let tExpired = 0;

    let cValid = 0;
    let cExpiring = 0;
    let cExpired = 0;

    let fullyCompliantCount = 0;

    (vehicles || []).forEach((v) => {
      const tStat = getLicenseStatus(v.trafficLicense.expiryDate, thresholdDays, referenceDate);
      if (tStat === 'valid') tValid++;
      else if (tStat === 'expiring_soon') tExpiring++;
      else if (tStat === 'expired') tExpired++;

      const cStat = getLicenseStatus(v.commercialLicense.expiryDate, thresholdDays, referenceDate);
      if (cStat === 'valid') cValid++;
      else if (cStat === 'expiring_soon') cExpiring++;
      else if (cStat === 'expired') cExpired++;

      // Vehicle where BOTH traffic AND commercial licenses are strictly valid (> threshold days)
      if (tStat === 'valid' && cStat === 'valid') {
        fullyCompliantCount++;
      }
    });

    const totalVehiclesCount = vehicles.length > 0 ? vehicles.length : 100;
    const rawCompliance = Math.round((fullyCompliantCount / totalVehiclesCount) * 100);
    const trafficCompliance = isNaN(rawCompliance) ? 0 : rawCompliance;

    return {
      traffic: {
        total: totalVehiclesCount,
        valid: tValid,
        expiring: tExpiring,
        expired: tExpired,
      },
      commercial: {
        total: totalVehiclesCount,
        valid: cValid,
        expiring: cExpiring,
        expired: cExpired,
      },
      complianceRate: trafficCompliance,
      fullyCompliantCount,
    };
  }, [vehicles, thresholdDays, referenceDate]);

  // Live Navigation Counts & Badges
  const navCounts = useMemo(() => {
    let alertCount = 0;
    (vehicles || []).forEach((v) => {
      const tStat = getLicenseStatus(v.trafficLicense.expiryDate, thresholdDays, referenceDate);
      const cStat = getLicenseStatus(v.commercialLicense.expiryDate, thresholdDays, referenceDate);
      if (tStat === 'expiring_soon' || tStat === 'expired' || cStat === 'expiring_soon' || cStat === 'expired') {
        alertCount++;
      }
    });

    return {
      totalVehicles: vehicles.length,
      expiringLicenses: alertCount,
      transfersCount: transfers.length,
      thresholdDays: thresholdDays,
    };
  }, [vehicles, transfers, thresholdDays, referenceDate]);

  // Filtered vehicles with thorough search matching
  const filteredVehicles = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return (vehicles || []).filter((v) => {
      // 1. Text Search query matching plate, model, branch, licenses, notes
      if (query) {
        const matchPlateNum = (v.vehicleNumber || '').toLowerCase().includes(query);
        const matchPlateLetters = (v.plateLetters || '').toLowerCase().includes(query);
        const matchCombined = `${v.plateLetters || ''} ${v.vehicleNumber || ''}`.toLowerCase().includes(query);
        const matchModel = (v.model || '').toLowerCase().includes(query);
        const matchBranch = (v.branch || '').toLowerCase().includes(query);
        const matchTrafficLic = (v.trafficLicense.licenseNumber || '').toLowerCase().includes(query);
        const matchCommLic = (v.commercialLicense.licenseNumber || '').toLowerCase().includes(query);
        const matchNotes = (v.notes || '').toLowerCase().includes(query);

        if (!matchPlateNum && !matchPlateLetters && !matchCombined && !matchModel && !matchBranch && !matchTrafficLic && !matchCommLic && !matchNotes) {
          return false;
        }
      }

      // 2. Branch filter
      if (filters.branch !== 'all' && v.branch !== filters.branch) {
        return false;
      }

      // 3. Model filter
      if (filters.model && filters.model !== 'all' && v.model !== filters.model) {
        return false;
      }

      // 4. Status filter
      const tStat = getLicenseStatus(v.trafficLicense.expiryDate, thresholdDays, referenceDate);
      const cStat = getLicenseStatus(v.commercialLicense.expiryDate, thresholdDays, referenceDate);

      if (filters.status !== 'all') {
        if (filters.licenseType === 'traffic') {
          if (tStat !== filters.status) return false;
        } else if (filters.licenseType === 'commercial') {
          if (cStat !== filters.status) return false;
        } else {
          // Both licenses active together ('all')
          if (filters.status === 'valid') {
            // Fully compliant: both traffic AND commercial must be valid
            if (tStat !== 'valid' || cStat !== 'valid') return false;
          } else {
            // For expiring_soon or expired: vehicle qualifies if EITHER license is expiring_soon / expired
            if (tStat !== filters.status && cStat !== filters.status) return false;
          }
        }
      }

      return true;
    });
  }, [vehicles, filters, thresholdDays, referenceDate]);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const cloudVehicles = await fetchVehiclesFromSupabase();
      if (cloudVehicles && cloudVehicles.length > 0) {
        setVehicles(cloudVehicles);
      }
    } catch (e) {
      console.error('Refresh error:', e);
    }
    setLastUpdate(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    setIsRefreshing(false);
  };

  const handleAddVehicle = (newV: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created: Vehicle = {
      ...newV,
      id: `v-${newV.vehicleNumber}-${Date.now().toString().slice(-4)}`,
      createdAt: referenceDate,
      updatedAt: referenceDate,
    };
    setVehicles([created, ...vehicles]);
    // Save to Supabase cloud
    saveVehicleToSupabase(created);
  };

  const handleUpdateVehicle = (updatedV: Vehicle) => {
    setVehicles(vehicles.map((v) => (v.id === updatedV.id ? updatedV : v)));
    // Save to Supabase cloud
    saveVehicleToSupabase(updatedV);
  };

  const handleTransferVehicle = (
    vehicleId: string,
    fromBranch: string,
    toBranch: string,
    reason: string,
    notes: string,
    date: string
  ) => {
    if (!canUserTransfer) {
      alert(
        lang === 'ar'
          ? 'عفواً، تم حجب صلاحية نقل المركبات بين الفروع عن مدير الفرع (مقتصرة على مدير الأسطول والمدير العام فقط).'
          : 'Transferring vehicles is restricted to Fleet Managers and Administrators.'
      );
      return;
    }
    const target = vehicles.find((v) => v.id === vehicleId);
    if (target) {
      const updatedVehicle = { ...target, branch: toBranch };
      setVehicles(vehicles.map((v) => (v.id === vehicleId ? updatedVehicle : v)));
      // Save update to Supabase
      saveVehicleToSupabase(updatedVehicle);
    }
    const record: TransferRecord = {
      id: `tr-${Date.now()}`,
      vehicleId,
      vehicleNumber: vehicles.find((v) => v.id === vehicleId)?.vehicleNumber || '',
      fromBranch,
      toBranch,
      date,
      time: '10:30 ص',
      transferredBy: currentUser?.name || 'مدير عمليات سعودي',
      reason,
      notes,
    };
    setTransfers([record, ...transfers]);
    // Save transfer log to Supabase
    saveTransferToSupabase(record);
  };

  if (!currentUser || isLandingView) {
    return (
      <div className="min-h-screen bg-[#060b14] text-slate-100 font-sans">
        <LandingPage
          onLogin={handleLogin}
          users={users}
          totalFleet={vehicles.length}
          branchesCount={BRANCHES.length}
          lang={lang}
          existingUser={currentUser}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 antialiased font-sans flex flex-col justify-between p-2.5 sm:p-4 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-[1780px] mx-auto flex-1 flex flex-col">
        {/* 1. TOP HEADER */}
        <Header
          lang={lang}
          currentRole={userRole}
          userRole={userRole}
          onChangeRole={setUserRole}
          reportDate={referenceDate}
          lastUpdate={lastUpdate}
          isRefreshing={isRefreshing}
          onRefreshData={handleRefresh}
          totalFleet={vehicles.length}
          currentUser={currentUser}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenLandingPage={() => setIsLandingView(true)}
          onLogout={handleLogout}
          onSelectTab={(tab) => setBottomTab(tab)}
          usersCount={users.length}
          onOpenSupabase={() => setIsSupabaseOpen(true)}
        />

        {/* 2. EXECUTIVE PRIMARY NAVIGATION (Matches nav:nth-of-type(1)) */}
        <BottomNav
          lang={lang}
          activeTab={bottomTab}
          isAdmin={currentUser?.role === 'admin'}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onSelectTab={(tab) => {
            setBottomTab(tab);
            if (tab === 'vehicles_list') {
              setFilters({
                search: '',
                branch: 'all',
                status: 'all',
                licenseType: 'all',
                model: 'all',
                remainingDaysThreshold: thresholdDays,
              });
            }
          }}
          counts={navCounts}
        />

        {/* 3. DYNAMIC TAB VIEWS */}

        {/* VIEW A: DASHBOARD (لوحة التحكم العامة) */}
        {bottomTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Executive Metric KPI Cards */}
            <TopMetricCards
              lang={lang}
              trafficMetrics={stats.traffic}
              commercialMetrics={stats.commercial}
              complianceRate={stats.complianceRate}
              fullyCompliantCount={stats.fullyCompliantCount}
              totalVehicles={vehicles.length}
              thresholdDays={thresholdDays}
              activeStatusFilter={filters.status}
              activeLicenseTypeFilter={filters.licenseType}
              onSelectStatus={(status, licenseType) => {
                setFilters(prev => ({
                  ...prev,
                  status,
                  licenseType: licenseType || prev.licenseType,
                }));
              }}
            />

            {/* Apple SaaS Toolbar */}
            <ModernFilterBar
              lang={lang}
              filters={filters}
              onFilterChange={setFilters}
              branches={BRANCHES}
              totalResults={filteredVehicles.length}
              totalFleet={vehicles.length}
              onAddLicense={() => setIsAddOpen(true)}
              onEditData={() => {
                setActiveVehicle(vehicles[0] || null);
                setIsEditOpen(true);
              }}
              onTransferVehicle={() => {
                setActiveVehicle(vehicles[0] || null);
                setIsTransferOpen(true);
              }}
              onExportData={() => setIsExportOpen(true)}
            />

            {/* Analytics & Charts */}
            <ChartsSection
              lang={lang}
              vehicles={filteredVehicles}
              thresholdDays={thresholdDays}
              referenceDate={referenceDate}
              onFilterBranch={(branch) => setFilters(prev => ({ ...prev, branch }))}
              onFilterStatus={(status) => setFilters(prev => ({ ...prev, status }))}
            />

            {/* Master Fleet & License Table */}
            <div className="mb-4">
              <LicenseTable
                lang={lang}
                vehicles={filteredVehicles}
                thresholdDays={thresholdDays}
                referenceDate={referenceDate}
                onSelectVehicle={(v) => {
                  setActiveVehicle(v);
                  setIsDrawerOpen(true);
                }}
                onManageVehicle={(v) => {
                  setActiveVehicle(v);
                  setIsEditOpen(true);
                }}
                onTransferVehicle={(v) => {
                  setActiveVehicle(v);
                  setIsTransferOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW B: VEHICLES FLEET LIST (قائمة أسطول السيارات) */}
        {bottomTab === 'vehicles_list' && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/25 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {lang === 'ar' ? 'إدارة وتصفية أسطول سيارات سعودي سوبر ماركت' : 'Seoudi Supermarket Fleet Directory'}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {lang === 'ar'
                      ? `استعراض أسطول النقل والتوصيل بالكامل (${vehicles.length} مركبة) عبر جميع الفروع مع تحكم فوري.`
                      : `Complete overview of all ${vehicles.length} delivery fleet vehicles with branch tracking.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إضافة سيارة جديدة' : 'Add Vehicle'}</span>
                </button>
                {canUserTransfer && (
                  <button
                    onClick={() => setIsTransferOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'نقل سيارة بين الفروع' : 'Transfer Vehicle'}</span>
                  </button>
                )}
              </div>
            </div>

            <ModernFilterBar
              lang={lang}
              filters={filters}
              onFilterChange={setFilters}
              branches={BRANCHES}
              totalResults={filteredVehicles.length}
              totalFleet={vehicles.length}
              onAddLicense={() => setIsAddOpen(true)}
              onEditData={() => {
                setActiveVehicle(vehicles[0] || null);
                setIsEditOpen(true);
              }}
              canTransferVehicle={canUserTransfer}
              onTransferVehicle={canUserTransfer ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsTransferOpen(true);
              } : undefined}
              onExportData={() => setIsExportOpen(true)}
            />

            <LicenseTable
              lang={lang}
              vehicles={filteredVehicles}
              thresholdDays={thresholdDays}
              referenceDate={referenceDate}
              onSelectVehicle={(v) => {
                setActiveVehicle(v);
                setIsDrawerOpen(true);
              }}
              onManageVehicle={(v) => {
                setActiveVehicle(v);
                setIsEditOpen(true);
              }}
              onTransferVehicle={canUserTransfer ? (v) => {
                setActiveVehicle(v);
                setIsTransferOpen(true);
              } : undefined}
            />
          </div>
        )}

        {/* VIEW C: ALL LICENSES (مراقبة وتجديد الرخص والتصاريح) */}
        {bottomTab === 'all_licenses' && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/25 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {lang === 'ar' ? 'مركز مراقبة وتجديد الرخص والتصاريح' : 'License & Permits Compliance Center'}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {lang === 'ar'
                      ? `رخص المرور الرسمية وتصاريح الإعلانات الصادرة من المحليات، مع إشعارات المهل المعتمدة (${thresholdDays} يوم).`
                      : `Traffic and commercial advertising licenses compliance and upcoming renewal dates.`}
                  </p>
                </div>
              </div>

              {/* Quick Status Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: 'all', licenseType: 'all' }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filters.status === 'all' && filters.licenseType === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {lang === 'ar' ? 'كل الرخص' : 'All'}
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: 'expired' }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filters.status === 'expired'
                      ? 'bg-rose-500 text-white shadow-md font-black'
                      : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30'
                  }`}
                >
                  {lang === 'ar' ? 'المنتهية فقط' : 'Expired Only'}
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: 'expiring_soon' }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filters.status === 'expiring_soon'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                  }`}
                >
                  {lang === 'ar' ? `وشيكة (${thresholdDays} يوم)` : 'Expiring Soon'}
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: 'valid' }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filters.status === 'valid'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                  }`}
                >
                  {lang === 'ar' ? 'السارية' : 'Valid'}
                </button>
              </div>
            </div>

            <TopMetricCards
              lang={lang}
              trafficMetrics={stats.traffic}
              commercialMetrics={stats.commercial}
              complianceRate={stats.complianceRate}
              fullyCompliantCount={stats.fullyCompliantCount}
              totalVehicles={vehicles.length}
              thresholdDays={thresholdDays}
              activeStatusFilter={filters.status}
              activeLicenseTypeFilter={filters.licenseType}
              onSelectStatus={(status, licenseType) => {
                setFilters(prev => ({
                  ...prev,
                  status,
                  licenseType: licenseType || prev.licenseType,
                }));
              }}
            />

            <ModernFilterBar
              lang={lang}
              filters={filters}
              onFilterChange={setFilters}
              branches={BRANCHES}
              totalResults={filteredVehicles.length}
              totalFleet={vehicles.length}
              onAddLicense={() => setIsAddOpen(true)}
              onEditData={() => {
                setActiveVehicle(vehicles[0] || null);
                setIsEditOpen(true);
              }}
              canTransferVehicle={canUserTransfer}
              onTransferVehicle={canUserTransfer ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsTransferOpen(true);
              } : undefined}
              onExportData={() => setIsExportOpen(true)}
            />

            <LicenseTable
              lang={lang}
              vehicles={filteredVehicles}
              thresholdDays={thresholdDays}
              referenceDate={referenceDate}
              onSelectVehicle={(v) => {
                setActiveVehicle(v);
                setIsDrawerOpen(true);
              }}
              onManageVehicle={(v) => {
                setActiveVehicle(v);
                setIsEditOpen(true);
              }}
              onTransferVehicle={canUserTransfer ? (v) => {
                setActiveVehicle(v);
                setIsTransferOpen(true);
              } : undefined}
            />
          </div>
        )}

        {/* VIEW D: REPORTS & AUDIT (التقارير والطباعة) */}
        {bottomTab === 'reports' && (
          <div className="mb-6">
            <ReportsView
              lang={lang}
              vehicles={vehicles}
              thresholdDays={thresholdDays}
              referenceDate={referenceDate}
            />
          </div>
        )}

        {/* VIEW E: TRANSFER HISTORY (سجل النقل وحركة الفروع) */}
        {bottomTab === 'transfers' && (
          <div className="mb-6">
            <TransferHistoryView
              lang={lang}
              transfers={transfers}
              onSelectVehicleNumber={(num) => {
                const found = vehicles.find(v => v.vehicleNumber === num);
                if (found) {
                  setActiveVehicle(found);
                  setIsDrawerOpen(true);
                } else {
                  setFilters(prev => ({ ...prev, search: num }));
                  setBottomTab('dashboard');
                }
              }}
              onInitiateTransfer={canUserTransfer ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsTransferOpen(true);
              } : undefined}
            />
          </div>
        )}

        {/* VIEW F: SYSTEM SETTINGS (إعدادات النظام والمهل) */}
        {bottomTab === 'settings' && (
          <div className="mb-6">
            <SettingsView
              lang={lang}
              thresholdDays={thresholdDays}
              onUpdateThreshold={setThresholdDays}
              referenceDate={referenceDate}
              onUpdateReferenceDate={setReferenceDate}
              userRole={userRole}
              onUpdateRole={setUserRole}
              branches={BRANCHES}
              totalVehicles={vehicles.length}
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                if (newSettings.expiringDaysThreshold) {
                  setThresholdDays(newSettings.expiringDaysThreshold);
                }
              }}
              vehicles={vehicles}
              onRestoreVehicles={setVehicles}
              onOpenUserManagement={() => setIsUserManagementOpen(true)}
            />
          </div>
        )}

        {/* Subtle Executive Footer */}
        <footer className="mt-8 pt-4 pb-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>شركة سعودي سوبر ماركت ش.م.م © {new Date().getFullYear()} • إدارة رخص الأسطول</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono tracking-wide">
            <span>© Designed by Walid</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span>العمليات واللوجستيات</span>
            <span>•</span>
            <span>إصدار 2026</span>
          </div>
        </footer>
      </div>

      {/* GLOBAL MODALS */}
      {/* 1. Add Vehicle / License Modal */}
      <AddVehicleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        branches={BRANCHES}
        onAdd={handleAddVehicle}
        lang={lang}
      />

      {/* 2. Edit Vehicle & Licenses Modal */}
      <EditVehicleModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        vehicles={vehicles}
        branches={BRANCHES}
        initialVehicleId={activeVehicle?.id}
        onSave={handleUpdateVehicle}
        lang={lang}
      />

      {/* 3. Transfer Vehicle Modal */}
      <TransferVehicleModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        vehicles={vehicles}
        branches={BRANCHES}
        initialVehicleId={activeVehicle?.id}
        onTransfer={handleTransferVehicle}
        lang={lang}
        canTransfer={canUserTransfer}
      />

      {/* 4. Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        vehicles={vehicles}
        thresholdDays={thresholdDays}
        referenceDate={referenceDate}
        lang={lang}
      />

      {/* 5. Quick Vehicle Drawer */}
      <VehicleDrawer
        lang={lang}
        vehicle={activeVehicle}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        thresholdDays={thresholdDays}
        referenceDate={referenceDate}
        transferRecords={transfers}
        auditRecords={auditLogs}
        onManageData={(v) => {
          setActiveVehicle(v);
          setIsDrawerOpen(false);
          setIsEditOpen(true);
        }}
      />

      {/* 6. User Management Modal (Admin only or management view) */}
      {currentUser && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          users={users}
          onUpdateUsers={setUsers}
          currentUser={currentUser}
          branches={BRANCHES}
          lang={lang}
        />
      )}

      {/* 7. Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        users={users}
        lang={lang}
      />

      {/* 8. Supabase Database Integration Modal */}
      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        vehicles={vehicles}
        onRefreshVehicles={handleRefresh}
      />
    </div>
  );
}
