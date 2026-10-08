import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Crown,
  Truck,
  Building2,
  Eye,
  Edit,
  Trash2,
  KeyRound,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
  Unlock,
  Check,
  XCircle,
  EyeOff,
  Copy,
  RefreshCw,
  UserCheck,
  UserX,
  Filter,
  ChevronDown,
  Power,
  MoreHorizontal,
  SlidersHorizontal,
  FileDown,
  History,
  CheckSquare,
  Square,
  ArrowUpRight,
  LogIn,
} from 'lucide-react';
import {
  SystemUser,
  UserRole,
  UserPermissions,
  AuditRecord,
} from '../../types';
import {
  ROLE_DEFINITIONS,
  ROLE_DEFAULT_PERMISSIONS,
  PERMISSION_DEFINITIONS,
} from '../../utils/permissionUtils';
import { INITIAL_USERS } from '../../data/mockData';
import { Language } from '../../utils/i18n';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: SystemUser[];
  onUpdateUsers: (updatedList: SystemUser[]) => void;
  onDeleteUser?: (userId: string, username?: string, email?: string) => void;
  currentUser: SystemUser;
  branches: string[];
  lang: Language;
  onSwitchUser?: (user: SystemUser) => void;
  isPageMode?: boolean;
  auditLogs?: AuditRecord[];
}

