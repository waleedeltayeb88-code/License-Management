import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { getUserPermissions, sanitizeUserPermissions, ROLE_DEFINITIONS } from './utils/permissionUtils';
import { Car, FileText, Plus, ArrowLeftRight, ShieldCheck, Crown, Eye, Building2, Truck, CheckCircle2, Cloud } from 'lucide-react';

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
  supabase,
  fetchVehiclesFromSupabase, 
  saveVehicleToSupabase, 
  seedVehiclesToSupabase,
  deleteVehicleFromSupabase,
  fetchUsersFromSupabase,
  saveUserToSupabase,
  saveAllUsersToSupabase,
  fetchTransfersFromSupabase,
  saveTransferToSupabase, 
  seedTransfersToSupabase,
  fetchAuditLogsFromSupabase,
  saveAuditToSupabase,
  seedAuditLogsToSupabase,
  fetchSettingsFromSupabase,
  saveSettingsToSupabase,
  fetchBranchesFromSupabase,
  saveBranchesToSupabase,
  seedBranchesToSupabase
} from './lib/supabase';

function mergeAndSanitizeUsers(list: SystemUser[]): SystemUser[] {
  const map = new Map<string, SystemUser>();

  for (const u of list) {
    if (!u || !u.username) continue;
    const key = u.username.toLowerCase();
    const cleanRole: UserRole =
      u.role === 'admin' || u.role === 'fleet_manager' || u.role === 'branch_manager' || u.role === 'viewer'
        ? u.role
        : 'viewer';
    const sanitized: SystemUser = {
      ...u,
      role: cleanRole,
      permissions: sanitizeUserPermissions(cleanRole, u.permissions),
    };
    if (key === 'admin') {
      sanitized.name = sanitized.name || 'وليد عادل';
      sanitized.email = sanitized.email || 'Walid.Adel@Seoudisupermarket.com';
      sanitized.phone = sanitized.phone || '01144542800';
      sanitized.role = 'admin';
      sanitized.permissions = sanitizeUserPermissions('admin', sanitized.permissions);
    }
    map.set(key, sanitized);
  }

  // Always guarantee that the master admin account exists so the owner is never locked out
  if (!map.has('admin')) {
    const adminDef = INITIAL_USERS[0];
    map.set('admin', {
      ...adminDef,
      permissions: sanitizeUserPermissions('admin', adminDef.permissions),
    });
  }

  return Array.from(map.values());
}

