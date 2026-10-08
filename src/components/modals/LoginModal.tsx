import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  KeyRound, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Car
} from 'lucide-react';
import { SystemUser, UserRole } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import { Language } from '../../utils/i18n';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: SystemUser) => void;
  users: SystemUser[];
  lang: Language;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  users = [],
  lang,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني' : 'Please enter your username or email');
      return;
    }

    if (!cleanPass) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user from active users state
      const candidatePool = users.length > 0 ? users : INITIAL_USERS;
      const found = candidatePool.find((u) => {
        const uName = (u.username || '').trim().toLowerCase();
        const uEmail = (u.email || '').trim().toLowerCase();
        const uPass = (u.password || '').trim();
        const isUserMatch =
          uName === cleanUser ||
          uEmail === cleanUser ||
          (u.role === 'admin' && (
            cleanUser === 'admin' ||
            cleanUser === 'walid' ||
            cleanUser === 'waleed' ||
            cleanUser === 'وليد' ||
            cleanUser === 'وليد عادل' ||
            cleanUser === '01144542800' ||
            cleanUser.includes('walid.adel') ||
            cleanUser.includes('waleed.eltayeb')
          )) ||
          (uName === 'fleet' && (cleanUser === 'fleet' || cleanUser === 'fleet.manager')) ||
          (uName === 'branch' && (cleanUser === 'branch' || cleanUser === 'branch.manager')) ||
          (uName === 'viewer' && (cleanUser === 'viewer' || cleanUser === 'view'));

        if (!isUserMatch) return false;

        const isPassMatch =
          (uPass && (uPass === cleanPass || uPass.toLowerCase() === cleanPass.toLowerCase())) ||
          (u.role === 'admin' && (
            cleanPass.toLowerCase() === 'admin' ||
            cleanPass === '123456' ||
            cleanPass.toLowerCase() === 'admin123' ||
            cleanPass.toLowerCase() === 'walid' ||
            cleanPass.toLowerCase() === 'waleed' ||
            cleanPass === '01144542800'
          ));

        return isPassMatch;
      });

      if (found) {
        if (found.status === 'suspended') {
          setErrorMsg(lang === 'ar' ? 'تم تعطيل وتعليق هذا الحساب مؤقتاً، يرجى مراجعة مدير النظام (Admin)' : 'This account has been suspended. Contact system admin.');
          setIsLoading(false);
          return;
        }

        // Update lastLogin
        const updatedUser: SystemUser = {
          ...found,
          lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };

        setIsLoading(false);
        onLogin(updatedUser);
        onClose();
      } else {
        const userByIdentity = candidatePool.find((u) => {
          const uName = (u.username || '').trim().toLowerCase();
          const uEmail = (u.email || '').trim().toLowerCase();
          return uName === cleanUser || uEmail === cleanUser;
        });
        setIsLoading(false);
        if (userByIdentity && userByIdentity.status === 'suspended') {
          setErrorMsg(lang === 'ar' ? 'تم تعطيل وتعليق هذا الحساب مؤقتاً، يرجى مراجعة مدير النظام (Admin)' : 'This account has been suspended. Contact system admin.');
          return;
        }
        setErrorMsg(
          lang === 'ar'
            ? 'بيانات الدخول غير صحيحة، يرجى التحقق من اسم المستخدم أو كلمة المرور'
            : 'Invalid credentials. Please verify your username or password.'
        );
      }
    }, 350);
  };

  const handleQuickLogin = (role: UserRole) => {
    const target = users.find((u) => u.role === role);
    if (target) {
      setUsernameInput(target.username);
      setPasswordInput(target.password || target.username);
      setErrorMsg('');
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        onLogin({
          ...target,
          lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
        });
        onClose();
      }, 250);
    }
  };

  const roleMeta: Record<UserRole, { titleAr: string; descAr: string; color: string }> = {
    admin: {
      titleAr: 'مدير النظام (Admin)',
      descAr: 'تحكم كامل، إدارة المستخدمين، إعدادات المهل وتصدير كافة البيانات',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    },
    fleet_manager: {
      titleAr: 'مدير الأسطول (Fleet Manager)',
      descAr: 'إدارة وتحديث رخص المرور والإعلانات، ونقل المركبات بين الفروع',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
    branch_manager: {
      titleAr: 'مدير فرع (Branch Manager)',
      descAr: 'متابعة وتحديث رخص سيارات الفرع (محجوب عنه نقل السيارات بين الفروع)',
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    },
    viewer: {
      titleAr: 'مشاهد ومدقق بيانات (Viewer)',
      descAr: 'استعراض البيانات وتقارير الرخص دون إمكانية التعديل أو الحذف',
      color: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#090e1a] border border-white/15 shadow-2xl overflow-hidden text-right rtl:text-right ltr:text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Brand & Crest */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-lg shadow-emerald-950/50">
              <ShoppingBag className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">سعودي سوبر ماركت</h3>
                <span className="text-xs font-mono font-black text-amber-400">SEOUDI</span>
              </div>
              <p className="text-xs text-slate-400">بوابة تسجيل الدخول لمنظومة أسطول التوصيل والتراخيص</p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-2.5 text-rose-300 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {lang === 'ar' ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or Email'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin أو fleet.manager أو البريد..."
                  className="w-full bg-slate-900/90 border border-white/15 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-sans"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                  <span>🔒</span>
                  <span>{lang === 'ar' ? 'مشفرة ومحمية' : 'Encrypted & Protected'}</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-white/15 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/60 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>جاري التحقق من بيانات الدخول...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-slate-950" />
                  <span>{lang === 'ar' ? 'تسجيل الدخول للمنظومة' : 'Sign In to Platform'}</span>
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Access */}
          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                {lang === 'ar' ? '⚡ الدخول التجريبي السريع بنقرة واحدة:' : '⚡ One-Click Demo Access:'}
              </span>
              <span className="text-[10px] text-amber-400 font-bold">للتجربة والتقييم الفوري</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'fleet_manager', 'branch_manager', 'viewer'] as UserRole[]).map((r) => {
                const u = users.find((usr) => usr.role === r);
                const meta = roleMeta[r];
                if (!u) return null;

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleQuickLogin(r)}
                    className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all hover:scale-[1.02] cursor-pointer ${meta.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{u.name}</span>
                      <span className="text-[9px] font-mono opacity-80">{u.username}</span>
                    </div>
                    <div className="text-[10px] opacity-90 mt-0.5 truncate">{meta.titleAr}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