const CATEGORY_LABELS: Record<'fleet' | 'admin' | 'reporting', string> = {
  fleet: 'إدارة الأسطول والتشغيل',
  reporting: 'التقارير والرقابة',
  admin: 'الإدارة العليا والنظام',
};

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUsers,
  onDeleteUser,
  currentUser,
  branches,
  onSwitchUser,
  isPageMode = false,
  auditLogs = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    'users_list' | 'permissions_matrix' | 'activity_log' | 'form'
  >('users_list');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Interactive Custom Dropdown states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isBranchFilterDropdownOpen, setIsBranchFilterDropdownOpen] = useState(false);
  const [isBranchFormDropdownOpen, setIsBranchFormDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);

  // Expanded Row for Inline Permissions Drawer
  const [expandedPermissionsUserId, setExpandedPermissionsUserId] = useState<string | null>(null);

  // Selected users for Bulk Actions
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Matrix Selected User for interactive User Override mode
  const [matrixTargetUserId, setMatrixTargetUserId] = useState<string>('all_roles');

  // Form states for Create / Edit
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<UserRole>('branch_manager');
  const [assignedBranch, setAssignedBranch] = useState<string>(branches[0] || 'فرع المهندسين');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [customPermissions, setCustomPermissions] = useState<UserPermissions>({
    ...ROLE_DEFAULT_PERMISSIONS.branch_manager,
  });

  // Feedback / Confirmation states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const branchFilterDropdownRef = useRef<HTMLDivElement>(null);
  const branchFormDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (
        branchFilterDropdownRef.current &&
        !branchFilterDropdownRef.current.contains(e.target as Node)
      ) {
        setIsBranchFilterDropdownOpen(false);
      }
      if (
        branchFormDropdownRef.current &&
        !branchFormDropdownRef.current.contains(e.target as Node)
      ) {
        setIsBranchFormDropdownOpen(false);
      }
      const targetEl = e.target as HTMLElement;
      if (!targetEl.closest('[data-row-menu]')) {
        setOpenRowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen && !isPageMode) return null;

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  // Helper to save a single user (update or create) via onUpdateUsers
  const saveSingleUser = (userToSave: SystemUser, isNew: boolean) => {
    if (isNew) {
      onUpdateUsers([...users, userToSave]);
    } else {
      onUpdateUsers(users.map((u) => (u.id === userToSave.id ? userToSave : u)));
    }
  };

  // Helper to delete a single user
  const removeSingleUser = (userToDelete: SystemUser) => {
    if (onDeleteUser) {
      onDeleteUser(userToDelete.id, userToDelete.username, userToDelete.email);
    } else {
      onUpdateUsers(users.filter((u) => u.id !== userToDelete.id));
    }
  };

  // Get effective permissions for any user
  const getEffectivePermissions = (user: SystemUser): UserPermissions => {
    return (
      user.permissions ||
      ROLE_DEFAULT_PERMISSIONS[user.role] ||
      ROLE_DEFAULT_PERMISSIONS.viewer
    );
  };

  // Count enabled permissions for a user
  const countEnabledPermissions = (user: SystemUser): number => {
    const perms = getEffectivePermissions(user);
    return PERMISSION_DEFINITIONS.filter((def) => !!perms[def.key]).length;
  };

  // Check if user is primary root admin
  const isRootAdmin = (user: SystemUser): boolean => {
    return (
      user.id === 'usr-1' ||
      user.username.toLowerCase() === 'admin' ||
      (user.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1)
    );
  };

  // Handle role selection change inside form (auto-populates default role permissions)
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setCustomPermissions({ ...ROLE_DEFAULT_PERMISSIONS[newRole] });
    if (newRole === 'branch_manager' && !jobTitle) {
      setJobTitle('مدير فرع');
    } else if (newRole === 'fleet_manager' && !jobTitle) {
      setJobTitle('مدير حركة وتشغيل الأسطول');
    } else if (newRole === 'admin' && !jobTitle) {
      setJobTitle('مدير النظام العام');
    } else if (newRole === 'viewer' && !jobTitle) {
      setJobTitle('مراقب ومدقق بيانات');
    }
  };

  // Open Form for New User
  const handleStartAdd = () => {
    setEditingUserId(null);
    setName('');
    setUsername('');
    setPassword('Seoudi@2025');
    setShowPassword(true);
    setEmail('');
    setPhone('');
    setJobTitle('مدير فرع');
    setRole('branch_manager');
    setAssignedBranch(branches[0] || 'فرع المهندسين');
    setStatus('active');
    setCustomPermissions({ ...ROLE_DEFAULT_PERMISSIONS.branch_manager });
    setActiveTab('form');
  };

  // Open Form for Existing User
  const handleStartEdit = (user: SystemUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username || user.email.split('@')[0] || 'user');
    setPassword(user.password || '123456');
    setShowPassword(false);
    setEmail(user.email);
    setPhone(user.phone || '');
    setJobTitle(user.title || ROLE_DEFINITIONS[user.role]?.titleAr || '');
    setRole(user.role);
    setAssignedBranch(user.assignedBranch || branches[0] || 'فرع المهندسين');
    setStatus(user.status);
    setCustomPermissions(
      user.permissions
        ? { ...user.permissions }
        : { ...ROLE_DEFAULT_PERMISSIONS[user.role] }
    );
    setActiveTab('form');
  };

  // Quick Toggle User Active / Suspended Status directly from table row
  const handleToggleUserStatus = (user: SystemUser) => {
    if (isRootAdmin(user) && user.status === 'active') {
      showFeedback('error', 'لا يمكن إيقاف أو تعليق حساب مدير النظام الرئيسي');
      return;
    }
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const updatedUser: SystemUser = {
      ...user,
      status: nextStatus,
    };
    saveSingleUser(updatedUser, false);
    showFeedback(
      'success',
      nextStatus === 'active'
        ? `تم تفعيل حساب "${user.name}" بنجاح وأصبح بإمكانه الدخول للنظام ✓`
        : `تم إيقاف وتعطيل حساب "${user.name}" مؤقتاً ✓`
    );
  };

  // Quick Change User Role directly from table row
  const handleQuickRoleChange = (user: SystemUser, nextRole: UserRole) => {
    if (isRootAdmin(user) && nextRole !== 'admin') {
      showFeedback('error', 'لا يمكن خفض صلاحيات حساب مدير النظام الرئيسي (Admin)');
      return;
    }
    const nextPermissions = { ...ROLE_DEFAULT_PERMISSIONS[nextRole] };
    const updatedUser: SystemUser = {
      ...user,
      role: nextRole,
      assignedBranch:
        nextRole === 'branch_manager'
          ? user.assignedBranch || branches[0] || 'فرع المهندسين'
          : undefined,
      permissions: nextPermissions,
    };
    saveSingleUser(updatedUser, false);
    showFeedback(
      'success',
      `تم تغيير دور "${user.name}" إلى (${ROLE_DEFINITIONS[nextRole].titleAr}) وتحديث صلاحياته فوراً ✓`
    );
  };

  // Quick Change User Assigned Branch directly from table row
  const handleQuickBranchChange = (user: SystemUser, nextBranch: string) => {
    const updatedUser: SystemUser = {
      ...user,
      assignedBranch: nextBranch === 'all' ? undefined : nextBranch,
    };
    saveSingleUser(updatedUser, false);
    showFeedback('success', `تم تحديث الفرع المخصص للمستخدم "${user.name}" إلى (${nextBranch}) ✓`);
  };

  // Quick Toggle Single Permission for a User (from Inline Drawer or Matrix)
  const handleToggleSingleUserPermission = (
    user: SystemUser,
    permKey: keyof UserPermissions
  ) => {
    if (isRootAdmin(user) && permKey === 'canManageUsers') {
      showFeedback('error', 'لا يمكن إلغاء صلاحية إدارة المستخدمين عن مدير النظام الرئيسي');
      return;
    }
    const currentPerms = getEffectivePermissions(user);
    const updatedPerms: UserPermissions = {
      ...currentPerms,
      [permKey]: !currentPerms[permKey],
    };
    const updatedUser: SystemUser = {
      ...user,
      permissions: updatedPerms,
    };
    saveSingleUser(updatedUser, false);
    const permLabel =
      PERMISSION_DEFINITIONS.find((p) => p.key === permKey)?.labelAr || permKey;
    showFeedback(
      'success',
      `${updatedPerms[permKey] ? 'تم منح' : 'تم سحب'} صلاحية "${permLabel}" للمستخدم (${user.name}) ✓`
    );
  };

  // Apply Permission Preset to a Single User
  const handleApplyPermissionPreset = (
    user: SystemUser,
    preset: 'full' | 'role_default' | 'readonly'
  ) => {
    if (isRootAdmin(user) && preset === 'readonly') {
      showFeedback('error', 'لا يمكن تحويل حساب مدير النظام الرئيسي إلى وضع القراءة فقط');
      return;
    }
    let nextPerms: UserPermissions;
    if (preset === 'full') {
      nextPerms = { ...ROLE_DEFAULT_PERMISSIONS.admin };
    } else if (preset === 'readonly') {
      nextPerms = { ...ROLE_DEFAULT_PERMISSIONS.viewer };
    } else {
      nextPerms = { ...ROLE_DEFAULT_PERMISSIONS[user.role] };
    }

    const updatedUser: SystemUser = {
      ...user,
      permissions: nextPerms,
    };
    saveSingleUser(updatedUser, false);
    showFeedback('success', `تم تحديث حزمة صلاحيات "${user.name}" وحفظها في قاعدة البيانات ✓`);
  };

  // Generate random strong password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$!';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = (user: SystemUser) => {
    const text = `بيانات دخول منصة سعودي سوبر ماركت لإدارة الأسطول:\nالمستخدم: ${user.name}\nاسم الدخول: ${user.username}\nكلمة المرور: ${user.password || '123456'}\nالدور الوظيفي: ${ROLE_DEFINITIONS[user.role].titleAr}`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    showFeedback('success', `تم نسخ بيانات دخول "${user.name}" إلى الحافظة بنجاح`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Reset password quickly to a new generated password
  const handleQuickResetPassword = (user: SystemUser) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPass = `Seoudi@${randomNum}`;
    const updatedUser: SystemUser = {
      ...user,
      password: newPass,
    };
    saveSingleUser(updatedUser, false);
    setVisiblePasswords((prev) => ({ ...prev, [user.id]: true }));
    showFeedback('success', `تم توليد كلمة مرور جديدة (${newPass}) للمستخدم "${user.name}" ✓`);
  };

  // Save User Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showFeedback('error', 'يرجى إدخال اسم المستخدم الثلاثي أو الوظيفي');
      return;
    }
    if (!username.trim()) {
      showFeedback('error', 'يرجى إدخال اسم الدخول (Username)');
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      showFeedback('error', 'يرجى إدخال كلمة مرور لا تقل عن 4 خانات');
      return;
    }
    if (!email.trim()) {
      showFeedback('error', 'يرجى إدخال البريد الإلكتروني للمستخدم');
      return;
    }

    // Check duplicate username
    const duplicateUsername = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() && u.id !== editingUserId
    );
    if (duplicateUsername) {
      showFeedback('error', 'اسم الدخول (Username) مستخدم بالفعل لحساب آخر، يرجى اختيار اسم مختلف');
      return;
    }

    const existingUser = editingUserId ? users.find((u) => u.id === editingUserId) : null;

    const payload: SystemUser = {
      id: editingUserId || `usr-${Date.now()}`,
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      title: jobTitle.trim() || ROLE_DEFINITIONS[role].titleAr,
      role,
      assignedBranch: role === 'branch_manager' ? assignedBranch : undefined,
      status,
      createdAt: existingUser?.createdAt || new Date().toISOString().slice(0, 10),
      lastLogin: existingUser?.lastLogin || 'لم يسجل دخول بعد',
      permissions: customPermissions,
    };

    saveSingleUser(payload, !editingUserId);
    showFeedback(
      'success',
      editingUserId
        ? `تم حفظ تعديلات حساب "${payload.name}" بنجاح`
        : `تم إنشاء حساب "${payload.name}" وتفعيل بيانات الدخول بنجاح`
    );
    setActiveTab('users_list');
  };

  // Filter users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (branchFilter !== 'all') {
        if (branchFilter === 'general_hq') {
          if (u.assignedBranch) return false;
        } else if (u.assignedBranch !== branchFilter) {
          return false;
        }
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.title && u.title.toLowerCase().includes(q)) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.assignedBranch && u.assignedBranch.toLowerCase().includes(q))
      );
    });
  }, [users, roleFilter, statusFilter, branchFilter, searchQuery]);

  // Bulk Actions Handlers
  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAllFiltered = () => {
    const allFilteredIds = filteredUsers.map((u) => u.id);
    const allSelected =
      allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...allFilteredIds])));
    }
  };

  const handleBulkStatusChange = (targetStatus: 'active' | 'suspended') => {
    let updatedCount = 0;
    const nextList = users.map((u) => {
      if (!selectedUserIds.includes(u.id)) return u;
      if (targetStatus === 'suspended' && isRootAdmin(u)) return u;
      if (u.status !== targetStatus) {
        updatedCount++;
        return { ...u, status: targetStatus };
      }
      return u;
    });
    onUpdateUsers(nextList);
    setSelectedUserIds([]);
    showFeedback(
      'success',
      targetStatus === 'active'
        ? `تم تفعيل (${updatedCount}) حسابات محددة بنجاح ✓`
        : `تم تعطيل وإيقاف (${updatedCount}) حسابات محددة بنجاح ✓`
    );
  };

  const handleBulkDeleteConfirmed = () => {
    const deletableUsers = users.filter(
      (u) =>
        selectedUserIds.includes(u.id) &&
        !isRootAdmin(u) &&
        (!currentUser || u.id !== currentUser.id)
    );
    if (deletableUsers.length === 1) {
      removeSingleUser(deletableUsers[0]);
    } else if (deletableUsers.length > 1) {
      const deletableIds = new Set(deletableUsers.map((u) => u.id));
      const remaining = users.filter((u) => !deletableIds.has(u.id));
      onUpdateUsers(remaining);
    }
    setSelectedUserIds([]);
    setConfirmBulkDelete(false);
    showFeedback('success', `تم حذف (${deletableUsers.length}) حسابات نهائياً من قاعدة البيانات ✓`);
  };

  const handleRestoreDefaultUsers = () => {
    const existingByUsername = new Map<string, SystemUser>();
    users.forEach((u) => existingByUsername.set(u.username.toLowerCase(), u));
    INITIAL_USERS.forEach((defUser) => {
      if (!existingByUsername.has(defUser.username.toLowerCase())) {
        existingByUsername.set(defUser.username.toLowerCase(), defUser);
      }
    });
    const mergedList = Array.from(existingByUsername.values());
    onUpdateUsers(mergedList);
    showFeedback(
      'success',
      `تمت استعادة وتفعيل الحسابات القياسية للمنظومة (${mergedList.length} حساب) ومزامنتها مع Supabase ✓`
    );
  };

  // Export Users Directory to CSV (Excel Arabic UTF-8 BOM)
  const handleExportUsersCSV = () => {
    const headers = [
      'الاسم الكامل',
      'المسمى الوظيفي',
      'اسم الدخول',
      'البريد الإلكتروني',
      'رقم الجوال',
      'الدور الوظيفي',
      'الفرع المخصص',
      'الحالة',
      'عدد الصلاحيات المفعلة',
      'آخر تسجيل دخول',
    ];
    const rows = filteredUsers.map((u) => [
      `"${u.name}"`,
      `"${u.title || ROLE_DEFINITIONS[u.role]?.titleAr || ''}"`,
      `"${u.username}"`,
      `"${u.email}"`,
      `"${u.phone || '—'}"`,
      `"${ROLE_DEFINITIONS[u.role]?.titleAr || u.role}"`,
      `"${u.assignedBranch || 'جميع الفروع (الإدارة العامة)'}"`,
      `"${u.status === 'active' ? 'نشط' : 'موقوف'}"`,
      `"${countEnabledPermissions(u)} / ${PERMISSION_DEFINITIONS.length}"`,
      `"${u.lastLogin || '—'}"`,
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سجل_المستخدمين_والصلاحيات_سعودي_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('success', 'تم تصدير كشف حسابات المستخدمين والصلاحيات بصيغة Excel CSV بنجاح ✓');
  };

  // KPI calculations
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const fleetManagerCount = users.filter((u) => u.role === 'fleet_manager').length;
  const branchManagerCount = users.filter((u) => u.role === 'branch_manager').length;
  const viewerCount = users.filter((u) => u.role === 'viewer').length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;

  // Filtered branches for dropdown search
  const filteredBranchesList = branches.filter(
    (b) => !branchSearch.trim() || b.toLowerCase().includes(branchSearch.toLowerCase())
  );

  // Selected user in Matrix Tab
  const matrixSelectedUser =
    matrixTargetUserId !== 'all_roles'
      ? users.find((u) => u.id === matrixTargetUserId) || null
      : null;

  // Wrapper classes depending on whether it's rendered as a full page tab or a modal popup
  const outerContainerClass = isPageMode
    ? 'w-full mb-8 animate-in fade-in duration-200'
    : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200';

  const cardContainerClass = isPageMode
    ? 'relative w-full rounded-3xl bg-[#090e1a] border border-amber-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col text-right'
    : 'relative w-full max-w-7xl rounded-3xl bg-[#090e1a] border border-amber-500/25 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] text-right';

  return (
    <div className={outerContainerClass}>
      <div
        className={cardContainerClass}
        style={{ direction: 'rtl' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold & Emerald Gradient Accent Line */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 border-b border-white/10 bg-gradient-to-l from-slate-900 via-[#0c1324] to-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-amber-950/50">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">
                  منظومة إدارة المستخدمين والصلاحيات والأدوار الرقابية
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  تحكم كامل فوري
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                إدارة حسابات الموظفين ومديري الفروع، تفعيل وتعطيل الحسابات، وتخصيص الصلاحيات الدقيقة لكل مستخدم بضغطة زر
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDefaultUsers}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              title="استعادة الحسابات القياسية للمنظومة وحفظها في السحابة"
            >
              <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>استعادة الحسابات القياسية</span>
            </button>

            <button
              type="button"
              onClick={handleExportUsersCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              title="تصدير سجل المستخدمين والصلاحيات لملف إكسيل"
            >
              <FileDown className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>تصدير الكشف (CSV)</span>
            </button>

            {activeTab !== 'form' && (
              <button
                type="button"
                onClick={handleStartAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/60 transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-4 h-4 text-slate-950 shrink-0" />
                <span>إضافة مستخدم جديد</span>
              </button>
            )}

            {!isPageMode && (
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-white/5"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Executive KPI Filter Cards (Click any card to filter immediately) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3.5 sm:px-6 sm:py-4 bg-[#060a14] border-b border-white/5">
          <button
            type="button"
            onClick={() => {
              setRoleFilter('all');
              setStatusFilter('all');
              setActiveTab('users_list');
            }}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              roleFilter === 'all' && statusFilter === 'all'
                ? 'bg-slate-800/90 border-white/30 shadow-md'
                : 'bg-slate-900/60 border-white/5 hover:border-white/15'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">إجمالي الحسابات</span>
              <span className="text-lg font-black text-white font-mono">{totalCount}</span>
              <span className="text-[10px] text-slate-400 mr-1">حساب</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-200 shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin');
              setActiveTab('users_list');
            }}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              roleFilter === 'admin'
                ? 'bg-amber-500/20 border-amber-400 shadow-md'
                : 'bg-slate-900/60 border-amber-500/20 hover:border-amber-500/40'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-amber-300/90 block">المدير العام (Admin)</span>
              <span className="text-lg font-black text-amber-400 font-mono">{adminCount}</span>
              <span className="text-[10px] text-amber-300/70 mr-1">مسؤول</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleFilter(roleFilter === 'fleet_manager' ? 'all' : 'fleet_manager');
              setActiveTab('users_list');
            }}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              roleFilter === 'fleet_manager'
                ? 'bg-emerald-500/20 border-emerald-400 shadow-md'
                : 'bg-slate-900/60 border-emerald-500/20 hover:border-emerald-500/40'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-300/90 block">مديرو الأسطول</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{fleetManagerCount}</span>
              <span className="text-[10px] text-emerald-300/70 mr-1">مدير</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleFilter(roleFilter === 'branch_manager' ? 'all' : 'branch_manager');
              setActiveTab('users_list');
            }}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              roleFilter === 'branch_manager'
                ? 'bg-cyan-500/20 border-cyan-400 shadow-md'
                : 'bg-slate-900/60 border-cyan-500/20 hover:border-cyan-500/40'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-cyan-300/90 block">مديرو الفروع</span>
              <span className="text-lg font-black text-cyan-400 font-mono">{branchManagerCount}</span>
              <span className="text-[10px] text-cyan-300/70 mr-1">فرع</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleFilter(roleFilter === 'viewer' ? 'all' : 'viewer');
              setActiveTab('users_list');
            }}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              roleFilter === 'viewer'
                ? 'bg-purple-500/20 border-purple-400 shadow-md'
                : 'bg-slate-900/60 border-purple-500/20 hover:border-purple-500/40'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-purple-300/90 block">مشاهد ومدقق</span>
              <span className="text-lg font-black text-purple-300 font-mono">{viewerCount}</span>
              <span className="text-[10px] text-purple-300/70 mr-1">مراقب</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
              <Eye className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter(
                statusFilter === 'all'
                  ? 'active'
                  : statusFilter === 'active'
                  ? 'suspended'
                  : 'all'
              );
              setActiveTab('users_list');
            }}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              statusFilter !== 'all'
                ? 'bg-amber-500/15 border-amber-400 shadow-md'
                : 'bg-slate-900/60 border-white/5 hover:border-white/15'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">حالة الحسابات</span>
              <div className="flex items-center gap-1.5 text-xs font-black font-mono mt-0.5">
                <span className="text-emerald-400">{activeCount} نشط</span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400">{suspendedCount} معطل</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 pt-3 border-b border-white/10 bg-slate-900/50">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('users_list')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'users_list'
                  ? 'border-amber-400 text-amber-300 font-black bg-amber-500/5 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>دليل المستخدمين والتحكم السريع ({filteredUsers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('permissions_matrix')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'permissions_matrix'
                  ? 'border-amber-400 text-amber-300 font-black bg-amber-500/5 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>مصفوفة الصلاحيات التفاعلية (Permissions Matrix)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activity_log')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'activity_log'
                  ? 'border-amber-400 text-amber-300 font-black bg-amber-500/5 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>سجل الرقابة ونشاط الحسابات</span>
            </button>

            {activeTab === 'form' && (
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 border-emerald-400 text-emerald-300 bg-emerald-500/10 rounded-t-xl whitespace-nowrap"
              >
                <Edit className="w-4 h-4 shrink-0" />
                <span>{editingUserId ? 'تعديل حساب وصلاحيات مستخدم' : 'إنشاء حساب مستخدم جديد'}</span>
              </button>
            )}
          </div>

          {currentUser && (
            <div className="hidden md:flex items-center gap-2 pb-2 text-[11px] text-slate-400">
              <span>حسابك الحالي:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                {currentUser.name} ({ROLE_DEFINITIONS[currentUser.role]?.badgeAr})
              </span>
            </div>
          )}
        </div>

        {/* Notification Toast Alert */}
        {feedbackMsg && (
          <div
            className={`px-6 py-3 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-200 border-b border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-200 border-b border-rose-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* ========================================================= */}
          {/* TAB 1: USERS DIRECTORY & INLINE CONTROL                   */}
          {/* ========================================================= */}
          {activeTab === 'users_list' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم، اسم الدخول (Username)، البريد، الهاتف، أو الفرع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/90 border border-white/10 rounded-xl pr-10 pl-8 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/60"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns Container */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* 1. Custom Role Filter Dropdown */}
                  <div className="relative" ref={roleDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoleDropdownOpen((prev) => !prev);
                        setIsStatusDropdownOpen(false);
                        setIsBranchFilterDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        roleFilter !== 'all'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                          : 'bg-slate-800/90 border-white/10 text-slate-200 hover:border-white/20'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {roleFilter === 'all'
                          ? 'جميع الأدوار'
                          : ROLE_DEFINITIONS[roleFilter].titleAr}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isRoleDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isRoleDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-[#0b1324] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 border-b border-white/5 text-[10px] font-bold text-slate-400">
                          تصفية حسب الدور الوظيفي
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRoleFilter('all');
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            roleFilter === 'all'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>جميع الأدوار الوظيفية ({users.length})</span>
                          </div>
                          {roleFilter === 'all' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>

                        {(
                          ['admin', 'fleet_manager', 'branch_manager', 'viewer'] as UserRole[]
                        ).map((rKey) => {
                          const rDef = ROLE_DEFINITIONS[rKey];
                          const count = users.filter((u) => u.role === rKey).length;
                          const isSelected = roleFilter === rKey;
                          return (
                            <button
                              key={rKey}
                              type="button"
                              onClick={() => {
                                setRoleFilter(rKey);
                                setIsRoleDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/15 text-amber-300'
                                  : 'text-slate-300 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {rKey === 'admin' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                                {rKey === 'fleet_manager' && (
                                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                {rKey === 'branch_manager' && (
                                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                                )}
                                {rKey === 'viewer' && <Eye className="w-3.5 h-3.5 text-purple-400" />}
                                <span>{rDef.titleAr}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                                  {count}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. Branch Filter Dropdown */}
                  <div className="relative" ref={branchFilterDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBranchFilterDropdownOpen((prev) => !prev);
                        setIsRoleDropdownOpen(false);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        branchFilter !== 'all'
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm'
                          : 'bg-slate-800/90 border-white/10 text-slate-200 hover:border-white/20'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        {branchFilter === 'all'
                          ? 'جميع الفروع'
                          : branchFilter === 'general_hq'
                          ? 'الإدارة العامة (كل الفروع)'
                          : branchFilter}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isBranchFilterDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isBranchFilterDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#0b1324] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] py-1.5 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 border-b border-white/5 text-[10px] font-bold text-slate-400">
                          تصفية حسب الفرع المخصص
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBranchFilter('all');
                            setIsBranchFilterDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            branchFilter === 'all'
                              ? 'bg-cyan-500/15 text-cyan-300'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span>كل الفروع والإدارة العامة</span>
                          {branchFilter === 'all' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBranchFilter('general_hq');
                            setIsBranchFilterDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            branchFilter === 'general_hq'
                              ? 'bg-cyan-500/15 text-cyan-300'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span>الإدارة العامة (صلاحية كل الفروع)</span>
                          {branchFilter === 'general_hq' && (
                            <Check className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                        </button>
                        <div className="my-1 border-t border-white/5" />
                        {branches.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setBranchFilter(b);
                              setIsBranchFilterDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                              branchFilter === b
                                ? 'bg-cyan-500/15 text-cyan-300'
                                : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <span>{b}</span>
                            {branchFilter === b && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Custom Status Filter Dropdown */}
                  <div className="relative" ref={statusDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsStatusDropdownOpen((prev) => !prev);
                        setIsRoleDropdownOpen(false);
                        setIsBranchFilterDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        statusFilter !== 'all'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                          : 'bg-slate-800/90 border-white/10 text-slate-200 hover:border-white/20'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {statusFilter === 'all'
                          ? 'كل الحالات'
                          : statusFilter === 'active'
                          ? 'نشط فقط'
                          : 'موقوف / معلق'}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isStatusDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isStatusDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-[#0b1324] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 border-b border-white/5 text-[10px] font-bold text-slate-400">
                          تصفية حسب حالة الحساب
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('all');
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            statusFilter === 'all'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span>جميع الحالات ({users.length})</span>
                          {statusFilter === 'all' && (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('active');
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            statusFilter === 'active'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>حسابات نشطة ({activeCount})</span>
                          </div>
                          {statusFilter === 'active' && (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('suspended');
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            statusFilter === 'suspended'
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span>حسابات موقوفة ({suspendedCount})</span>
                          </div>
                          {statusFilter === 'suspended' && (
                            <Check className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reset Filters Button */}
                  {(roleFilter !== 'all' ||
                    statusFilter !== 'all' ||
                    branchFilter !== 'all' ||
                    searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleFilter('all');
                        setStatusFilter('all');
                        setBranchFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                    >
                      إعادة ضبط الفلاتر
                    </button>
                  )}
                </div>
              </div>

              {/* Bulk Actions Bar (Appears when 1 or more users are checked) */}
              {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
                      تم تحديد {selectedUserIds.length} حساب
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      اختر الإجراء الجماعي المطلوب تطبيقه فوراً:
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange('active')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>تفعيل المحددين</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange('suspended')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>إيقاف وتعطيل المحددين</span>
                    </button>

                    {confirmBulkDelete ? (
                      <div className="flex items-center gap-1.5 bg-rose-950/90 px-2.5 py-1 rounded-xl border border-rose-500/50">
                        <span className="text-[11px] font-bold text-rose-200">تأكيد الحذف النهائي؟</span>
                        <button
                          type="button"
                          onClick={handleBulkDeleteConfirmed}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] cursor-pointer"
                        >
                          نعم، احذف
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmBulkDelete(false)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmBulkDelete(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف المحددين نهائياً</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedUserIds([])}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>
              )}

              {/* Users Table / Directory */}
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl overflow-x-auto min-h-[420px] pb-24 relative">
                <table className="w-full min-w-[1120px] text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950/90 text-slate-400 border-b border-white/10">
                      <th className="py-3.5 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAllFiltered}
                          className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                          title="تحديد / إلغاء تحديد الكل"
                        >
                          {filteredUsers.length > 0 &&
                          filteredUsers.every((u) => selectedUserIds.includes(u.id)) ? (
                            <CheckSquare className="w-4 h-4 text-amber-400 mx-auto" />
                          ) : (
                            <Square className="w-4 h-4 mx-auto" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 px-4 font-bold whitespace-nowrap">المستخدم والمسمى الوظيفي</th>
                      <th className="py-3.5 px-3 font-bold whitespace-nowrap">بيانات الدخول (Username & Pass)</th>
                      <th className="py-3.5 px-3 font-bold whitespace-nowrap">الدور الوظيفي (تغيير فوري)</th>
                      <th className="py-3.5 px-3 font-bold whitespace-nowrap">الفرع المخصص</th>
                      <th className="py-3.5 px-3 font-bold whitespace-nowrap">الصلاحيات المفعلة</th>
                      <th className="py-3.5 px-3 font-bold whitespace-nowrap">حالة الحساب</th>
                      <th className="py-3.5 px-4 font-bold text-left whitespace-nowrap min-w-[270px]">
                        إجراءات التحكم السريع
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => {
                      const roleMeta = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.viewer;
                      const isPassVisible = !!visiblePasswords[user.id];
                      const isCurrentUser = currentUser?.id === user.id;
                      const isPrimaryAdmin = isRootAdmin(user);
                      const isSelected = selectedUserIds.includes(user.id);
                      const isPermissionsExpanded = expandedPermissionsUserId === user.id;
                      const enabledPermsCount = countEnabledPermissions(user);
                      const userPerms = getEffectivePermissions(user);
                      const avatarInitials = user.name
                        .trim()
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join(' ');

                      return (
                        <React.Fragment key={user.id}>
                          <tr
                            className={`transition-colors ${
                              user.status === 'suspended'
                                ? 'bg-rose-950/15 hover:bg-rose-950/25 opacity-80'
                                : isSelected
                                ? 'bg-amber-500/10 hover:bg-amber-500/15'
                                : 'hover:bg-white/[0.03]'
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleSelectUser(user.id)}
                                className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-amber-400 mx-auto" />
                                ) : (
                                  <Square className="w-4 h-4 mx-auto" />
                                )}
                              </button>
                            </td>

                            {/* 1. User Avatar, Name, Email & Job Title */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border shrink-0 relative ${roleMeta.badgeClass}`}
                                >
                                  {avatarInitials || user.name.slice(0, 2)}
                                  <span
                                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                                      user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                    <span>{user.name}</span>
                                    {isCurrentUser && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
                                        أنت
                                      </span>
                                    )}
                                    {isPrimaryAdmin && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                                        رئيسي
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
                                    {user.title || roleMeta.titleAr}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                    <span>{user.email}</span>
                                    {user.phone && <span>• {user.phone}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Login Credentials (Username & Password) */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="inline-flex flex-col gap-1 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-white/10">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-slate-400">المستخدم:</span>
                                  <span className="font-mono font-bold text-amber-300 text-xs">
                                    {user.username || 'admin'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-slate-400">المرور:</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono text-[11px] text-emerald-300 font-bold">
                                      {isPassVisible ? user.password || '123456' : '••••••'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setVisiblePasswords((prev) => ({
                                          ...prev,
                                          [user.id]: !prev[user.id],
                                        }))
                                      }
                                      className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                                      title={isPassVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                    >
                                      {isPassVisible ? (
                                        <EyeOff className="w-3 h-3" />
                                      ) : (
                                        <Eye className="w-3 h-3" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCredentials(user)}
                                      className="text-slate-400 hover:text-amber-300 p-0.5 cursor-pointer"
                                      title="نسخ بيانات الدخول"
                                    >
                                      {copiedId === user.id ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 3. Role Quick Selector */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <select
                                value={user.role}
                                disabled={isPrimaryAdmin}
                                onChange={(e) =>
                                  handleQuickRoleChange(user, e.target.value as UserRole)
                                }
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border bg-slate-950 focus:outline-none cursor-pointer transition-all ${
                                  roleMeta.badgeClass
                                } ${isPrimaryAdmin ? 'opacity-75 cursor-not-allowed' : 'hover:brightness-110'}`}
                                title="تغيير الدور الوظيفي للمستخدم فوراً"
                              >
                                <option value="admin" className="bg-slate-900 text-amber-300">
                                  👑 مدير النظام (Admin)
                                </option>
                                <option value="fleet_manager" className="bg-slate-900 text-emerald-300">
                                  🚛 مدير حركة الأسطول
                                </option>
                                <option value="branch_manager" className="bg-slate-900 text-cyan-300">
                                  🏢 مدير فرع
                                </option>
                                <option value="viewer" className="bg-slate-900 text-purple-300">
                                  👁️ مشاهد ومدقق (قراءة فقط)
                                </option>
                              </select>
                            </td>

                            {/* 4. Branch Assignment Quick Selector */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {user.role === 'branch_manager' ? (
                                <select
                                  value={user.assignedBranch || branches[0] || 'فرع المهندسين'}
                                  onChange={(e) => handleQuickBranchChange(user, e.target.value)}
                                  className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs focus:outline-none cursor-pointer hover:bg-cyan-500/20"
                                >
                                  {branches.map((b) => (
                                    <option key={b} value={b} className="bg-slate-900 text-white">
                                      📍 {b}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-[11px] font-semibold border border-white/5">
                                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>كل الفروع (الإدارة العامة)</span>
                                </span>
                              )}
                            </td>

                            {/* 5. Interactive Permissions Summary & Drawer Trigger */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedPermissionsUserId(
                                    isPermissionsExpanded ? null : user.id
                                  )
                                }
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                  isPermissionsExpanded
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                                    : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-white/10'
                                }`}
                                title="اضغط لفتح وتعديل صلاحيات هذا المستخدم مباشرة"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-mono">
                                  {enabledPermsCount}/{PERMISSION_DEFINITIONS.length} صلاحيات
                                </span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    isPermissionsExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </td>

                            {/* 6. Account Status Interactive Switch */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <button
                                type="button"
                                disabled={isPrimaryAdmin}
                                onClick={() => handleToggleUserStatus(user)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                                  isPrimaryAdmin
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'cursor-pointer hover:scale-[1.02]'
                                } ${
                                  user.status === 'active'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                }`}
                                title={
                                  isPrimaryAdmin
                                    ? 'حساب المدير الرئيسي نشط دائماً'
                                    : 'اضغط لتبديل حالة الحساب (نشط / موقوف)'
                                }
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    user.status === 'active'
                                      ? 'bg-emerald-400 animate-pulse'
                                      : 'bg-rose-400'
                                  }`}
                                />
                                <span>{user.status === 'active' ? 'نشط ومفعل' : 'موقوف حالياً'}</span>
                              </button>
                            </td>

                            {/* 7. Actions Column (Edit, Suspend/Activate, Delete, Switch Account) */}
                            <td className="py-3.5 px-4 text-left whitespace-nowrap min-w-[270px]">
                              {confirmDeleteId === user.id ? (
                                <div className="flex items-center justify-end gap-1.5 bg-rose-950/90 px-3 py-1.5 rounded-xl border border-rose-500/50 animate-in fade-in duration-150">
                                  <span className="text-[11px] text-rose-200 font-bold ml-1">
                                    تأكيد حذف "{user.name}"؟
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSingleUser(user);
                                      setConfirmDeleteId(null);
                                      showFeedback(
                                        'success',
                                        `تم حذف حساب "${user.name}" نهائياً من النظام ✓`
                                      );
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] cursor-pointer shadow-md"
                                  >
                                    نعم، احذف
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDeleteId(null);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className="flex items-center justify-end gap-1.5 flex-nowrap whitespace-nowrap"
                                  data-row-menu
                                >
                                  {/* Edit User Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEdit(user);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0 whitespace-nowrap"
                                    title="تعديل بيانات الحساب والصلاحيات"
                                  >
                                    <Edit className="w-3.5 h-3.5 shrink-0" />
                                    <span>تعديل</span>
                                  </button>

                                  {/* Quick Enable / Suspend Button */}
                                  {!isPrimaryAdmin && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleUserStatus(user);
                                      }}
                                      className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0 whitespace-nowrap ${
                                        user.status === 'active'
                                          ? 'bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
                                          : 'bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                                      }`}
                                      title={
                                        user.status === 'active'
                                          ? 'تعطيل وإيقاف الحساب مؤقتاً'
                                          : 'إعادة تفعيل الحساب'
                                      }
                                    >
                                      <Power className="w-3.5 h-3.5 shrink-0" />
                                      <span>{user.status === 'active' ? 'تعطيل' : 'تفعيل'}</span>
                                    </button>
                                  )}

                                  {/* Direct Delete Button */}
                                  {!isPrimaryAdmin && !isCurrentUser && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteId(user.id);
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0 whitespace-nowrap"
                                      title="حذف الحساب نهائياً"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>حذف</span>
                                    </button>
                                  )}

                                  {/* More Actions Dropdown Button */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenRowMenuId(
                                          openRowMenuId === user.id ? null : user.id
                                        );
                                      }}
                                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                        openRowMenuId === user.id
                                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                                      }`}
                                      title="خيارات إضافية سريعة"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>

                                    {openRowMenuId === user.id && (
                                      <div className="absolute left-0 mt-1.5 w-56 rounded-2xl bg-[#0d1629] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] py-1.5 z-50 text-right animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-bold text-slate-400 truncate">
                                          تحكم سريع: {user.name}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setExpandedPermissionsUserId(
                                              isPermissionsExpanded ? null : user.id
                                            );
                                            setOpenRowMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                        >
                                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                                          <span>تخصيص الصلاحيات الـ 9 مباشرة</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleQuickResetPassword(user);
                                            setOpenRowMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                                        >
                                          <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                                          <span>توليد كلمة مرور جديدة فوراً</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleCopyCredentials(user);
                                            setOpenRowMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                          <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>نسخ بيانات الدخول للحافظة</span>
                                        </button>

                                        {onSwitchUser && !isCurrentUser && user.status === 'active' && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              onSwitchUser(user);
                                              setOpenRowMenuId(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer border-t border-white/5 mt-1 pt-2"
                                          >
                                            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>معاينة النظام بهذا الحساب</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>

                          {/* INLINE EXPANDABLE PERMISSIONS CONTROL DRAWER FOR THIS USER */}
                          {isPermissionsExpanded && (
                            <tr className="bg-[#060b16] border-b border-amber-500/30">
                              <td colSpan={8} className="p-4 sm:p-5">
                                <div className="rounded-2xl bg-slate-900/95 border border-amber-500/30 p-4 space-y-4 shadow-2xl">
                                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                                        <SlidersHorizontal className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h4 className="text-xs sm:text-sm font-black text-white">
                                          تخصيص الصلاحيات الفردية للمستخدم: {user.name}
                                        </h4>
                                        <p className="text-[11px] text-slate-400">
                                          اضغط على أي صلاحية لتفعيلها أو إيقافها فوراً لهذا الحساب مع الحفظ التلقائي
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleApplyPermissionPreset(user, 'full')}
                                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer transition-all"
                                      >
                                        منح جميع الصلاحيات (9/9)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleApplyPermissionPreset(user, 'role_default')
                                        }
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold cursor-pointer transition-all"
                                      >
                                        الوضع الافتراضي لدور ({roleMeta.badgeAr})
                                      </button>
                                      {!isPrimaryAdmin && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleApplyPermissionPreset(user, 'readonly')
                                          }
                                          className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold cursor-pointer transition-all"
                                        >
                                          قراءة فقط (مشاهد)
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setExpandedPermissionsUserId(null)}
                                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                                      >
                                        إغلاق اللوحة
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {PERMISSION_DEFINITIONS.map((perm) => {
                                      const isEnabled = !!userPerms[perm.key];
                                      return (
                                        <button
                                          key={perm.key}
                                          type="button"
                                          onClick={() =>
                                            handleToggleSingleUserPermission(user, perm.key)
                                          }
                                          className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-right transition-all cursor-pointer ${
                                            isEnabled
                                              ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm'
                                              : 'bg-slate-950/70 border-white/5 text-slate-400 hover:border-white/15'
                                          }`}
                                        >
                                          <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold text-amber-400/80 block">
                                              {CATEGORY_LABELS[perm.category]}
                                            </span>
                                            <div className="text-xs font-bold text-white">
                                              {perm.labelAr}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                              {perm.descriptionAr}
                                            </div>
                                          </div>
                                          <div
                                            className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 mt-1 ${
                                              isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                                            }`}
                                          >
                                            <div
                                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                                isEnabled ? '-translate-x-4' : 'translate-x-0'
                                              }`}
                                            />
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users className="w-8 h-8 text-slate-600" />
                            <p className="text-sm font-bold text-slate-300">
                              لا توجد حسابات مطابقة لمعايير البحث أو التصفية الحالية
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setRoleFilter('all');
                                setStatusFilter('all');
                                setBranchFilter('all');
                                setSearchQuery('');
                              }}
                              className="mt-1 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer"
                            >
                              إظهار جميع المستخدمين ({users.length})
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: INTERACTIVE PERMISSIONS MATRIX                     */}
          {/* ========================================================= */}
          {activeTab === 'permissions_matrix' && (
            <div className="space-y-5">
              {/* Top Selector: Inspect & Customize Specific User OR Compare Standard Roles */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1629] to-slate-900 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      مصفوفة الصلاحيات التفاعلية وتخصيص الحسابات
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      يمكنك مقارنة الأدوار القياسية الأربعة، أو اختيار مستخدم محدد من القائمة لتعديل صلاحياته مباشرة
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold text-amber-300">تخصيص صلاحيات مستخدم:</span>
                  <select
                    value={matrixTargetUserId}
                    onChange={(e) => setMatrixTargetUserId(e.target.value)}
                    className="bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all_roles">-- عرض مقارنة الأدوار القياسية الأربعة --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.name} ({ROLE_DEFINITIONS[u.role]?.badgeAr})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(['admin', 'fleet_manager', 'branch_manager', 'viewer'] as UserRole[]).map(
                  (rKey) => {
                    const def = ROLE_DEFINITIONS[rKey];
                    const roleUsersCount = users.filter((u) => u.role === rKey).length;
                    return (
                      <div
                        key={rKey}
                        className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${def.badgeClass}`}
                            >
                              {def.badgeAr}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 font-mono">
                              {roleUsersCount} مستخدم
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{def.titleAr}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {def.descriptionAr}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setRoleFilter(rKey);
                            setActiveTab('users_list');
                          }}
                          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-bold border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>عرض حسابات هذا الدور ({roleUsersCount})</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Matrix Comparison & Interactive User Override Table */}
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-x-auto shadow-2xl">
                <table className="w-full min-w-[920px] text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-white/10">
                      <th className="py-3.5 px-4 font-bold">الصلاحية الوظيفية في النظام</th>
                      <th className="py-3.5 px-3 font-bold text-center text-amber-300">
                        مدير النظام (Admin)
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-emerald-300">
                        مدير الأسطول
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-cyan-300">
                        مدير الفرع
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-purple-300">
                        مشاهد (Viewer)
                      </th>
                      {matrixSelectedUser && (
                        <th className="py-3.5 px-4 font-black text-center bg-amber-500/15 text-amber-300 border-r border-amber-500/30">
                          تخصيص مباشر: {matrixSelectedUser.name}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {PERMISSION_DEFINITIONS.map((perm) => {
                      const selectedUserEnabled = matrixSelectedUser
                        ? !!getEffectivePermissions(matrixSelectedUser)[perm.key]
                        : false;

                      return (
                        <tr key={perm.key} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-amber-300/90 font-bold">
                                {CATEGORY_LABELS[perm.category]}
                              </span>
                              <span className="font-bold text-white">{perm.labelAr}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {perm.descriptionAr}
                            </div>
                          </td>
                          {(
                            ['admin', 'fleet_manager', 'branch_manager', 'viewer'] as UserRole[]
                          ).map((rKey) => {
                            const allowed = !!ROLE_DEFAULT_PERMISSIONS[rKey][perm.key];
                            return (
                              <td key={rKey} className="py-3 px-3 text-center">
                                {allowed ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400/50 border border-rose-500/20">
                                    <XCircle className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          {matrixSelectedUser && (
                            <td className="py-3 px-4 text-center bg-amber-500/5 border-r border-amber-500/20">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleSingleUserPermission(matrixSelectedUser, perm.key)
                                }
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                  selectedUserEnabled
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                }`}
                              >
                                {selectedUserEnabled ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>مسموح (تعديل)</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>محجوب (تفعيل)</span>
                                  </>
                                )}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: USER ACTIVITY & AUDIT LOG                          */}
          {/* ========================================================= */}
          {activeTab === 'activity_log' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      سجل الرقابة الإدارية ونشاط المستخدمين
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      متابعة آخر عمليات الدخول والتعديلات الإدارية وحركات الحسابات الموثقة في النظام
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Card 1: Last Login & Status per User */}
                <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-4 space-y-3">
                  <h5 className="text-xs font-black text-amber-300 flex items-center gap-2 border-b border-white/10 pb-2.5">
                    <UserCheck className="w-4 h-4" />
                    <span>حالة الجلسات وآخر ظهور للمستخدمين ({users.length})</span>
                  </h5>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-white/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {ROLE_DEFINITIONS[u.role]?.titleAr} •{' '}
                              {u.assignedBranch || 'كل الفروع'}
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block">آخر نشاط مسجل</span>
                          <span className="text-[11px] font-mono font-bold text-cyan-300">
                            {u.lastLogin || 'نشط اليوم'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Recent System Audit Logs */}
                <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-4 space-y-3">
                  <h5 className="text-xs font-black text-emerald-300 flex items-center gap-2 border-b border-white/10 pb-2.5">
                    <Shield className="w-4 h-4" />
                    <span>أحدث العمليات الإدارية والرقابية الموثقة</span>
                  </h5>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {auditLogs.length > 0 ? (
                      auditLogs.slice(0, 15).map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-black text-white">{log.action}</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {log.date} — {log.time}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            بواسطة: <span className="text-amber-300 font-bold">{log.user}</span> | الهدف:{' '}
                            <span className="text-cyan-300 font-bold">{log.vehicleNumber}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            التغيير: {log.oldValue} ⬅️ {log.newValue}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        لا توجد سجلات تعديل حديثة بعد في هذه الجلسة
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ADD / EDIT USER FORM & CUSTOM PERMISSIONS          */}
          {/* ========================================================= */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Right Column: Basic Info, Credentials & Role Assignment */}
                <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-white/10">
                  <h4 className="text-xs font-black text-amber-300 flex items-center gap-2 border-b border-white/10 pb-2.5">
                    <Users className="w-4 h-4" />
                    <span>1. البيانات الشخصية وبيانات تسجيل الدخول</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                        الاسم الكامل للمستخدم *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: أ. محمد عبد الرحمن"
                        className="w-full bg-slate-800/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Username & Password Credentials Box */}
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/25 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>بيانات تسجيل الدخول للحساب (Username & Password)</span>
                        </span>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[10px] font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>توليد كلمة مرور قوية</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-300 mb-1">
                            اسم الدخول (Username) *
                          </label>
                          <input
                            type="text"
                            required
                            dir="ltr"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                            placeholder="e.g. mohandeseen_mgr"
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono text-left focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-300 mb-1">
                            كلمة المرور (Password) *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              dir="ltr"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-900 border border-white/15 rounded-xl pl-3 pr-9 py-2 text-xs text-emerald-300 font-mono text-left focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            >
                              {showPassword ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                        البريد الإلكتروني الرسمي *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@seoudisupermarket.com"
                          className="w-full bg-slate-800/90 border border-white/15 rounded-xl pr-9 pl-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                        رقم الهاتف / الواتساب
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01000000000"
                          className="w-full bg-slate-800/90 border border-white/15 rounded-xl pr-9 pl-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                        المسمى الوظيفي
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="مثال: مدير فرع المهندسين"
                        className="w-full bg-slate-800/90 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                        حالة الحساب
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setStatus('active')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            status === 'active'
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-800/50 border-white/10 text-slate-400'
                          }`}
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>نشط ومفعل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus('suspended')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            status === 'suspended'
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                              : 'bg-slate-800/50 border-white/10 text-slate-400'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>موقوف مؤقتاً</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Role Selector Cards */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-amber-300 mb-2">
                      2. اختيار الدور الوظيفي ومستوى الصلاحيات القياسي *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(
                        ['admin', 'fleet_manager', 'branch_manager', 'viewer'] as UserRole[]
                      ).map((rKey) => {
                        const def = ROLE_DEFINITIONS[rKey];
                        const isSelected = role === rKey;
                        return (
                          <button
                            key={rKey}
                            type="button"
                            onClick={() => handleRoleChange(rKey)}
                            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                : 'bg-slate-800/60 border-white/10 hover:border-white/25'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded border ${def.badgeClass}`}
                              >
                                {def.badgeAr}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                            </div>
                            <div className="text-xs font-bold text-white mt-1">{def.titleAr}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conditional Branch Selector if Role === branch_manager */}
                  {role === 'branch_manager' && (
                    <div
                      className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 animate-in fade-in duration-150"
                      ref={branchFormDropdownRef}
                    >
                      <label className="block text-xs font-bold text-cyan-300 mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>تحديد الفرع المخصص لمدير الفرع *</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsBranchFormDropdownOpen((prev) => !prev)}
                          className="w-full flex items-center justify-between bg-slate-900 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-cyan-400" />
                            <span>{assignedBranch || 'اختر الفرع...'}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-cyan-400 transition-transform ${
                              isBranchFormDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isBranchFormDropdownOpen && (
                          <div className="absolute right-0 left-0 mt-1.5 rounded-2xl bg-[#0b1324] border border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="p-2 border-b border-white/10">
                              <input
                                type="text"
                                placeholder="ابحث عن الفرع..."
                                value={branchSearch}
                                onChange={(e) => setBranchSearch(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto py-1">
                              {filteredBranchesList.map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => {
                                    setAssignedBranch(b);
                                    setIsBranchFormDropdownOpen(false);
                                    setBranchSearch('');
                                  }}
                                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                                    assignedBranch === b
                                      ? 'bg-cyan-500/20 text-cyan-300'
                                      : 'text-slate-300 hover:bg-white/5'
                                  }`}
                                >
                                  <span>{b}</span>
                                  {assignedBranch === b && (
                                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-cyan-200/70 mt-1.5">
                        سيرى هذا المستخدم مركبات وتنبيهات هذا الفرع فقط لسهولة المتابعة والتركيز.
                      </p>
                    </div>
                  )}
                </div>

                {/* Left Column: Granular Custom Permissions Checkboxes */}
                <div className="lg:col-span-6 space-y-3 p-5 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                      <h4 className="text-xs font-black text-emerald-300 flex items-center gap-2">
                        <KeyRound className="w-4 h-4" />
                        <span>3. تخصيص الصلاحيات الدقيقة لهذا الحساب</span>
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCustomPermissions({ ...ROLE_DEFAULT_PERMISSIONS.admin })
                          }
                          className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 font-bold cursor-pointer"
                        >
                          تفعيل الكل
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomPermissions({ ...ROLE_DEFAULT_PERMISSIONS[role] })
                          }
                          className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-slate-300 hover:text-white font-bold cursor-pointer"
                        >
                          إعادة ضبط للدور
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {PERMISSION_DEFINITIONS.map((perm) => {
                        const checked = !!customPermissions[perm.key];
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              checked
                                ? 'bg-emerald-500/10 border-emerald-500/35 text-white'
                                : 'bg-slate-800/40 border-white/5 text-slate-400'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setCustomPermissions((prev) => ({
                                    ...prev,
                                    [perm.key]: e.target.checked,
                                  }))
                                }
                                className="mt-1 accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                              />
                              <div>
                                <div className="text-xs font-bold">{perm.labelAr}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {perm.descriptionAr}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">
                              {CATEGORY_LABELS[perm.category]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveTab('users_list')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      إلغاء والعودة للقائمة
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/50 cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {editingUserId
                          ? 'حفظ التعديلات وتحديث الصلاحيات'
                          : 'إنشاء الحساب وتفعيل الصلاحيات'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
