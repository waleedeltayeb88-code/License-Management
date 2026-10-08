import React from 'react';
import { 
  Gauge, 
  Car, 
  FileText, 
  BarChart3, 
  ArrowLeftRight, 
  Settings,
  AlertCircle,
  Users,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { Language } from '../utils/i18n';

export type BottomNavTab = 
  | 'dashboard' 
  | 'vehicles_list' 
  | 'all_licenses' 
  | 'reports' 
  | 'transfers' 
  | 'settings'
  | 'users_management';

export interface NavCounts {
  totalVehicles?: number;
  expiringLicenses?: number;
  transfersCount?: number;
  thresholdDays?: number;
}

interface BottomNavProps {
  lang: Language;
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  counts?: NavCounts;
  isAdmin?: boolean;
  canManageSettings?: boolean;
  canExportReports?: boolean;
  onOpenUserManagement?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  lang,
  activeTab,
  onSelectTab,
  counts = {} as NavCounts,
  isAdmin = false,
  canManageSettings = false,
  canExportReports = true,
  onOpenUserManagement,
}) => {
  const isAr = lang === 'ar';

  const allNavItems = [
    {
      id: 'dashboard' as BottomNavTab,
      title: isAr ? 'لوحة التحكم' : 'Dashboard',
      subtitle: isAr ? 'المؤشرات والتحليلات' : 'KPIs & Overview',
      icon: Gauge,
      badgeText: isAr ? 'مباشر' : 'Live',
      badgeType: 'live' as const,
      color: 'emerald',
      visible: true,
    },
    {
      id: 'vehicles_list' as BottomNavTab,
      title: isAr ? 'أسطول السيارات' : 'Fleet',
      subtitle: isAr ? 'المركبات والفروع' : 'Vehicles & Branches',
      icon: Car,
      badgeText: `${counts.totalVehicles ?? 24} ${isAr ? 'مركبة' : 'cars'}`,
      badgeType: 'neutral' as const,
      color: 'cyan',
      visible: true,
    },
    {
      id: 'all_licenses' as BottomNavTab,
      title: isAr ? 'جميع الرخص' : 'All Licenses',
      subtitle: isAr ? 'مرور وتصاريح إعلانات' : 'Traffic & Commercial',
      icon: FileText,
      badgeText: counts.expiringLicenses && counts.expiringLicenses > 0 
        ? `${counts.expiringLicenses} ${isAr ? 'تنبيه' : 'alerts'}` 
        : (isAr ? 'مطابق' : 'Compliant'),
      badgeType: counts.expiringLicenses && counts.expiringLicenses > 0 ? 'warning' as const : 'success' as const,
      color: 'amber',
      visible: true,
    },
    {
      id: 'reports' as BottomNavTab,
      title: isAr ? 'التقارير والطباعة' : 'Reports & Export',
      subtitle: isAr ? 'تصدير إكسل وتدقيق' : 'Excel & Auditing',
      icon: BarChart3,
      badgeText: 'XLSX / PDF',
      badgeType: 'neutral' as const,
      color: 'indigo',
      visible: canExportReports,
    },
    {
      id: 'transfers' as BottomNavTab,
      title: isAr ? 'سجل النقل' : 'Transfers Log',
      subtitle: isAr ? 'حركة الفروع والمواقع' : 'Branch Movements',
      icon: ArrowLeftRight,
      badgeText: `${counts.transfersCount ?? 0} ${isAr ? 'حركات' : 'moves'}`,
      badgeType: 'neutral' as const,
      color: 'purple',
      visible: true,
    },
    {
      id: 'settings' as BottomNavTab,
      title: isAr ? 'إعدادات النظام' : 'System Settings',
      subtitle: isAr ? `مهلة ${counts.thresholdDays ?? 30} يوم` : `${counts.thresholdDays ?? 30}d Alert`,
      icon: Settings,
      badgeText: isAr ? 'تحكم' : 'Config',
      badgeType: 'neutral' as const,
      color: 'slate',
      visible: canManageSettings,
    },
  ];

  const navItems = allNavItems.filter(item => item.visible);
  const totalCols = navItems.length + (isAdmin ? 1 : 0);
  const lgColsClass =
    totalCols >= 7
      ? 'lg:grid-cols-7'
      : totalCols === 6
      ? 'lg:grid-cols-6'
      : totalCols === 5
      ? 'lg:grid-cols-5'
      : 'lg:grid-cols-4';

  return (
    <nav 
      aria-label="Executive Navigation Bar" 
      className="sticky top-2 z-40 mb-4 rounded-2xl bg-[#070b15]/95 backdrop-blur-2xl border border-white/10 p-1.5 sm:p-2 shadow-[0_12px_45px_rgba(0,0,0,0.65)] ring-1 ring-white/5"
    >
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${lgColsClass} gap-1.5 sm:gap-2`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          // Theme color mapping for active state
          let activeBorder = 'border-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.22)]';
          let activeBg = 'bg-gradient-to-br from-amber-500/15 via-[#0e172a] to-emerald-500/10';
          let iconActiveBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
          let indicatorBg = 'bg-amber-400';

          if (item.id === 'dashboard') {
            activeBorder = 'border-emerald-500/60 shadow-[0_0_24px_rgba(16,185,129,0.22)]';
            activeBg = 'bg-gradient-to-br from-emerald-500/15 via-[#081720] to-[#0e172a]';
            iconActiveBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
            indicatorBg = 'bg-emerald-400';
          } else if (item.id === 'vehicles_list') {
            activeBorder = 'border-cyan-500/60 shadow-[0_0_24px_rgba(6,182,212,0.22)]';
            activeBg = 'bg-gradient-to-br from-cyan-500/15 via-[#081926] to-[#0e172a]';
            iconActiveBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
            indicatorBg = 'bg-cyan-400';
          } else if (item.id === 'reports') {
            activeBorder = 'border-indigo-500/60 shadow-[0_0_24px_rgba(99,102,241,0.22)]';
            activeBg = 'bg-gradient-to-br from-indigo-500/15 via-[#0e152e] to-[#0e172a]';
            iconActiveBg = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]';
            indicatorBg = 'bg-indigo-400';
          } else if (item.id === 'transfers') {
            activeBorder = 'border-purple-500/60 shadow-[0_0_24px_rgba(168,85,247,0.22)]';
            activeBg = 'bg-gradient-to-br from-purple-500/15 via-[#1a0f2e] to-[#0e172a]';
            iconActiveBg = 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
            indicatorBg = 'bg-purple-400';
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer text-right group select-none ${
                isActive
                  ? `${activeBg} ${activeBorder} ring-1 ring-white/10 scale-[1.01]`
                  : 'bg-white/[0.02] border-white/[0.05] hover:border-white/15 hover:bg-white/[0.05] hover:scale-[1.005]'
              }`}
            >
              {/* Active Bottom Glow Indicator */}
              {isActive && (
                <div 
                  className={`absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full ${indicatorBg} shadow-[0_0_8px_currentColor]`}
                />
              )}

              {/* Text Meta Container */}
              <div className="flex flex-col text-right min-w-0 pr-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs sm:text-[13px] font-black leading-tight tracking-tight truncate ${
                    isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {item.title}
                  </span>
                </div>
                
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5 truncate max-w-[125px]">
                  {item.subtitle}
                </span>

                {/* Badge Pill */}
                <div className="mt-1.5 flex items-center gap-1">
                  {item.badgeType === 'live' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {item.badgeText}
                    </span>
                  )}

                  {item.badgeType === 'warning' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      <AlertCircle className="w-2.5 h-2.5" />
                      {item.badgeText}
                    </span>
                  )}

                  {item.badgeType === 'success' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {item.badgeText}
                    </span>
                  )}

                  {item.badgeType === 'neutral' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-white/5 text-slate-400 border border-white/10">
                      {item.badgeText}
                    </span>
                  )}
                </div>
              </div>

              {/* Icon Container */}
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                isActive ? iconActiveBg : 'bg-white/[0.04] text-slate-400 border-white/5 group-hover:text-white group-hover:border-white/10'
              }`}>
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
            </button>
          );
        })}

        {/* 7th EXCLUSIVE TAB: ADMIN USERS & PERMISSIONS - SHOWN ONLY TO ADMIN */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              onSelectTab('users_management');
            }}
            className={`relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer text-right group select-none ${
              activeTab === 'users_management'
                ? 'border-amber-400 bg-gradient-to-br from-amber-500/30 via-amber-950/60 to-slate-900 shadow-[0_0_28px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/60 scale-[1.01]'
                : 'border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-amber-950/30 to-slate-900 shadow-[0_0_16px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:from-amber-500/25 hover:shadow-[0_0_24px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/30'
            }`}
            title="خاص بمدير النظام: صفحة إدارة حسابات المستخدمين والصلاحيات والفروع"
          >
            {activeTab === 'users_management' && (
              <div className="absolute -bottom-[1px] left-3 right-3 h-[2.5px] rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
            )}

            {/* Glowing top pill */}
            <div className="flex flex-col text-right min-w-0 pr-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-[13px] font-black leading-tight tracking-tight text-amber-200 group-hover:text-amber-100 truncate">
                  {isAr ? 'المستخدمين والصلاحيات' : 'Users & Permissions'}
                </span>
              </div>
              
              <span className="text-[10px] text-amber-300/80 group-hover:text-amber-200 mt-0.5 truncate max-w-[125px]">
                {isAr ? 'صفحة الإدارة 👑' : 'Admin Page 👑'}
              </span>

              {/* Badge Pill */}
              <div className="mt-1.5 flex items-center gap-1">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 shadow-sm">
                  <span>👑 {isAr ? 'تحكم كامل' : 'Full Control'}</span>
                </span>
              </div>
            </div>

            {/* Icon Container */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border border-amber-400/50 bg-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </button>
        )}
      </div>
    </nav>
  );
};