export default function App() {
  const [lang] = useState<Language>('ar');

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
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'error'>('connected');
  const [cloudToast, setCloudToast] = useState<string | null>(null);
  const pendingMutationsRef = useRef<number>(0);
  const lastMutationTimeRef = useRef<number>(0);

  const beginMutation = useCallback(() => {
    pendingMutationsRef.current += 1;
    lastMutationTimeRef.current = Date.now();
    setCloudStatus('syncing');
  }, []);

  const endMutation = useCallback((ok: boolean) => {
    pendingMutationsRef.current = Math.max(0, pendingMutationsRef.current - 1);
    lastMutationTimeRef.current = Date.now();
    setCloudStatus(ok ? 'connected' : 'error');
  }, []);

  const showCloudNotification = useCallback((msg: string) => {
    setCloudToast(msg);
    setTimeout(() => {
      setCloudToast(prev => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // User Authentication & Management State
  const [users, setUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('seoudi_fleet_users_v4');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeAndSanitizeUsers(parsed);
        }
      } catch (e) {}
    }
    return mergeAndSanitizeUsers(INITIAL_USERS);
  });

  // Default to null so landing page is the website's initial starting page
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    const saved = localStorage.getItem('seoudi_fleet_current_user_v4');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          return {
            ...parsed,
            permissions: sanitizeUserPermissions(parsed.role, parsed.permissions),
          };
        }
      } catch (e) {}
    }
    return null;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => currentUser?.role || 'viewer');

  // Effective permissions based on currentUser AND active/simulated userRole
  const currentUserPermissions = useMemo(() => {
    return getUserPermissions(currentUser, userRole);
  }, [currentUser, userRole]);

  const canUserAdd = currentUserPermissions.canAddVehicles;
  const canUserEdit = currentUserPermissions.canEditLicenses;
  const canUserTransfer = currentUserPermissions.canTransferVehicles;
  const canUserExport = currentUserPermissions.canExportReports;
  const canUserManageUsers = currentUserPermissions.canManageUsers && userRole === 'admin';
  const canUserManageSettings = currentUserPermissions.canManageSettings;
  const canUserDelete = !!currentUserPermissions.canDeleteRecords;

  const [isLandingView, setIsLandingView] = useState<boolean>(() => !currentUser);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);

  // Bottom Navigation Active Tab
  const [bottomTab, setBottomTab] = useState<BottomNavTab>('dashboard');

  // Redirect away from restricted tabs when role changes
  useEffect(() => {
    if (bottomTab === 'settings' && !canUserManageSettings) {
      setBottomTab('dashboard');
    }
    if (bottomTab === 'reports' && !canUserExport) {
      setBottomTab('dashboard');
    }
  }, [bottomTab, canUserManageSettings, canUserExport]);

  useEffect(() => {
    try {
      localStorage.setItem('seoudi_fleet_users_v4', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('seoudi_fleet_current_user_v4', JSON.stringify(currentUser));
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('seoudi_fleet_current_user_v4');
      } catch (e) {}
    }
  }, [currentUser]);

  const handleLogin = (user: SystemUser) => {
    // Look up latest user state from `users` list and sanitize permissions
    const latestFromList = users.find(
      u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase()
    ) || user;

    const cleanUser: SystemUser = {
      ...latestFromList,
      lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
      permissions: sanitizeUserPermissions(latestFromList.role, latestFromList.permissions),
    };

    setCurrentUser(cleanUser);
    setUserRole(cleanUser.role);
    setIsLandingView(false);
    setIsLoginOpen(false);

    // If user is a branch manager with an assigned branch, pre-filter by their branch
    if (cleanUser.role === 'branch_manager' && cleanUser.assignedBranch) {
      setFilters(prev => ({ ...prev, branch: cleanUser.assignedBranch || 'all' }));
    } else {
      setFilters(prev => ({ ...prev, branch: 'all' }));
    }

    // Update user last_login in Supabase
    saveUserToSupabase(cleanUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('viewer');
    setIsLandingView(true);
  };

  const handleUpdateUsers = async (updatedList: SystemUser[]) => {
    const sanitizedList = mergeAndSanitizeUsers(updatedList);
    setUsers(sanitizedList);

    // If currentUser was updated in the list, sync currentUser & userRole immediately
    if (currentUser) {
      const updatedSelf = sanitizedList.find(u => u.id === currentUser.id);
      if (updatedSelf) {
        setCurrentUser(updatedSelf);
        setUserRole(updatedSelf.role);
      }
    }

    // Save to Supabase Cloud
    beginMutation();
    const ok = await saveAllUsersToSupabase(sanitizedList);
    endMutation(ok);
    if (ok) {
      showCloudNotification('تم حفظ وتحديث قائمة المستخدمين والصلاحيات في سحابة Supabase ✓');
    }
  };

  // Dynamic Branches State (persisted locally + synced with Supabase public.branches)
  const [branches, setBranches] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('seoudi_fleet_branches_v4');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return BRANCHES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('seoudi_fleet_branches_v4', JSON.stringify(branches));
    } catch {}
  }, [branches]);

  // Primary Data State (with local cache fallback for instant multi-device responsiveness)
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const cached = localStorage.getItem('seoudi_fleet_vehicles_v4');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialVehicles;
  });
  const [transfers, setTransfers] = useState<TransferRecord[]>(() => {
    try {
      const cached = localStorage.getItem('seoudi_fleet_transfers_v4');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialTransfers;
  });
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    try {
      const cached = localStorage.getItem('seoudi_fleet_audits_v4');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialAuditLogs;
  });
  const [notifications] = useState<SystemNotification[]>(initialNotifications);

  useEffect(() => {
    try {
      localStorage.setItem('seoudi_fleet_vehicles_v4', JSON.stringify(vehicles));
    } catch {}
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('seoudi_fleet_transfers_v4', JSON.stringify(transfers));
    } catch {}
  }, [transfers]);

  useEffect(() => {
    try {
      localStorage.setItem('seoudi_fleet_audits_v4', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Modals Open State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  // Ensure effectiveBranches always includes all branches + any branch assigned to a vehicle
  const effectiveBranches = useMemo(() => {
    const set = new Set<string>(branches);
    (vehicles || []).forEach(v => {
      if (v.branch && v.branch.trim()) {
        set.add(v.branch.trim());
      }
    });
    return Array.from(set);
  }, [branches, vehicles]);

  // Keep activeVehicle live-synced with latest vehicle state
  const liveActiveVehicle = useMemo(() => {
    if (!activeVehicle) return null;
    return vehicles.find(v => v.id === activeVehicle.id) || activeVehicle;
  }, [vehicles, activeVehicle]);

  // Load all data from Supabase on mount + auto-seed empty tables
  const loadAllFromSupabase = useCallback(async (isManual: boolean = false) => {
    // Do not overwrite local state with background poll if a mutation is in flight or just finished
    if (!isManual && (pendingMutationsRef.current > 0 || Date.now() - lastMutationTimeRef.current < 6000)) {
      return;
    }

    setCloudStatus('syncing');
    try {
      const [cloudVehicles, cloudUsers, cloudTransfers, cloudAudits, cloudSettings, cloudBranches] = await Promise.all([
        fetchVehiclesFromSupabase(),
        fetchUsersFromSupabase(),
        fetchTransfersFromSupabase(),
        fetchAuditLogsFromSupabase(),
        fetchSettingsFromSupabase(),
        fetchBranchesFromSupabase()
      ]);

      // Re-check mutation guard after network await
      if (!isManual && (pendingMutationsRef.current > 0 || Date.now() - lastMutationTimeRef.current < 6000)) {
        setCloudStatus('connected');
        return;
      }

      if (cloudVehicles !== null) {
        if (cloudVehicles.length > 0) {
          setVehicles(cloudVehicles);
        } else {
          // Table exists in Supabase but is empty — auto-seed initial Fleet Vehicles & Branches
          await Promise.all([
            seedVehiclesToSupabase(initialVehicles),
            seedBranchesToSupabase(BRANCHES)
          ]);
        }
      }

      if (cloudBranches !== null) {
        if (cloudBranches.length > 0) {
          setBranches(cloudBranches);
        } else {
          await seedBranchesToSupabase(BRANCHES);
        }
      }

      if (cloudUsers !== null) {
        if (cloudUsers.length > 0) {
          const merged = mergeAndSanitizeUsers(cloudUsers);
          setUsers(merged);
          setCurrentUser(prev => {
            if (!prev) return null;
            const found = merged.find(u => u.id === prev.id || u.username.toLowerCase() === prev.username.toLowerCase());
            if (found) {
              return found;
            }
            return prev;
          });
        } else {
          // Seed initial users to Supabase if table is empty
          await saveAllUsersToSupabase(mergeAndSanitizeUsers(INITIAL_USERS));
        }
      }

      if (cloudTransfers !== null) {
        if (cloudTransfers.length > 0) {
          setTransfers(cloudTransfers);
        } else {
          await seedTransfersToSupabase(initialTransfers);
        }
      }

      if (cloudAudits !== null) {
        if (cloudAudits.length > 0) {
          setAuditLogs(cloudAudits);
        } else {
          await seedAuditLogsToSupabase(initialAuditLogs);
        }
      }

      if (cloudSettings?.settings) {
        setSettings(cloudSettings.settings);
        if (cloudSettings.settings.expiringDaysThreshold) {
          setThresholdDays(cloudSettings.settings.expiringDaysThreshold);
        }
        if (cloudSettings.referenceDate) {
          setReferenceDate(cloudSettings.referenceDate);
        }
      }

      setLastUpdate(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
      setCloudStatus('connected');
    } catch (err) {
      console.error('Supabase load error:', err);
      setCloudStatus('error');
    }
  }, []);

  useEffect(() => {
    loadAllFromSupabase(true);

    // Periodic background HTTP sync (only when no modal is open and no mutation is running)
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadAllFromSupabase(false);
      }
    }, 45000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadAllFromSupabase]);

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

      if (filters.branch !== 'all' && v.branch !== filters.branch) {
        return false;
      }

      if (filters.model && filters.model !== 'all' && v.model !== filters.model) {
        return false;
      }

      const tStat = getLicenseStatus(v.trafficLicense.expiryDate, thresholdDays, referenceDate);
      const cStat = getLicenseStatus(v.commercialLicense.expiryDate, thresholdDays, referenceDate);

      if (filters.status !== 'all') {
        if (filters.licenseType === 'traffic') {
          if (tStat !== filters.status) return false;
        } else if (filters.licenseType === 'commercial') {
          if (cStat !== filters.status) return false;
        } else {
          if (filters.status === 'valid') {
            if (tStat !== 'valid' || cStat !== 'valid') return false;
          } else {
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
    await loadAllFromSupabase(true);
    setIsRefreshing(false);
    showCloudNotification('تم تحديث كافة البيانات من قاعدة بيانات Supabase ✓');
  };

  // Branch Management Handlers (Add / Rename / Delete with full Supabase sync)
  const handleAddBranch = async (branchName: string) => {
    const clean = branchName.trim();
    if (!clean) return;
    if (branches.includes(clean)) {
      showCloudNotification(`الفرع "${clean}" مسجل بالفعل في النظام`);
      return;
    }
    const nextBranches = [...branches, clean];
    setBranches(nextBranches);

    beginMutation();
    const ok = await saveBranchesToSupabase(nextBranches);
    endMutation(ok);
    if (ok) {
      showCloudNotification(`تم إضافة الفرع الجديد (${clean}) وحفظه في Supabase ✓`);
    }
  };

  const handleRenameBranch = async (oldName: string, newName: string) => {
    const cleanNew = newName.trim();
    if (!cleanNew || cleanNew === oldName) return;

    const nextBranches = branches.map(b => (b === oldName ? cleanNew : b));
    setBranches(nextBranches);

    // Update all vehicles in this branch
    const affectedVehicles: Vehicle[] = [];
    setVehicles(prev =>
      prev.map(v => {
        if (v.branch === oldName) {
          const updated = { ...v, branch: cleanNew, updatedAt: new Date().toISOString().slice(0, 10) };
          affectedVehicles.push(updated);
          return updated;
        }
        return v;
      })
    );

    if (filters.branch === oldName) {
      setFilters(prev => ({ ...prev, branch: cleanNew }));
    }

    beginMutation();
    const promises: Promise<any>[] = [saveBranchesToSupabase(nextBranches)];
    if (affectedVehicles.length > 0) {
      promises.push(seedVehiclesToSupabase(affectedVehicles));
    }
    await Promise.all(promises);
    endMutation(true);
    showCloudNotification(`تم تعديل اسم الفرع إلى "${cleanNew}" وتحديث المركبات في Supabase ✓`);
  };

  const handleDeleteBranch = async (branchName: string) => {
    if (branches.length <= 1) return;
    const nextBranches = branches.filter(b => b !== branchName);
    const fallbackBranch = nextBranches[0] || 'هايد بارك (Hyde Park)';
    setBranches(nextBranches);

    const affectedVehicles: Vehicle[] = [];
    setVehicles(prev =>
      prev.map(v => {
        if (v.branch === branchName) {
          const updated = { ...v, branch: fallbackBranch, updatedAt: new Date().toISOString().slice(0, 10) };
          affectedVehicles.push(updated);
          return updated;
        }
        return v;
      })
    );

    if (filters.branch === branchName) {
      setFilters(prev => ({ ...prev, branch: 'all' }));
    }

    beginMutation();
    const promises: Promise<any>[] = [saveBranchesToSupabase(nextBranches)];
    if (affectedVehicles.length > 0) {
      promises.push(seedVehiclesToSupabase(affectedVehicles));
    }
    await Promise.all(promises);
    endMutation(true);
    showCloudNotification(`تم حذف الفرع "${branchName}" وتحديث قاعدة بيانات Supabase ✓`);
  };

  const handleAddVehicle = async (newV: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!canUserAdd) {
      showCloudNotification('عفواً، حسابك الحالي لا يملك صلاحية إضافة مركبات جديدة.');
      return;
    }
    const created: Vehicle = {
      ...newV,
      id: `v-${newV.vehicleNumber}-${Date.now().toString().slice(-4)}`,
      createdAt: referenceDate,
      updatedAt: referenceDate,
    };
    setVehicles(prev => [created, ...prev]);
    setActiveVehicle(created);

    // Ensure branch is in branches list
    let nextBranches = branches;
    if (created.branch && !branches.includes(created.branch)) {
      nextBranches = [...branches, created.branch];
      setBranches(nextBranches);
    }

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      user: currentUser?.name || 'مسؤول النظام',
      userRole: userRole,
      action: 'إضافة سيارة جديدة للأسطول',
      vehicleNumber: `${created.plateLetters || ''} ${created.vehicleNumber}`.trim(),
      oldValue: 'غير مسجلة',
      newValue: `فرع: ${created.branch} | انتهاء المرور: ${created.trafficLicense.expiryDate}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [audit, ...prev]);

    beginMutation();
    const promises: Promise<boolean>[] = [
      saveVehicleToSupabase(created),
      saveAuditToSupabase(audit)
    ];
    if (nextBranches !== branches) {
      promises.push(saveBranchesToSupabase(nextBranches));
    }
    const [ok] = await Promise.all(promises);
    endMutation(ok);
    if (ok) {
      showCloudNotification(`تم حفظ السيارة رقم (${created.vehicleNumber}) ورخصها في Supabase بنجاح ✓`);
    }
  };

  const handleUpdateVehicle = async (updatedV: Vehicle) => {
    if (!canUserEdit) {
      showCloudNotification('عفواً، حساب المشاهد (Viewer) مخصص للقراءة والاطلاع فقط ولا يملك صلاحية التعديل.');
      return;
    }
    const oldVehicle = vehicles.find(v => v.id === updatedV.id);
    setVehicles(prev => prev.map((v) => (v.id === updatedV.id ? updatedV : v)));
    setActiveVehicle(prev => (prev && prev.id === updatedV.id ? updatedV : prev));

    let nextBranches = branches;
    if (updatedV.branch && !branches.includes(updatedV.branch)) {
      nextBranches = [...branches, updatedV.branch];
      setBranches(nextBranches);
    }

    const nowDate = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      user: currentUser?.name || 'مسؤول النظام',
      userRole: userRole,
      action: oldVehicle && oldVehicle.branch !== updatedV.branch ? 'تحديث رخص ونقل فرع المركبة' : 'تحديث بيانات ورخص مركبة',
      vehicleNumber: `${updatedV.plateLetters || ''} ${updatedV.vehicleNumber}`.trim(),
      oldValue: oldVehicle ? `فرع: ${oldVehicle.branch} | مرور: ${oldVehicle.trafficLicense.expiryDate} | إعلان: ${oldVehicle.commercialLicense.expiryDate}` : '—',
      newValue: `فرع: ${updatedV.branch} | مرور: ${updatedV.trafficLicense.expiryDate} | إعلان: ${updatedV.commercialLicense.expiryDate}`,
      date: nowDate,
      time: nowTime
    };
    setAuditLogs(prev => [audit, ...prev]);

    // If branch was also changed inside Edit modal, log a TransferRecord automatically
    let branchTransferRecord: TransferRecord | null = null;
    if (oldVehicle && oldVehicle.branch !== updatedV.branch) {
      branchTransferRecord = {
        id: `tr-${Date.now()}`,
        vehicleId: updatedV.id,
        vehicleNumber: updatedV.vehicleNumber,
        fromBranch: oldVehicle.branch,
        toBranch: updatedV.branch,
        date: nowDate,
        time: nowTime,
        transferredBy: currentUser?.name || 'مسؤول النظام',
        reason: 'تعديل الفرع المخصص من نافذة إدارة بيانات المركبة',
        notes: updatedV.notes || ''
      };
      setTransfers(prev => [branchTransferRecord!, ...prev]);
    }

    beginMutation();
    const promises: Promise<boolean>[] = [
      saveVehicleToSupabase(updatedV),
      saveAuditToSupabase(audit)
    ];
    if (branchTransferRecord) {
      promises.push(saveTransferToSupabase(branchTransferRecord));
    }
    if (nextBranches !== branches) {
      promises.push(saveBranchesToSupabase(nextBranches));
    }
    const [ok] = await Promise.all(promises);
    endMutation(ok);
    if (ok) {
      showCloudNotification(`تم حفظ تعديلات رخص وبيانات السيارة (${updatedV.vehicleNumber}) في Supabase ✓`);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!canUserDelete) {
      showCloudNotification('عفواً، صلاحية حذف المركبات مقتصرة على مدير النظام فقط.');
      return;
    }
    const target = vehicles.find(v => v.id === vehicleId);
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    setActiveVehicle(prev => (prev && prev.id === vehicleId ? null : prev));

    beginMutation();
    const ok = await deleteVehicleFromSupabase(vehicleId);
    if (target) {
      const audit: AuditRecord = {
        id: `aud-${Date.now()}`,
        user: currentUser?.name || 'مدير النظام',
        userRole: userRole,
        action: 'حذف مركبة من الأسطول',
        vehicleNumber: `${target.plateLetters || ''} ${target.vehicleNumber}`.trim(),
        oldValue: target.branch,
        newValue: 'تم الحذف نهائياً',
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setAuditLogs(prev => [audit, ...prev]);
      await saveAuditToSupabase(audit);
    }
    endMutation(ok);
    if (ok) {
      showCloudNotification('تم حذف المركبة نهائياً من قاعدة بيانات Supabase ✓');
    }
  };

  const handleTransferVehicle = async (
    vehicleId: string,
    fromBranch: string,
    toBranch: string,
    reason: string,
    notes: string,
    date: string
  ) => {
    if (!canUserTransfer) {
      showCloudNotification('عفواً، صلاحية نقل المركبات بين الفروع مقتصرة على مدير الأسطول والمدير العام فقط.');
      return;
    }
    const target = vehicles.find((v) => v.id === vehicleId);
    let updatedVehicle: Vehicle | null = null;
    if (target) {
      updatedVehicle = { ...target, branch: toBranch, updatedAt: new Date().toISOString().slice(0, 10) };
      setVehicles(prev => prev.map((v) => (v.id === vehicleId && updatedVehicle ? updatedVehicle : v)));
      setActiveVehicle(prev => (prev && prev.id === vehicleId && updatedVehicle ? updatedVehicle : prev));
    }

    let nextBranches = branches;
    if (toBranch && !branches.includes(toBranch)) {
      nextBranches = [...branches, toBranch];
      setBranches(nextBranches);
    }

    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const record: TransferRecord = {
      id: `tr-${Date.now()}`,
      vehicleId,
      vehicleNumber: target?.vehicleNumber || '',
      fromBranch,
      toBranch,
      date,
      time: nowTime,
      transferredBy: currentUser?.name || 'مدير عمليات سعودي',
      reason,
      notes,
    };
    setTransfers(prev => [record, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      user: currentUser?.name || 'مدير عمليات سعودي',
      userRole: userRole,
      action: 'نقل سيارة بين الفروع',
      vehicleNumber: target?.vehicleNumber || '',
      oldValue: fromBranch,
      newValue: toBranch,
      date,
      time: nowTime
    };
    setAuditLogs(prev => [audit, ...prev]);

    beginMutation();
    const promises: Promise<boolean>[] = [
      saveTransferToSupabase(record),
      saveAuditToSupabase(audit)
    ];
    if (updatedVehicle) {
      promises.push(saveVehicleToSupabase(updatedVehicle));
    }
    if (nextBranches !== branches) {
      promises.push(saveBranchesToSupabase(nextBranches));
    }
    const results = await Promise.all(promises);
    const ok = results.every(Boolean);
    endMutation(ok);
    if (ok) {
      showCloudNotification(`تم تسجيل نقل السيارة (${target?.vehicleNumber || ''}) إلى ${toBranch} في Supabase ✓`);
    }
  };

  if (!currentUser || isLandingView) {
    return (
      <div className="min-h-screen bg-[#060b14] text-slate-100 font-sans">
        <LandingPage
          onLogin={handleLogin}
          users={users}
          totalFleet={vehicles.length}
          branchesCount={effectiveBranches.length}
          lang={lang}
          existingUser={currentUser}
        />
      </div>
    );
  }

  const activeRoleMeta = ROLE_DEFINITIONS[userRole] || ROLE_DEFINITIONS.viewer;
  const isSimulatingRole = currentUser.role === 'admin' && userRole !== 'admin';

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 antialiased font-sans flex flex-col justify-between p-2.5 sm:p-4 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Live Cloud Toast Notification */}
      {cloudToast && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-400/50 text-emerald-200 text-xs font-bold shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{cloudToast}</span>
        </div>
      )}

      <div className="w-full max-w-[1780px] mx-auto flex-1 flex flex-col">
        {/* 1. TOP HEADER */}
        <Header
          lang={lang}
          currentRole={userRole}
          userRole={userRole}
          onChangeRole={(newRole) => {
            setUserRole(newRole);
            showCloudNotification(`تم تفعيل صلاحيات دور: ${ROLE_DEFINITIONS[newRole]?.titleAr || newRole}`);
          }}
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
          onOpenSupabase={
            userRole === 'admin' &&
            currentUser?.role === 'admin' &&
            (currentUser?.username?.toLowerCase() === 'admin' || currentUser?.id === 'usr-1')
              ? () => setIsSupabaseOpen(true)
              : undefined
          }
          users={users}
          onSwitchUser={(u) => {
            handleLogin(u);
            showCloudNotification(`تم التبديل إلى حساب: ${u.name} (${ROLE_DEFINITIONS[u.role]?.badgeAr})`);
          }}
          cloudStatus={cloudStatus}
        />

        {/* ROLE & PERMISSIONS ACTIVE STATUS BAR (Shows current role & permissions clearly) */}
        {(userRole !== 'admin' || isSimulatingRole) && (
          <div className="mb-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1426] to-slate-900 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5 text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-black border ${activeRoleMeta.badgeClass}`}>
                {activeRoleMeta.badgeAr}
              </span>
              <span className="font-bold text-white">
                {userRole === 'viewer'
                  ? 'وضع المشاهد والمدقق (View Only): متاح استعراض الرخص والتقارير فقط — تم قفل وحجب كافة أزرار الإضافة والتعديل والنقل والإعدادات.'
                  : userRole === 'branch_manager'
                  ? `وضع مدير الفرع (${currentUser.assignedBranch || 'الفرع المخصص'}): متاح متابعة وتجديد الرخص فقط — تم حجب نقل المركبات وإضافة السيارات والإعدادات.`
                  : 'وضع مدير الحركة والأسطول: متاح إدارة الأسطول والرخص ونقل المركبات — تم حجب إدارة المستخدمين وإعدادات النظام.'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isSimulatingRole && (
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('admin');
                    showCloudNotification('تمت استعادة صلاحيات المدير العام (Admin) الكاملة 👑');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>العودة لوضع المدير العام (Admin)</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs border border-white/10 transition-all cursor-pointer"
              >
                تغيير الحساب
              </button>
            </div>
          </div>
        )}

        {/* 2. EXECUTIVE PRIMARY NAVIGATION */}
        <BottomNav
          lang={lang}
          activeTab={bottomTab}
          isAdmin={canUserManageUsers}
          canManageSettings={canUserManageSettings}
          canExportReports={canUserExport}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onSelectTab={(tab) => {
            setBottomTab(tab);
            if (tab === 'vehicles_list') {
              setFilters({
                search: '',
                branch: currentUser.role === 'branch_manager' && currentUser.assignedBranch ? currentUser.assignedBranch : 'all',
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
              branches={effectiveBranches}
              totalResults={filteredVehicles.length}
              totalFleet={vehicles.length}
              canAddVehicle={canUserAdd}
              canEditLicense={canUserEdit}
              canTransferVehicle={canUserTransfer}
              canExportData={canUserExport}
              onAddLicense={canUserAdd ? () => setIsAddOpen(true) : undefined}
              onEditData={canUserEdit ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsEditOpen(true);
              } : undefined}
              onTransferVehicle={canUserTransfer ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsTransferOpen(true);
              } : undefined}
              onExportData={canUserExport ? () => setIsExportOpen(true) : undefined}
            />

            <ChartsSection
              lang={lang}
              vehicles={filteredVehicles}
              thresholdDays={thresholdDays}
              referenceDate={referenceDate}
              onFilterBranch={(branch) => setFilters(prev => ({ ...prev, branch }))}
              onFilterStatus={(status) => setFilters(prev => ({ ...prev, status }))}
            />

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
                onManageVehicle={canUserEdit ? (v) => {
                  setActiveVehicle(v);
                  setIsEditOpen(true);
                } : undefined}
                onTransferVehicle={canUserTransfer ? (v) => {
                  setActiveVehicle(v);
                  setIsTransferOpen(true);
                } : undefined}
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
                      ? `استعراض أسطول النقل والتوصيل بالكامل (${vehicles.length} مركبة) عبر جميع الفروع.`
                      : `Complete overview of all ${vehicles.length} delivery fleet vehicles.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canUserAdd && (
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إضافة سيارة جديدة' : 'Add Vehicle'}</span>
                  </button>
                )}
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
              branches={effectiveBranches}
              totalResults={filteredVehicles.length}
              totalFleet={vehicles.length}
              canAddVehicle={canUserAdd}
              canEditLicense={canUserEdit}
              canTransferVehicle={canUserTransfer}
              canExportData={canUserExport}
              onAddLicense={canUserAdd ? () => setIsAddOpen(true) : undefined}
              onEditData={canUserEdit ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsEditOpen(true);
              } : undefined}
              onTransferVehicle={canUserTransfer ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsTransferOpen(true);
              } : undefined}
              onExportData={canUserExport ? () => setIsExportOpen(true) : undefined}
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
              onManageVehicle={canUserEdit ? (v) => {
                setActiveVehicle(v);
                setIsEditOpen(true);
              } : undefined}
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
              branches={effectiveBranches}
              totalResults={filteredVehicles.length}
              totalFleet={vehicles.length}
              canAddVehicle={canUserAdd}
              canEditLicense={canUserEdit}
              canTransferVehicle={canUserTransfer}
              canExportData={canUserExport}
              onAddLicense={canUserAdd ? () => setIsAddOpen(true) : undefined}
              onEditData={canUserEdit ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsEditOpen(true);
              } : undefined}
              onTransferVehicle={canUserTransfer ? () => {
                setActiveVehicle(vehicles[0] || null);
                setIsTransferOpen(true);
              } : undefined}
              onExportData={canUserExport ? () => setIsExportOpen(true) : undefined}
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
              onManageVehicle={canUserEdit ? (v) => {
                setActiveVehicle(v);
                setIsEditOpen(true);
              } : undefined}
              onTransferVehicle={canUserTransfer ? (v) => {
                setActiveVehicle(v);
                setIsTransferOpen(true);
              } : undefined}
            />
          </div>
        )}

        {/* VIEW D: REPORTS & AUDIT (التقارير والطباعة) */}
        {bottomTab === 'reports' && canUserExport && (
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
        {bottomTab === 'settings' && canUserManageSettings && (
          <div className="mb-6">
            <SettingsView
              lang={lang}
              thresholdDays={thresholdDays}
              onUpdateThreshold={async (days) => {
                setThresholdDays(days);
                const updated = { ...settings, expiringDaysThreshold: days };
                setSettings(updated);
                beginMutation();
                const ok = await saveSettingsToSupabase(updated, referenceDate);
                endMutation(ok);
                showCloudNotification(`تم تحديث مهلة التنبيه إلى (${days} يوم) في Supabase ✓`);
              }}
              referenceDate={referenceDate}
              onUpdateReferenceDate={async (d) => {
                setReferenceDate(d);
                beginMutation();
                const ok = await saveSettingsToSupabase(settings, d);
                endMutation(ok);
                showCloudNotification(`تم تحديث التاريخ المرجعي إلى (${d}) في Supabase ✓`);
              }}
              userRole={userRole}
              onUpdateRole={setUserRole}
              branches={effectiveBranches}
              onAddBranch={handleAddBranch}
              onRenameBranch={handleRenameBranch}
              onDeleteBranch={handleDeleteBranch}
              totalVehicles={vehicles.length}
              settings={settings}
              onUpdateSettings={async (newSettings) => {
                setSettings(newSettings);
                if (newSettings.expiringDaysThreshold) {
                  setThresholdDays(newSettings.expiringDaysThreshold);
                }
                beginMutation();
                const ok = await saveSettingsToSupabase(newSettings, referenceDate);
                endMutation(ok);
                showCloudNotification('تم حفظ إعدادات النظام في سحابة Supabase ✓');
              }}
              vehicles={vehicles}
              onRestoreVehicles={async (restoredList) => {
                setVehicles(restoredList);
                beginMutation();
                const res = await seedVehiclesToSupabase(restoredList);
                endMutation(res.success);
                if (res.success) {
                  showCloudNotification(`تم استعادة وحفظ (${restoredList.length}) مركبة في Supabase ✓`);
                }
              }}
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
      {canUserAdd && (
        <AddVehicleModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          branches={effectiveBranches}
          onAdd={handleAddVehicle}
          onAddBranch={handleAddBranch}
          lang={lang}
        />
      )}

      {/* 2. Edit Vehicle & Licenses Modal */}
      {canUserEdit && (
        <EditVehicleModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          vehicles={vehicles}
          branches={effectiveBranches}
          initialVehicleId={liveActiveVehicle?.id}
          onSave={handleUpdateVehicle}
          onDelete={canUserDelete ? handleDeleteVehicle : undefined}
          onAddBranch={handleAddBranch}
          canDelete={canUserDelete}
          lang={lang}
        />
      )}

      {/* 3. Transfer Vehicle Modal */}
      {canUserTransfer && (
        <TransferVehicleModal
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          vehicles={vehicles}
          branches={effectiveBranches}
          initialVehicleId={liveActiveVehicle?.id}
          onTransfer={handleTransferVehicle}
          onAddBranch={handleAddBranch}
          lang={lang}
          canTransfer={canUserTransfer}
        />
      )}

      {/* 4. Export Modal */}
      {canUserExport && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          vehicles={vehicles}
          thresholdDays={thresholdDays}
          referenceDate={referenceDate}
          lang={lang}
        />
      )}

      {/* 5. Quick Vehicle Drawer */}
      <VehicleDrawer
        lang={lang}
        vehicle={liveActiveVehicle}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        thresholdDays={thresholdDays}
        referenceDate={referenceDate}
        transferRecords={transfers}
        auditRecords={auditLogs}
        onManageData={canUserEdit ? (v) => {
          setActiveVehicle(v);
          setIsDrawerOpen(false);
          setIsEditOpen(true);
        } : undefined}
        onTransferVehicle={canUserTransfer ? (v) => {
          setActiveVehicle(v);
          setIsDrawerOpen(false);
          setIsTransferOpen(true);
        } : undefined}
      />

      {/* 6. User Management Modal */}
      {currentUser && canUserManageUsers && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          users={users}
          onUpdateUsers={handleUpdateUsers}
          currentUser={currentUser}
          branches={effectiveBranches}
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

      {/* 8. Supabase Database Integration Modal - Exclusive to Master Admin (Walid Adel) */}
      {userRole === 'admin' &&
        currentUser?.role === 'admin' &&
        (currentUser?.username?.toLowerCase() === 'admin' || currentUser?.id === 'usr-1') && (
          <SupabaseModal
            isOpen={isSupabaseOpen}
            onClose={() => setIsSupabaseOpen(false)}
            vehicles={vehicles}
            users={users}
            transfers={transfers}
            auditLogs={auditLogs}
            branches={effectiveBranches}
            settings={settings}
            referenceDate={referenceDate}
            onRefreshVehicles={handleRefresh}
          />
        )}
    </div>
  );
}
