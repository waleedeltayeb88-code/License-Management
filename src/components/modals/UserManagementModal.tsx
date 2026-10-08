import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UserPlus,
  Users,
  Shield,
  Lock,
  Building2,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Check,
  Search,
  UserCheck,
  UserX,
  Crown,
  Truck,
  Eye,
  EyeOff,
  MoreVertical,
  ChevronDown,
  Filter,
  Sparkles,
  Sliders,
  RotateCcw,
  ShieldAlert,
  Info,
  Calendar,
  Copy
} from 'lucide-react';
import { SystemUser, UserRole, UserPermissions } from '../../types';
import { Language } from '../../utils/i18n';
import { 
  ROLE_DEFAULT_PERMISSIONS, 
  PERMISSION_DEFINITIONS, 
  ROLE_DEFINITIONS,
  RoleMeta,
  sanitizeUserPermissions
} from '../../utils/permissionUtils';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: SystemUser[];
  onUpdateUsers: (updated: SystemUser[]) => void;
  currentUser: SystemUser;
  branches: string[];
  lang: Language;
}

type ModalTab = 'users_list' | 'permissions_matrix' | 'form';

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUsers,
  currentUser,
  branches = [],
  lang,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState<ModalTab>('users_list');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Password visibility states (exclusive to Admin)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Dropdown menus open state
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [openActionUserId, setOpenActionUserId] = useState<string | null>(null);

  // Form state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<UserRole>('fleet_manager');
  const [isFormRoleDropdownOpen, setIsFormRoleDropdownOpen] = useState(false);
  const [formBranch, setFormBranch] = useState<string>('');
  const [isFormBranchDropdownOpen, setIsFormBranchDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');

  // Custom permissions toggle
  const [enableCustomPermissions, setEnableCustomPermissions] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<UserPermissions>(ROLE_DEFAULT_PERMISSIONS.fleet_manager);

  // Quick Password Reset Dialog
  const [passwordResetUserId, setPasswordResetUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Delete User Confirmation Dialog (custom modal so it never gets blocked by browser/iframe)
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; username: string } | null>(null);

  // Notification feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsRoleFilterOpen(false);
        setIsStatusFilterOpen(false);
        setOpenActionUserId(null);
        setIsFormRoleDropdownOpen(false);
        setIsFormBranchDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  if (!isOpen) return null;

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(result);
    setShowPassword(true);
    showNotification('تم توليد كلمة سر قوية وعشوائية بنجاح');
  };

  const generateRandomPasswordForReset = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(result);
    setShowResetPassword(true);
    showNotification('تم توليد كلمة سر عشوائية جديدة وقوية');
  };

  const handleCopyPassword = (password: string, username: string) => {
    if (!isAdmin) {
      showNotification('صلاحية الاطلاع على كلمات المرور خاصة بالمدير فقط', 'error');
      return;
    }
    try {
      navigator.clipboard?.writeText(password);
      showNotification(`تم نسخ كلمة مرور المستخدم @${username} بنجاح: ${password}`);
    } catch (e) {
      showNotification(`كلمة المرور هي: ${password}`);
    }
  };

  const toggleRevealPassword = (userId: string) => {
    if (!isAdmin) return;
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const toggleShowAll = () => {
    if (!isAdmin) return;
    setShowAllPasswords(prev => !prev);
  };

  const resetForm = () => {
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setShowPassword(false);
    setFormRole('fleet_manager');
    setFormBranch('');
    setBranchSearch('');
    setFormPhone('');
    setFormStatus('active');
    setEnableCustomPermissions(false);
    setCustomPermissions(ROLE_DEFAULT_PERMISSIONS.fleet_manager);
    setEditingUserId(null);
    setActiveTab('users_list');
  };

  const handleStartAdd = () => {
    resetForm();
    setActiveTab('form');
  };

  const handleStartEdit = (user: SystemUser) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPassword(user.password || '123456');
    setShowPassword(false);
    setFormRole(user.role);
    setFormBranch(user.assignedBranch || '');
    setFormPhone(user.phone || '');
    setFormStatus(user.status);

    const sanitized = sanitizeUserPermissions(user.role, user.permissions);
    setEnableCustomPermissions(false);
    setCustomPermissions(sanitized);

    setOpenActionUserId(null);
    setActiveTab('form');
  };

  const handleRoleChangeInForm = (newRole: UserRole) => {
    setFormRole(newRole);
    setIsFormRoleDropdownOpen(false);
    // Always update permissions to match the newly selected role
    setCustomPermissions({ ...ROLE_DEFAULT_PERMISSIONS[newRole] });
    if (newRole !== 'branch_manager') {
      setFormBranch('');
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formUsername.trim()) {
      showNotification('يرجى إدخال الاسم الكامل واسم المستخدم', 'error');
      return;
    }

    const cleanUsername = formUsername.trim().toLowerCase();

    // Check duplicate username if adding new
    if (!editingUserId) {
      const exists = users.some(u => u.username.toLowerCase() === cleanUsername);
      if (exists) {
        showNotification('اسم المستخدم هذا مسجل بالفعل لمستخدم آخر', 'error');
        return;
      }
    }

    const rawPermissions = enableCustomPermissions ? customPermissions : ROLE_DEFAULT_PERMISSIONS[formRole];
    const assignedPermissions = sanitizeUserPermissions(formRole, rawPermissions);

    if (editingUserId) {
      // Update existing
      const updatedList = users.map(u => {
        if (u.id === editingUserId) {
          return {
            ...u,
            name: formName.trim(),
            username: cleanUsername,
            email: formEmail.trim() || `${cleanUsername}@seoudi.com`,
            password: formPassword.trim() || u.password,
            role: formRole,
            assignedBranch: formRole === 'branch_manager' ? formBranch : undefined,
            phone: formPhone.trim(),
            status: formStatus,
            permissions: assignedPermissions,
          };
        }
        return u;
      });

      onUpdateUsers(updatedList);
      showNotification('تم تحديث بيانات وصلاحيات المستخدم بنجاح');
      resetForm();
    } else {
      // Add new
      const newUser: SystemUser = {
        id: `user-${Date.now()}`,
        name: formName.trim(),
        username: cleanUsername,
        email: formEmail.trim() || `${cleanUsername}@seoudi.com`,
        password: formPassword.trim() || '123456',
        role: formRole,
        assignedBranch: formRole === 'branch_manager' ? formBranch : undefined,
        phone: formPhone.trim(),
        status: formStatus,
        createdAt: new Date().toISOString().slice(0, 10),
        permissions: assignedPermissions,
      };

      onUpdateUsers([...users, newUser]);
      showNotification(`تم إنشاء وتفعيل حساب المستخدم ${newUser.name} بنجاح`);
      resetForm();
    }
  };

  const handleDeleteUser = (userId: string, userName: string, username: string = '') => {
    setOpenActionUserId(null);
    if (userId === currentUser.id || username.toLowerCase() === 'admin') {
      showNotification('لا يمكن حذف حساب المدير العام الأساسي للنظام', 'error');
      return;
    }

    setUserToDelete({ id: userId, name: userName, username });
  };

  const confirmDeleteUserExecution = () => {
    if (!userToDelete) return;
    const remaining = users.filter(u => u.id !== userToDelete.id);
    onUpdateUsers(remaining);
    showNotification(`تم حذف حساب "${userToDelete.name}" نهائياً من المنظومة وقاعدة البيانات ✓`);
    setUserToDelete(null);
  };

  const handleToggleStatus = (userId: string) => {
    setOpenActionUserId(null);
    if (userId === currentUser.id) {
      showNotification('لا يمكنك تعليق حسابك الإداري الحالي', 'error');
      return;
    }

    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus as 'active' | 'suspended' };
      }
      return u;
    });

    onUpdateUsers(updated);
    showNotification('تم تحديث حالة الحساب بنجاح');
  };

  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUserId || !newPasswordInput.trim()) {
      showNotification('يرجى كتابة كلمة المرور الجديدة', 'error');
      return;
    }

    if (!isAdmin) {
      showNotification('عفواً: تغيير كلمات المرور صلاحية حصرية لمدير النظام فقط', 'error');
      return;
    }

    const targetUser = users.find(u => u.id === passwordResetUserId);
    const updated = users.map(u => {
      if (u.id === passwordResetUserId) {
        return { ...u, password: newPasswordInput.trim() };
      }
      return u;
    });

    onUpdateUsers(updated);
    showNotification(`تم تغيير كلمة مرور ${targetUser?.name || 'المستخدم'} (@${targetUser?.username}) بنجاح`);
    setPasswordResetUserId(null);
    setNewPasswordInput('');
    setShowResetPassword(false);
    setShowCurrentPassword(false);
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    // Role filter
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    // Status filter
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.assignedBranch && u.assignedBranch.toLowerCase().includes(q))
    );
  });

  // KPI calculations
  const totalCount = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const managersCount = users.filter(u => u.role === 'fleet_manager' || u.role === 'branch_manager').length;

  // Filtered branches for dropdown search
  const filteredBranchesList = branches.filter(b => 
    !branchSearch.trim() || b.toLowerCase().includes(branchSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-[#090e1a] border border-amber-500/25 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] text-right"
        style={{ direction: 'rtl' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold & Emerald Gradient Accent Line */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                إدارة المستخدمين والصلاحيات
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توزيع الأدوار الإدارية وضبط صلاحيات الأسطول والفروع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'form' && (
              <button
                type="button"
                onClick={handleStartAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/60 transition-all cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>إضافة مستخدم جديد</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:px-5 sm:py-3 bg-[#060a14] border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">إجمالي المستخدمين</span>
              <span className="text-base font-black text-white font-mono">{totalCount} حساب</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-300/80 block">مدراء النظام (Admins)</span>
              <span className="text-base font-black text-amber-400 font-mono">{adminCount} مسؤول</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-300/80 block">مسؤولو الأسطول والفروع</span>
              <span className="text-base font-black text-emerald-400 font-mono">{managersCount} مدير</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">حالة الحسابات</span>
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                <span className="text-emerald-400">{activeCount} نشط</span>
                <span className="text-slate-500">•</span>
                <span className="text-rose-400">{suspendedCount} معلق</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('users_list')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'users_list'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>قائمة المستخدمين والحسابات ({filteredUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('permissions_matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'permissions_matrix'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>مصفوفة الصلاحيات والحقوق (Permissions Matrix)</span>
          </button>

          {activeTab === 'form' && (
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 border-emerald-400 text-emerald-300"
            >
              <Edit className="w-4 h-4" />
              <span>{editingUserId ? 'تعديل بيانات المستخدم' : 'إنشاء حساب جديد'}</span>
            </button>
          )}
        </div>

        {/* Notification Toast Alert */}
        {feedbackMsg && (
          <div className={`px-5 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-300 border-b border-rose-500/30'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: USERS DIRECTORY */}
          {activeTab === 'users_list' && (
            <div className="space-y-4">
              {/* Filter & Search Bar with Professional Dropdown Menus */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="بحث سريع بالاسم، اسم الدخول، البريد، أو الفرع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl pr-9 pl-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns Container */}
                <div className="flex items-center gap-2">
                  {/* ROLE FILTER DROPDOWN MENU (درب منيو الأدوار) */}
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoleFilterOpen(prev => !prev);
                        setIsStatusFilterOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 hover:border-amber-400/40 text-xs font-bold text-slate-200 cursor-pointer transition-all"
                    >
                      <Filter className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {roleFilter === 'all' ? 'جميع الأدوار' : ROLE_DEFINITIONS[roleFilter]?.badgeAr}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isRoleFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isRoleFilterOpen && (
                      <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-slate-900/98 backdrop-blur-xl border border-white/15 shadow-2xl p-1.5 z-40 text-right animate-in fade-in duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            setRoleFilter('all');
                            setIsRoleFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            roleFilter === 'all' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>جميع الأدوار</span>
                          {roleFilter === 'all' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        {(['admin', 'fleet_manager', 'branch_manager', 'viewer'] as UserRole[]).map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setRoleFilter(r);
                              setIsRoleFilterOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              roleFilter === r ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>{ROLE_DEFINITIONS[r].badgeAr}</span>
                            {roleFilter === r && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* STATUS FILTER DROPDOWN MENU (درب منيو الحالة) */}
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      onClick={() => {
                        setIsStatusFilterOpen(prev => !prev);
                        setIsRoleFilterOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 hover:border-amber-400/40 text-xs font-bold text-slate-200 cursor-pointer transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {statusFilter === 'all' ? 'جميع الحالات' : statusFilter === 'active' ? 'نشط فقط' : 'معلق فقط'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isStatusFilterOpen && (
                      <div className="absolute left-0 mt-1.5 w-44 rounded-xl bg-slate-900/98 backdrop-blur-xl border border-white/15 shadow-2xl p-1.5 z-40 text-right animate-in fade-in duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('all');
                            setIsStatusFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            statusFilter === 'all' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>الكل</span>
                          {statusFilter === 'all' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('active');
                            setIsStatusFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            statusFilter === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>نشط فقط</span>
                          </span>
                          {statusFilter === 'active' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('suspended');
                            setIsStatusFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            statusFilter === 'suspended' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span>معلق فقط</span>
                          </span>
                          {statusFilter === 'suspended' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* MASTER PASSWORD TOGGLE BUTTON - EXCLUSIVE TO ADMIN */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={toggleShowAll}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        showAllPasswords
                          ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10 hover:border-amber-400/40'
                      }`}
                      title="إظهار أو إخفاء كلمات المرور لجميع المستخدمين في الجدول"
                    >
                      {showAllPasswords ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="hidden sm:inline">{showAllPasswords ? 'إخفاء كلمات المرور' : 'إظهار كل كلمات المرور'}</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black">
                        خاص بالمدير 👑
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* ADMIN CREDENTIALS NOTICE */}
              {isAdmin && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-200">
                          صلاحية إدارة كلمات المرور الحصرية (Security Credentials)
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                          أنت فقط المخول 👑
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        بصفتك المدير الوحيد للنظام، يمكنك من هنا الاطلاع على كلمة مرور أي مستخدم (زر العين 👁️)، نسخها للحافظة (📋)، أو تعديلها فورياً (🔑).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Table / Directory */}
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl overflow-visible min-h-[380px] pb-28 relative">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-white/10 font-bold rounded-t-2xl">
                      <th className="py-3 px-4">المستخدم والبريد</th>
                      <th className="py-3 px-4">اسم الدخول (Username)</th>
                      <th className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>كلمة المرور (خاص بالمدير 🔒)</span>
                        </div>
                      </th>
                      <th className="py-3 px-4">الدور والصلاحية</th>
                      <th className="py-3 px-4">الفرع المخصص</th>
                      <th className="py-3 px-4 text-center">الحالة</th>
                      <th className="py-3 px-4 text-center">آخر دخول</th>
                      <th className="py-3 px-4 text-center">خيارات وتحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                          <p className="text-sm font-bold">لا يوجد مستخدمين مطابقين للبحث أو الفلتر المحدد</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = u.id === currentUser.id;
                        const roleMeta = ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.viewer;
                        const isActionOpen = openActionUserId === u.id;

                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                            {/* User Name & Email */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="bg-amber-500/25 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded border border-amber-500/40">
                                    أنت (الحساب الحالي)
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                <span>{u.email}</span>
                                {u.phone && <span>• {u.phone}</span>}
                              </div>
                            </td>

                            {/* Username */}
                            <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                              @{u.username}
                            </td>

                            {/* Password Column - Exclusive to Admin */}
                            <td className="py-3.5 px-4 text-center">
                              {isAdmin ? (
                                <div className="inline-flex items-center gap-1 p-1 px-2 rounded-xl bg-slate-950/80 border border-white/10 group-hover:border-amber-500/40 transition-all shadow-sm">
                                  {/* Password text or dots */}
                                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                                    showAllPasswords || revealedPasswords[u.id]
                                      ? 'text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 tracking-normal select-all shadow-inner'
                                      : 'text-slate-400 font-bold tracking-widest'
                                  }`}>
                                    {showAllPasswords || revealedPasswords[u.id]
                                      ? (u.password || '123456')
                                      : '••••••••'}
                                  </span>

                                  {/* Eye button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleRevealPassword(u.id)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                    title={revealedPasswords[u.id] || showAllPasswords ? 'إخفاء كلمة المرور' : 'الاطلاع على كلمة المرور'}
                                  >
                                    {revealedPasswords[u.id] || showAllPasswords ? (
                                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  {/* Copy button */}
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPassword(u.password || '123456', u.username)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="نسخ كلمة المرور"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400" />
                                  </button>

                                  {/* Direct Change Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPasswordResetUserId(u.id);
                                      setNewPasswordInput('');
                                      setShowCurrentPassword(false);
                                    }}
                                    className="px-2 py-0.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/40 text-blue-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                                    title="تغيير كلمة المرور لهذا المستخدم"
                                  >
                                    <KeyRound className="w-3 h-3 text-blue-300" />
                                    <span>تغيير</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-600 text-[10px] font-bold">محمية</span>
                              )}
                            </td>

                            {/* Role Badge */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border ${roleMeta.badgeClass}`}>
                                {u.role === 'admin' && <Crown className="w-3 h-3 text-amber-400" />}
                                {u.role === 'fleet_manager' && <Truck className="w-3 h-3 text-emerald-400" />}
                                {u.role === 'branch_manager' && <Building2 className="w-3 h-3 text-blue-400" />}
                                {u.role === 'viewer' && <Eye className="w-3 h-3 text-slate-400" />}
                                <span>{roleMeta.badgeAr}</span>
                              </span>
                            </td>

                            {/* Branch */}
                            <td className="py-3.5 px-4 text-slate-300">
                              {u.assignedBranch ? (
                                <span className="flex items-center gap-1.5 text-[11px] text-blue-300 font-semibold">
                                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                  <span>{u.assignedBranch}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">كافة الفروع (مركزي)</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u.id)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border cursor-pointer transition-all ${
                                  u.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                }`}
                                title={isSelf ? 'لا يمكن تعليق حسابك الحالي' : 'انقر لتغيير حالة الحساب'}
                              >
                                {u.status === 'active' ? 'نشط ✓' : 'معلق ✗'}
                              </button>
                            </td>

                            {/* Last Login */}
                            <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-400">
                              {u.lastLogin || 'لم يسجل دخول'}
                            </td>

                            {/* ROW ACTIONS DROPDOWN MENU (درب منيو العمليات الخاص بالمستخدم) */}
                            <td className="py-3.5 px-4 text-center relative dropdown-container">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                {/* Direct Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(u)}
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                                  title="تعديل بيانات وصلاحيات المستخدم"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Direct Delete Button (visible directly in row so admin can delete in 1 click) */}
                                {!isSelf && u.username.toLowerCase() !== 'admin' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteUser(u.id, u.name, u.username);
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/35 transition-all cursor-pointer"
                                    title="حذف المستخدم نهائياً"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionUserId(isActionOpen ? null : u.id);
                                  }}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isActionOpen
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border-white/10'
                                  }`}
                                  title="المزيد من الخيارات"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>

                              {/* FLOATING ACTION DROPDOWN POPOVER */}
                              {isActionOpen && (
                                <div 
                                  className="absolute left-2 sm:left-4 top-11 w-64 rounded-2xl bg-[#090e1a] backdrop-blur-2xl border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-2 z-[999] text-right animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10"
                                >
                                  {/* User Meta Card Header */}
                                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 mb-2">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="text-xs font-black text-amber-400 block truncate">{u.name}</span>
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${roleMeta.badgeClass}`}>
                                        {roleMeta.badgeAr}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                      <span>@{u.username}</span>
                                      <span className={u.status === 'active' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                        {u.status === 'active' ? '● نشط' : '● معلق'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    {/* 1. Edit Action */}
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(u)}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-amber-500/15 hover:text-amber-300 transition-colors cursor-pointer"
                                    >
                                      <Edit className="w-4 h-4 text-amber-400 shrink-0" />
                                      <span>تعديل البيانات والصلاحيات</span>
                                    </button>

                                    {/* 2. Quick Password Reset */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionUserId(null);
                                        setPasswordResetUserId(u.id);
                                        setNewPasswordInput('');
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-blue-500/15 hover:text-blue-300 transition-colors cursor-pointer"
                                    >
                                      <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />
                                      <span>إعادة تعيين كلمة المرور</span>
                                    </button>

                                    {/* 3. Review in Permissions Matrix */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionUserId(null);
                                        setActiveTab('permissions_matrix');
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors cursor-pointer"
                                    >
                                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                      <span>عرض مصفوفة الصلاحيات</span>
                                    </button>

                                    {/* 4. Toggle Status */}
                                    {!isSelf ? (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatus(u.id)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                                      >
                                        {u.status === 'active' ? (
                                          <>
                                            <UserX className="w-4 h-4 text-rose-400 shrink-0" />
                                            <span className="text-rose-300">تعليق الحساب مؤقتاً</span>
                                          </>
                                        ) : (
                                          <>
                                            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="text-emerald-300">تنشيط الحساب الآن</span>
                                          </>
                                        )}
                                      </button>
                                    ) : (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20">
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        <span>حسابك الحالي محمي من التعليق</span>
                                      </div>
                                    )}

                                    {/* 5. Delete User */}
                                    {!isSelf && u.username.toLowerCase() !== 'admin' ? (
                                      <div className="pt-1 mt-1 border-t border-white/10">
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteUser(u.id, u.name, u.username)}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                                          <span>حذف المستخدم نهائياً</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="pt-1 mt-1 border-t border-white/10">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] text-slate-400 bg-white/[0.02]">
                                          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                          <span>حسابك الرئيسي محمي من الحذف</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED PERMISSIONS MATRIX (مصفوفة الصلاحيات والحقوق) */}
          {activeTab === 'permissions_matrix' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  توضح هذه المصفوفة الصلاحيات الافتراضية لكل دور في المنظومة. يمكن لمدير النظام منح أو حجب صلاحيات استثنائية لأي مستخدم محدد عبر نموذج التعديل.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-300 border-b border-white/10 font-bold">
                      <th className="py-3.5 px-4 w-1/3">الصلاحية / الوظيفة التشغيلية</th>
                      <th className="py-3.5 px-3 text-center bg-amber-500/10 text-amber-300 border-r border-l border-white/5">
                        <div className="flex flex-col items-center">
                          <Crown className="w-4 h-4 mb-0.5" />
                          <span>مدير عام النظام</span>
                          <span className="text-[9px] font-normal text-amber-400/80">(Master Admin)</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-3 text-center bg-emerald-500/10 text-emerald-300 border-l border-white/5">
                        <div className="flex flex-col items-center">
                          <Truck className="w-4 h-4 mb-0.5" />
                          <span>مدير الأسطول</span>
                          <span className="text-[9px] font-normal text-emerald-400/80">(Fleet Manager)</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-3 text-center bg-blue-500/10 text-blue-300 border-l border-white/5">
                        <div className="flex flex-col items-center">
                          <Building2 className="w-4 h-4 mb-0.5" />
                          <span>مدير فرع</span>
                          <span className="text-[9px] font-normal text-blue-400/80">(Branch Manager)</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-3 text-center bg-slate-800/40 text-slate-300">
                        <div className="flex flex-col items-center">
                          <Eye className="w-4 h-4 mb-0.5" />
                          <span>مشاهد ومدقق</span>
                          <span className="text-[9px] font-normal text-slate-400">(Auditor/Viewer)</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {PERMISSION_DEFINITIONS.map((perm) => (
                      <tr key={perm.key} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{perm.labelAr}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{perm.descriptionAr}</div>
                        </td>

                        {/* Admin */}
                        <td className="py-3.5 px-3 text-center bg-amber-500/5 border-r border-l border-white/5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400">
                            <Check className="w-4 h-4" />
                            <span>متاح</span>
                          </span>
                        </td>

                        {/* Fleet Manager */}
                        <td className="py-3.5 px-3 text-center bg-emerald-500/5 border-l border-white/5">
                          {ROLE_DEFAULT_PERMISSIONS.fleet_manager[perm.key] ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400">
                              <Check className="w-4 h-4" />
                              <span>متاح</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-600 font-bold">✕ غير مصرح</span>
                          )}
                        </td>

                        {/* Branch Manager */}
                        <td className="py-3.5 px-3 text-center bg-blue-500/5 border-l border-white/5">
                          {ROLE_DEFAULT_PERMISSIONS.branch_manager[perm.key] ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-400">
                              <Check className="w-4 h-4" />
                              <span>متاح للفرع</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-600 font-bold">✕ غير مصرح</span>
                          )}
                        </td>

                        {/* Viewer */}
                        <td className="py-3.5 px-3 text-center bg-slate-800/20">
                          {ROLE_DEFAULT_PERMISSIONS.viewer[perm.key] ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-300">
                              <Check className="w-4 h-4" />
                              <span>قراءة فقط</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-600 font-bold">✕ غير مصرح</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RICH USER FORM (إضافة وتعديل متطور) */}
          {activeTab === 'form' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                    {editingUserId ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {editingUserId ? 'تعديل بيانات وحقوق المستخدم' : 'إنشاء وتفعيل حساب مستخدم جديد'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      حدد هوية المستخدم، دوره القيادي، الفرع التابع له، وكلمة المرور
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  إلغاء والعودة للقائمة
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-200 font-bold block">
                      الاسم الكامل للمستخدم *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="مثال: م. أحمد عثمان — مشرف الحركة"
                      className="w-full bg-slate-800 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-200 font-bold block">
                      اسم الدخول (Username) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="admin أو fleet.ops..."
                      className="w-full bg-slate-800 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Password with generator & show/hide */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{editingUserId ? 'كلمة المرور الحالية / الجديدة (خاص بالمدير 🔒)' : 'كلمة المرور (Password) *'}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {editingUserId && formPassword && (
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(formPassword, formUsername)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>نسخ</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>توليد كلمة سر قوية</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="كلمة المرور..."
                        className="w-full bg-slate-800 border border-white/15 rounded-xl pr-3.5 pl-10 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {editingUserId && (
                      <p className="text-[10px] text-amber-300/80">
                        * بصفتك المدير، تظهر لك كلمة مرور المستخدم الحالية أعلاه ويمكنك استبدالها مباشرة بكتابة كلمة سر جديدة.
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-200 font-bold block">
                      البريد الإلكتروني الرسمي
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="name@seoudi.com"
                      className="w-full bg-slate-800 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* CUSTOM ROLE DROPDOWN MENU (درب منيو الأدوار الاحترافي) */}
                  <div className="space-y-1.5 relative dropdown-container">
                    <label className="text-xs text-slate-200 font-bold block">
                      الدور القيادي والصلاحيات *
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setIsFormRoleDropdownOpen(prev => !prev);
                        setIsFormBranchDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between bg-slate-800 border border-white/15 hover:border-amber-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {formRole === 'admin' && <Crown className="w-4 h-4 text-amber-400" />}
                        {formRole === 'fleet_manager' && <Truck className="w-4 h-4 text-emerald-400" />}
                        {formRole === 'branch_manager' && <Building2 className="w-4 h-4 text-blue-400" />}
                        {formRole === 'viewer' && <Eye className="w-4 h-4 text-slate-400" />}
                        <span className="font-bold">{ROLE_DEFINITIONS[formRole].titleAr}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isFormRoleDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Form Role Dropdown Menu */}
                    {isFormRoleDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-full rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-amber-500/30 shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in duration-100 ring-1 ring-white/10 space-y-1">
                        {(['admin', 'fleet_manager', 'branch_manager', 'viewer'] as UserRole[]).map(roleKey => {
                          const meta = ROLE_DEFINITIONS[roleKey];
                          const isSelected = formRole === roleKey;
                          return (
                            <button
                              key={roleKey}
                              type="button"
                              onClick={() => handleRoleChangeInForm(roleKey)}
                              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-right transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-amber-500/20 border border-amber-400/40 text-amber-200' 
                                  : 'hover:bg-slate-800 border border-transparent text-slate-300'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                {roleKey === 'admin' && <Crown className="w-4 h-4 text-amber-400" />}
                                {roleKey === 'fleet_manager' && <Truck className="w-4 h-4 text-emerald-400" />}
                                {roleKey === 'branch_manager' && <Building2 className="w-4 h-4 text-blue-400" />}
                                {roleKey === 'viewer' && <Eye className="w-4 h-4 text-slate-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black">{meta.titleAr}</span>
                                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">{meta.descriptionAr}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* CUSTOM BRANCH DROPDOWN MENU (درب منيو الفروع) */}
                  {formRole === 'branch_manager' && (
                    <div className="space-y-1.5 relative dropdown-container">
                      <label className="text-xs text-slate-200 font-bold block">
                        الفرع المخصص لإدارته *
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setIsFormBranchDropdownOpen(prev => !prev);
                          setIsFormRoleDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between bg-slate-800 border border-white/15 hover:border-amber-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          <span className="font-bold">{formBranch || 'اختر الفرع المخصص...'}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isFormBranchDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Branch Dropdown with Search */}
                      {isFormBranchDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-full rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-amber-500/30 shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in duration-100 ring-1 ring-white/10 space-y-2">
                          <div className="p-1">
                            <input
                              type="text"
                              placeholder="بحث في فروع سعودي..."
                              value={branchSearch}
                              onChange={(e) => setBranchSearch(e.target.value)}
                              className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-0.5">
                            {filteredBranchesList.map(b => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => {
                                  setFormBranch(b);
                                  setIsFormBranchDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  formBranch === b ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <span>{b}</span>
                                {formBranch === b && <Check className="w-3.5 h-3.5 text-blue-400" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-200 font-bold block">
                      رقم الهاتف للتواصل
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0100xxxxxxx"
                      className="w-full bg-slate-800 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Status Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-200 font-bold block">
                      حالة تفعيل الحساب
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormStatus('active')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          formStatus === 'active'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                            : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        نشط ومفعل (Active) ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStatus('suspended')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          formStatus === 'suspended'
                            ? 'bg-rose-500 text-white border-rose-400 font-black shadow-md'
                            : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        معلق وموقوف (Suspended) ✗
                      </button>
                    </div>
                  </div>
                </div>

                {/* GRANULAR PERMISSIONS OVERRIDE (تخصيص صلاحيات تفصيلية) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-white">
                          تخصيص صلاحيات استثنائية (Custom Permissions Override)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        يمكنك منح أو حجب صلاحيات محددة لهذا الحساب بمعزل عن الدور الافتراضي
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEnableCustomPermissions(p => !p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        enableCustomPermissions 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50' 
                          : 'bg-slate-800 text-slate-400 border-white/10'
                      }`}
                    >
                      {enableCustomPermissions ? 'تخصيص يدوي مفعّل ✓' : 'استخدام صلاحيات الدور التلقائية'}
                    </button>
                  </div>

                  {enableCustomPermissions && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 animate-in fade-in duration-150">
                      {PERMISSION_DEFINITIONS.map(perm => {
                        const isGranted = !!customPermissions[perm.key];
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isGranted 
                                ? 'bg-amber-500/10 border-amber-400/40 text-amber-100' 
                                : 'bg-slate-900 border-white/5 text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={(e) => {
                                setCustomPermissions(prev => ({
                                  ...prev,
                                  [perm.key]: e.target.checked,
                                }));
                              }}
                              className="mt-0.5 rounded border-white/20 text-amber-500 focus:ring-amber-400"
                            />
                            <div>
                              <span className="text-xs font-bold block">{perm.labelAr}</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">{perm.descriptionAr}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    إلغاء والعودة
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-950/60 cursor-pointer active:scale-95 transition-all"
                  >
                    {editingUserId ? 'حفظ التعديلات والصلاحيات' : 'تفعيل وإنشاء الحساب الآن'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* QUICK PASSWORD RESET & VIEW MODAL - EXCLUSIVE TO ADMIN */}
        {passwordResetUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-100">
            <div 
              className="w-full max-w-lg rounded-2xl bg-[#090e1a] border border-amber-500/50 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-right ring-1 ring-amber-400/30"
              style={{ direction: 'rtl' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-black text-white">إدارة وتعديل كلمة المرور</h4>
                      <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                        خاص بالمدير 👑
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      للمستخدم: <strong className="text-white">{users.find(u => u.id === passwordResetUserId)?.name}</strong> (@{users.find(u => u.id === passwordResetUserId)?.username})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPasswordResetUserId(null);
                    setShowResetPassword(false);
                    setShowCurrentPassword(false);
                    setNewPasswordInput('');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* USER META CARD & CURRENT PASSWORD BOX */}
              {(() => {
                const target = users.find(u => u.id === passwordResetUserId);
                const currentPass = target?.password || '123456';
                return (
                  <div className="space-y-4">
                    {/* Current Registered Password - Fully Viewable by Admin */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>كلمة المرور الحالية المسجلة في النظام:</span>
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                          صلاحية الاطلاع مفعلة لك 👁️
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/90 border border-white/10">
                        <span className="font-mono text-sm font-bold text-white px-2 select-all">
                          {showCurrentPassword ? currentPass : '••••••••••••'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                            title={showCurrentPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                          >
                            {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{showCurrentPassword ? 'إخفاء' : 'عرض الباسورد'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(currentPass, target?.username || '')}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="نسخ الباسورد للحافظة"
                          >
                            <Copy className="w-3.5 h-3.5 text-emerald-400" />
                            <span>نسخ</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* NEW PASSWORD FORM */}
                    <form onSubmit={handleExecutePasswordReset} className="space-y-4 pt-1">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                            <span>تعيين كلمة المرور الجديدة (تغيير فوري):</span>
                          </label>
                          <button
                            type="button"
                            onClick={generateRandomPasswordForReset}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>توليد عشوائي قوي ✨</span>
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type={showResetPassword ? 'text' : 'password'}
                            required
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="اكتب كلمة المرور الجديدة هنا..."
                            className="w-full bg-slate-900 border border-white/15 rounded-xl pr-3.5 pl-10 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="absolute left-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                            tabIndex={-1}
                            title={showResetPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                          >
                            {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400">اقتراحات سريعة:</span>
                          {['Seoudi@2025', 'Fleet#1234', 'SuperCarry@2025', 'Pass#2025'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setNewPasswordInput(preset);
                                setShowResetPassword(true);
                              }}
                              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-amber-500/20 text-[10px] font-mono text-slate-300 hover:text-amber-300 border border-white/10 transition-colors cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>بصفتك المدير الوحيد للنظام، سيتم تحديث كلمة المرور فورياً وسيتمكن المستخدم من تسجيل الدخول بها مباشرة.</span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordResetUserId(null);
                            setShowResetPassword(false);
                            setShowCurrentPassword(false);
                            setNewPasswordInput('');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/60 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>تأكيد وحفظ كلمة المرور الجديدة</span>
                        </button>
                      </div>
                    </form>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* CUSTOM DELETE USER CONFIRMATION MODAL */}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-100">
            <div
              className="w-full max-w-md rounded-2xl bg-[#090e1a] border border-rose-500/50 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-right ring-1 ring-rose-500/30 space-y-4"
              style={{ direction: 'rtl' }}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">تأكيد حذف حساب المستخدم</h4>
                  <p className="text-xs text-rose-300 mt-0.5">سيتم حذف الحساب نهائياً من الموقع ومن سحابة Supabase</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-slate-200 leading-relaxed">
                هل أنت متأكد من حذف حساب المستخدم{' '}
                <strong className="text-amber-300 font-black">"{userToDelete.name}"</strong>{' '}
                <span className="font-mono text-rose-300">(@{userToDelete.username})</span> نهائياً من المنظومة؟
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer"
                >
                  تراجع وإلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUserExecution}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-black shadow-lg shadow-rose-950/60 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>نعم، احذف الحساب نهائياً</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
