import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck2, 
  Truck, 
  PlusCircle, 
  FileSliders, 
  ArrowLeftRight, 
  BarChart3, 
  Bell, 
  History, 
  Settings,
  Download,
  Edit3
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';
import { translations, Language } from '../utils/i18n';

interface SidebarProps {
  lang: Language;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  onExportExcel?: () => void;
  unreadNotificationsCount?: number;
  unreadCount?: number;
  expiringCount?: number;
  onQuickAddLicense?: () => void;
  onQuickManageData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  activeTab,
  onSelectTab,
  userRole,
  onExportExcel,
  unreadNotificationsCount,
  unreadCount: propUnreadCount,
  expiringCount,
  onQuickAddLicense,
  onQuickManageData,
}) => {
  const t = translations[lang];
  const effectiveUnread = typeof propUnreadCount === 'number' 
    ? propUnreadCount 
    : (unreadNotificationsCount || 0);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: t.navDashboard, icon: LayoutDashboard },
    { id: 'licenses' as ActiveTab, label: t.navLicenseTracking, icon: FileCheck2 },
    { id: 'manage_data' as ActiveTab, label: t.navEditData, icon: FileSliders, requireEdit: true },
    { id: 'add_license' as ActiveTab, label: t.navAddLicense, icon: PlusCircle, requireEdit: true },
    { id: 'transfers' as ActiveTab, label: t.navTransferHistory, icon: ArrowLeftRight },
    { id: 'reports' as ActiveTab, label: t.navReports, icon: BarChart3 },
    { 
      id: 'notifications' as ActiveTab, 
      label: t.navNotifications, 
      icon: Bell, 
      badge: effectiveUnread > 0 ? effectiveUnread : undefined 
    },
    { id: 'audit_log' as ActiveTab, label: t.navAuditLog, icon: History },
    { id: 'settings' as ActiveTab, label: t.navSettings, icon: Settings },
  ];

  const canEdit = userRole === 'admin' || userRole === 'fleet_manager' || userRole === 'branch_manager';

  return (
    <aside className="w-64 shrink-0 bg-[#090d16] border-l rtl:border-l-0 rtl:border-r border-white/[0.08] flex flex-col justify-between p-4 min-h-[calc(100vh-61px)]">
      {/* Navigation Links */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {lang === 'ar' ? 'القوائم الرئيسية' : 'Navigation'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isRestricted = item.requireEdit && !canEdit;

          if (isRestricted) {
            // If viewer, show with locked indicator or hide
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed select-none"
                title={t.permissionDeniedMsg}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 opacity-40" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-500">
                  {lang === 'ar' ? 'مقيد' : 'Locked'}
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r rtl:bg-gradient-to-l from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Actions Panel (Matching Reference UI) */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-2">
        <div className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {t.quickActions}
        </div>

        {/* Add License Button */}
        {canEdit && (
          <button
            onClick={() => onQuickAddLicense ? onQuickAddLicense() : onSelectTab('add_license')}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all border border-emerald-400/30 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.addLicenseBtn}</span>
          </button>
        )}

        {/* Edit Data Button */}
        {canEdit && (
          <button
            onClick={() => onQuickManageData ? onQuickManageData() : onSelectTab('manage_data')}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-950/40 transition-all border border-blue-400/30 active:scale-[0.98]"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.editDataBtn}</span>
          </button>
        )}

        {/* Transfer Vehicle Button */}
        {canEdit && (
          <button
            onClick={() => onQuickManageData ? onQuickManageData() : onSelectTab('manage_data')}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-950/40 transition-all border border-amber-400/30 active:scale-[0.98]"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{t.transferVehicleBtn}</span>
          </button>
        )}

        {/* Export Data Button */}
        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-white/10 hover:border-amber-500/30 transition-all shadow-sm active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{t.exportDataBtn}</span>
          </button>
        )}
      </div>
    </aside>
  );
};
