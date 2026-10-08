import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  ShoppingBag, 
  Users, 
  LogOut, 
  Globe, 
  ShieldCheck, 
  Crown, 
  ChevronDown, 
  Check, 
  Sliders, 
  FileText, 
  BarChart3, 
  Settings, 
  Building2, 
  Key, 
  Sparkles,
  ArrowRightLeft,
  Truck,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  Database
} from 'lucide-react';
import { Language } from '../utils/i18n';
import { UserRole, SystemUser } from '../types';
import { ROLE_DEFINITIONS } from '../utils/permissionUtils';

interface HeaderProps {
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  onToggleLang?: () => void;
  currentRole?: UserRole;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onChangeRole?: (role: UserRole) => void;
  reportDate?: string;
  lastUpdate?: string;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  totalFleet?: number;
  currentUser?: SystemUser | null;
  onOpenUserManagement?: () => void;
  onOpenLandingPage?: () => void;
  onLogout?: () => void;
  onSelectTab?: (tab: any) => void;
  usersCount?: number;
  onOpenSupabase?: () => void;
  users?: SystemUser[];
  onSwitchUser?: (user: SystemUser) => void;
  cloudStatus?: 'connected' | 'syncing' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdate = '10:30 ص',
  onRefreshData = () => {},
  isRefreshing = false,
  totalFleet = 105,
  currentUser,
  userRole,
  currentRole,
  onChangeRole,
  onOpenUserManagement,
  onOpenLandingPage,
  onLogout,
  onSelectTab,
  usersCount,
  onOpenSupabase,
  users = [],
  onSwitchUser,
  cloudStatus = 'connected',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [roleSimulatorRole, setRoleSimulatorRole] = useState<UserRole>(userRole || currentRole || currentUser?.role || 'admin');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userRole) setRoleSimulatorRole(userRole);
    else if (currentRole) setRoleSimulatorRole(currentRole);
    else if (currentUser?.role) setRoleSimulatorRole(currentUser.role);
  }, [userRole, currentRole, currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const activeRole = userRole || currentRole || currentUser?.role || 'viewer';
  const roleMeta = ROLE_DEFINITIONS[activeRole] || ROLE_DEFINITIONS.viewer;

  const handleRoleSimulation = (role: UserRole) => {
    setRoleSimulatorRole(role);
    if (onChangeRole) {
      onChangeRole(role);
    }
  };

  return (
    <header className="relative w-full rounded-2xl overflow-visible border border-white/10 bg-[#090e1a]/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] mb-4 z-50">
      {/* Seoudi Brand Ambient Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 bg-gradient-to-r from-emerald-600/15 via-amber-500/15 to-emerald-700/15 blur-3xl pointer-events-none" />

      {/* Main Bar */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-3.5 gap-3.5">
        {/* Right in RTL: Seoudi Supermarket Brand Identity */}
        <div className="flex items-center gap-3.5">
          {/* Seoudi Supermarket Emblem (Green & Gold luxury badge) */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-[#0e3b23] via-[#0b2416] to-[#06150c] shadow-[0_0_22px_rgba(16,185,129,0.25)] flex-shrink-0">
            <div className="flex flex-col items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <div className="w-6 h-0.5 bg-amber-400 rounded-full mt-0.5" />
            </div>
            <div className="absolute -bottom-0.5 w-7 h-1 bg-emerald-400 rounded-full blur-[2px]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                سعودي سوبر ماركت
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-400 font-mono tracking-wider">
                SEOUDI
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span>🇪🇬</span>
                <span>فروع مصر</span>
              </span>
            </div>
            <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>منظومة إدارة وتتبع رخص أسطول التوصيل المنزلي</span>
              <span className="text-[10px] text-amber-400/90 font-medium">• رخص تسيير المرور وتصاريح الإعلانات</span>
            </p>
          </div>
        </div>

        {/* Left in RTL: User Badge, Dropdown Menu & Quick Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Landing Page Button */}
          {onOpenLandingPage && (
            <button
              onClick={onOpenLandingPage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
              title="عرض صفحة الهبوط التعريفية"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">صفحة الهبوط</span>
            </button>
          )}

          {/* Quick Admin User Management Button - Exclusive to Admin */}
          {activeRole === 'admin' && currentUser?.role === 'admin' && onOpenUserManagement && (
            <button
              onClick={onOpenUserManagement}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-600/25 hover:from-amber-500/35 hover:to-amber-600/35 text-amber-300 text-xs font-bold border border-amber-500/50 shadow-md shadow-amber-950/40 transition-all cursor-pointer ring-1 ring-amber-400/30 active:scale-95"
              title="لوحة تحكم المدير العام: إدارة حسابات المستخدمين والصلاحيات"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/30 flex items-center justify-center text-amber-300">
                <Crown className="w-3.5 h-3.5" />
              </div>
              <span className="flex items-center gap-1.5">
                <span>المستخدمين والصلاحيات</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black">
                  خاص بالمدير 👑
                </span>
              </span>
            </button>
          )}

          {/* ULTRA-PROFESSIONAL USER PROFILE & ADMIN DROPDOWN MENU */}
          {currentUser && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isDropdownOpen
                    ? 'bg-slate-800/95 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                    : 'bg-slate-900/90 border-white/10 hover:border-amber-400/40 hover:bg-slate-800/80'
                }`}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                title={`${currentUser.name} | ${currentUser.email || 'Walid.Adel@Seoudisupermarket.com'} | واتساب: ${currentUser.phone || '01144542800'}`}
              >
                {/* User Avatar with status dot */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/30 via-emerald-600/20 to-slate-800 border border-amber-400/50 flex items-center justify-center text-amber-300 text-xs font-black font-mono">
                    {activeRole === 'admin' ? '👑' : activeRole === 'viewer' ? '👁️' : currentUser.name.slice(0, 1)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#090e1a] rounded-full" />
                </div>

                {/* Text meta */}
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-amber-400">
                      {roleMeta.badgeAr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300 mt-0.5">
                    <span className="text-cyan-300 flex items-center gap-1" title="البريد الإلكتروني الرسمي">
                      <Mail className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                      <span>{currentUser.email || 'Walid.Adel@Seoudisupermarket.com'}</span>
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 hidden sm:flex" title="رقم الواتساب المباشر">
                      <MessageSquare className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      <span>{currentUser.phone || '01144542800'}</span>
                    </span>
                  </div>
                </div>

                {/* Animated Chevron */}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-amber-400' : ''
                }`} />
              </button>

              {/* FLOATING LUXURY DROPDOWN MENU (قائمة منسدلة احترافية جداً) */}
              {isDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-80 rounded-2xl bg-[#090e1a]/98 backdrop-blur-2xl border border-amber-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-3 text-right z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-white/10"
                  style={{ direction: 'rtl' }}
                >
                  {/* Dropdown Header Card */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900/90 border border-white/10 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-emerald-500/10 border border-amber-400/50 flex items-center justify-center text-amber-300 text-lg font-bold shadow-inner">
                        {currentUser.role === 'admin' ? '👑' : '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-white truncate">{currentUser.name}</h4>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            نشط
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                          @{currentUser.username} • {roleMeta.titleAr}
                        </p>
                      </div>
                    </div>

                    {/* DIRECT WHATSAPP & WORK EMAIL EXECUTIVE CARDS */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                      {/* Email Card with click to mailto */}
                      <a
                        href={`mailto:${currentUser.email || 'Walid.Adel@Seoudisupermarket.com'}`}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-200 transition-all group"
                        title="إرسال بريد إلكتروني رسمي"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <div className="text-right truncate">
                            <span className="text-[9px] text-slate-400 block leading-tight">البريد الإلكتروني المعتمد</span>
                            <span className="text-[11px] font-mono font-bold text-cyan-300 group-hover:underline truncate block">
                              {currentUser.email || 'Walid.Adel@Seoudisupermarket.com'}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-cyan-500 group-hover:text-cyan-300 shrink-0" />
                      </a>

                      {/* WhatsApp Card with direct wa.me link */}
                      <a
                        href={`https://wa.me/201144542800?text=${encodeURIComponent('مرحباً أستاذ وليد عادل، بخصوص منظومة أسطول سيارات سعودي سوبر ماركت...')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400/50 text-emerald-200 transition-all group shadow-sm shadow-emerald-950/40"
                        title="محادثة واتساب فورية مباشرة"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div className="text-right truncate">
                            <span className="text-[9px] text-emerald-400/80 font-bold block leading-tight flex items-center gap-1">
                              <span>واتساب مباشر (WhatsApp)</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            </span>
                            <span className="text-[11px] font-mono font-black text-emerald-300 tracking-wider block">
                              {currentUser.phone || '01144542800'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-2 py-0.5 rounded shadow-sm shrink-0">
                          محادثة 💬
                        </span>
                      </a>
                    </div>

                    {currentUser.assignedBranch && (
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-blue-300">
                        <Building2 className="w-3 h-3 text-blue-400" />
                        <span>الفرع المخصص: <strong>{currentUser.assignedBranch}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* MASTER ADMIN EXCLUSIVE ACTION ITEM */}
                  {currentUser.role === 'admin' && onOpenUserManagement && (
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenUserManagement();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-emerald-500/10 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/50 text-right group transition-all cursor-pointer shadow-md shadow-amber-950/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                              <span>إدارة المستخدمين والصلاحيات</span>
                              <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1 rounded">خاص</span>
                            </div>
                            <span className="text-[10px] text-slate-400">إضافة مستخدمين وتعديل الأدوار ومصفوفة الصلاحيات</span>
                          </div>
                        </div>
                        <span className="text-xs text-amber-400">←</span>
                      </button>
                    </div>
                  )}

                  {/* FAST ROLE SIMULATOR (محاكي وتجربة الصلاحيات) - For Testing & Admin Convenience */}
                  {currentUser.role === 'admin' && onChangeRole && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-amber-400" />
                          <span>معاينة النظام بدور آخر (محاكي الصلاحيات):</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRoleSimulation('admin')}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            roleSimulatorRole === 'admin'
                              ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-black'
                              : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>مدير عام</span>
                          {roleSimulatorRole === 'admin' && <Check className="w-2.5 h-2.5 mr-auto text-amber-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRoleSimulation('fleet_manager')}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            roleSimulatorRole === 'fleet_manager'
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-black'
                              : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Truck className="w-3 h-3 text-emerald-400" />
                          <span>مدير أسطول</span>
                          {roleSimulatorRole === 'fleet_manager' && <Check className="w-2.5 h-2.5 mr-auto text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRoleSimulation('branch_manager')}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            roleSimulatorRole === 'branch_manager'
                              ? 'bg-blue-500/25 border-blue-400 text-blue-300 font-black'
                              : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Building2 className="w-3 h-3 text-blue-400" />
                          <span>مدير فرع</span>
                          {roleSimulatorRole === 'branch_manager' && <Check className="w-2.5 h-2.5 mr-auto text-blue-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRoleSimulation('viewer')}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            roleSimulatorRole === 'viewer'
                              ? 'bg-slate-600/30 border-slate-400 text-slate-200 font-black'
                              : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3 text-slate-400" />
                          <span>مشاهد ومدقق</span>
                          {roleSimulatorRole === 'viewer' && <Check className="w-2.5 h-2.5 mr-auto text-slate-300" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* QUICK ACCOUNT SWITCHER (تبديل سريع بين حسابات المستخدمين) */}
                  {onSwitchUser && users.length > 1 && (
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 mb-2">
                      <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" />
                        <span>التبديل المباشر لحساب مستخدم آخر:</span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {users.filter(u => u.status === 'active').map(u => {
                          const isCurrent = u.id === currentUser.id && activeRole === u.role;
                          const uMeta = ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.viewer;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setIsDropdownOpen(false);
                                onSwitchUser(u);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-bold'
                                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="truncate">{u.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono">(@{u.username})</span>
                              </div>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-300 shrink-0">
                                {uMeta.badgeAr}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* QUICK SHORTCUT LINKS */}
                  <div className="space-y-0.5 pt-1 border-t border-white/10">
                    {onSelectTab && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onSelectTab('reports');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>مركز التقارير وتصدير إكسل</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">XLSX</span>
                        </button>

                        {activeRole === 'admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onSelectTab('settings');
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Settings className="w-3.5 h-3.5 text-slate-400" />
                              <span>إعدادات النظام والمهل الرسمية</span>
                            </span>
                            <span className="text-[10px] text-slate-500">30 يوم</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* LOGOUT BUTTON */}
                  {onLogout && (
                    <div className="pt-2 mt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                          <span>تسجيل الخروج من الحساب</span>
                        </span>
                        <span className="text-[10px] text-rose-400/80">خروج آمن</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Supabase Cloud Database Button - Exclusive to Master Admin (Walid Adel) */}
          {activeRole === 'admin' && currentUser?.role === 'admin' && (currentUser?.username?.toLowerCase() === 'admin' || currentUser?.id === 'usr-1') && onOpenSupabase && (
            <button
              onClick={onOpenSupabase}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm group ${
                cloudStatus === 'syncing'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : cloudStatus === 'error'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
              }`}
              title="خاص بالمدير العام فقط: حالة وإعدادات الربط السحابي مع Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{cloudStatus === 'syncing' ? 'جارٍ الحفظ بـ Supabase...' : 'Supabase متصل'}</span>
              <span className={`w-2 h-2 rounded-full ${
                cloudStatus === 'syncing' ? 'bg-amber-400 animate-ping' : cloudStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
              }`} />
            </button>
          )}

          {/* Direct Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-all cursor-pointer"
              title="تسجيل الخروج والعودة لصفحة الهبوط"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Live Indicator Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0d1424] border border-white/10 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-white font-mono">{lastUpdate}</span>
            <button 
              onClick={onRefreshData}
              disabled={isRefreshing}
              title="تحديث البيانات"
              className="p-0.5 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#d9a441]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
