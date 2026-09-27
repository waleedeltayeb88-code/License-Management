import React from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCheck, ExternalLink } from 'lucide-react';
import { SystemNotification } from '../types';
import { translations, Language } from '../utils/i18n';

interface NotificationsViewProps {
  lang: Language;
  notifications: SystemNotification[];
  onMarkAllRead: () => void;
  onSelectVehicleNumber: (vehicleNum: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  lang,
  notifications = [],
  onMarkAllRead,
  onSelectVehicleNumber,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6 max-w-4xl mx-auto mb-12">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {t.navNotifications}
            </h2>
            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? 'تنبيهات فورية بانتهاء وسريان الرخص وحركات نقل الأسطول.'
                : 'Real-time alert center for expiring licenses and fleet relocations.'}
            </p>
          </div>
        </div>

        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all"
        >
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.markAllAsRead}</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {(notifications || []).length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-white/5">
            {lang === 'ar' ? 'لا توجد تنبيهات حالية' : 'No notifications'}
          </div>
        ) : (
          (notifications || []).map((notif) => {
            const isHigh = notif.priority === 'high';
            const isMedium = notif.priority === 'medium';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  !notif.read
                    ? 'bg-slate-900/95 border-amber-500/30 shadow-lg'
                    : 'bg-slate-900/40 border-white/5 opacity-80'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isHigh
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isMedium
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {isHigh ? <AlertCircle className="w-5 h-5" /> : isMedium ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{notif.title}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">{notif.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>

                  {notif.vehicleNumber && (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => onSelectVehicleNumber(notif.vehicleNumber!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                      >
                        <span>{lang === 'ar' ? `فتح ملف السيارة #${notif.vehicleNumber}` : `Open Vehicle #${notif.vehicleNumber}`}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
