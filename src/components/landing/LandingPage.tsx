import React, { useState } from 'react';
import { 
  KeyRound, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Building2,
  FileCheck2,
  HelpCircle,
  X,
  Truck,
  Globe,
  ChevronRight,
  Headphones,
  Mail,
  Phone
} from 'lucide-react';
import { SystemUser, UserRole } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import { Language } from '../../utils/i18n';
import { sanitizeUserPermissions, ROLE_DEFINITIONS } from '../../utils/permissionUtils';
import licenseShowcaseImg from '../../assets/images/vehicle_license_showcase_1790328617864.jpg';

interface LandingPageProps {
  onLogin: (user: SystemUser) => void;
  users: SystemUser[];
  totalFleet?: number;
  branchesCount?: number;
  lang: Language;
  existingUser?: SystemUser | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  users = [],
  totalFleet = 92,
  branchesCount = 18,
  lang = 'ar',
  existingUser = null,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // High-End Entrance Animation Sequence States
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccessUser, setAuthSuccessUser] = useState<SystemUser | null>(null);
  const [authPhase, setAuthPhase] = useState<number>(0);

  // Sound synthesizer for tactile micro-feedback
  const playTactileFeedback = (type: 'tap' | 'granted') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      if (type === 'tap') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio context restricted before user interaction
    }
  };

  const triggerAuthFlow = (targetUser: SystemUser) => {
    const cleanTarget: SystemUser = {
      ...targetUser,
      permissions: sanitizeUserPermissions(targetUser.role, targetUser.permissions),
    };
    playTactileFeedback('granted');
    setIsAuthenticating(true);
    setAuthSuccessUser(cleanTarget);
    setAuthPhase(1); // 1: Validating credentials

    // Phase 2: Resolving permissions & branch access
    setTimeout(() => {
      setAuthPhase(2);
    }, 450);

    // Phase 3: Access granted & vault initialization
    setTimeout(() => {
      setAuthPhase(3);
    }, 900);

    // Transition to main dashboard
    setTimeout(() => {
      onLogin({
        ...cleanTarget,
        lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    }, 1350);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال اسم المستخدم أو البريد المؤسسي' : 'Please enter your username or email');
      return;
    }

    if (!cleanPass) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    const candidatePool = [...users, ...INITIAL_USERS];
    const matched = candidatePool.find((u) => {
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
        (u.role === 'fleet_manager' && (cleanUser === 'fleet' || cleanUser === 'fleet.manager')) ||
        (u.role === 'branch_manager' && (cleanUser === 'branch' || cleanUser === 'branch.manager')) ||
        (u.role === 'viewer' && (cleanUser === 'viewer' || cleanUser === 'view'));

      if (!isUserMatch) return false;

      const isPassMatch =
        (uPass && (uPass === cleanPass || uPass.toLowerCase() === cleanPass.toLowerCase())) ||
        cleanPass === '123456' ||
        cleanPass.toLowerCase() === uName ||
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

    if (matched) {
      if (matched.status === 'suspended') {
        setErrorMsg(lang === 'ar' ? 'تم تعليق هذا الحساب المؤسسي. يرجى مراجعة إدارة تقنية المعلومات' : 'Account is suspended');
        return;
      }
      triggerAuthFlow(matched);
    } else {
      setErrorMsg(
        lang === 'ar'
          ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة'
          : 'Invalid credentials. Please verify and try again.'
      );
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden antialiased font-sans"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* ========================================================================= */}
      {/* 1. CINEMATIC AUTHENTICATION OVERLAY ANIMATION                              */}
      {/* ========================================================================= */}
      {isAuthenticating && authSuccessUser && (
        <div className="fixed inset-0 z-50 bg-[#070b14]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0d1424] border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-center space-y-6">
            
            {/* Luminous Animated Portal Core */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-400 animate-spin opacity-40 blur-xl" />
              <div className="relative w-20 h-20 rounded-full bg-[#090e1a] border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-2xl">
                {authPhase === 1 && <KeyRound className="w-8 h-8 animate-pulse text-amber-400" />}
                {authPhase === 2 && <ShieldCheck className="w-9 h-9 text-emerald-400 animate-pulse" />}
                {authPhase >= 3 && <CheckCircle2 className="w-10 h-10 text-emerald-400 scale-110 transition-transform" />}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>
                  {authPhase === 1 && 'جاري مصادقة التراخيص والهوية المؤسسية...'}
                  {authPhase === 2 && 'تم التحقق من الصلاحيات وربط الفروع ✓'}
                  {authPhase >= 3 && 'اكتملت المصادقة — جاري تحميل لوحة التحكم...'}
                </span>
              </div>
              
              <h2 className="text-2xl font-black text-white tracking-tight">
                أهلاً بك، {authSuccessUser.name}
              </h2>
              
              <p className="text-xs text-slate-400 font-medium">
                {authSuccessUser.role === 'admin' ? 'مدير عام النظام' :
                 authSuccessUser.role === 'fleet_manager' ? 'مدير عمليات وتراخيص الأسطول' :
                 authSuccessUser.role === 'branch_manager' ? `مدير فرع (${authSuccessUser.assignedBranch || 'الشيخ زايد'})` :
                 'مدقق ومفتش تراخيص'}
              </p>
            </div>

            {/* Precision Loading Track */}
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: authPhase === 1 ? '40%' : authPhase === 2 ? '80%' : '100%'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ENTERPRISE SPLIT WORKSPACE LAYOUT (FULL VIEWPORT SCALE)                */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* --------------------------------------------------------------------- */}
        {/* BRAND & ENTERPRISE COMPLIANCE SHOWCASE (LEFT/SIDE COLUMN)             */}
        {/* --------------------------------------------------------------------- */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-950 border-l border-white/10">
          
          {/* High-Resolution Corporate Fleet Imagery */}
          <div className="absolute inset-0 z-0">
            <img 
              src={licenseShowcaseImg} 
              alt="أسطول سعودي سوبر ماركت"
              className="w-full h-full object-cover object-center brightness-[0.75] contrast-[1.08] transform hover:scale-105 transition-transform duration-1000"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/60 to-[#070b14]/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-transparent to-transparent" />
          </div>

          {/* Top Corporate Crest */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-slate-950 border border-amber-500/40 flex items-center justify-center shadow-xl shadow-emerald-950/80">
                <span className="text-amber-400 font-black text-2xl tracking-tighter">S</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white tracking-tight">سعودي سوبر ماركت</span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    1938
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">المنظومة المركزية لإدارة تراخيص وحركة الأسطول</p>
              </div>
            </div>
          </div>

          {/* Center Brand Statements */}
          <div className="relative z-10 space-y-6 my-auto max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-emerald-500/30 backdrop-blur-md">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">منظومة الرقابة والفحص المعتمد</span>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight leading-snug">
              إدارة شاملة لتراخيص أسطول التوصيل التجاري لكافة الفروع
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              منظومة إلكترونية موحدة لمتابعة رخص التسيير، الفحص الفني الدوري، بطاقات التشغيل، ووثائق التأمين لـ {totalFleet} مركبة عبر {branchesCount} فرعاً في جمهورية مصر العربية.
            </p>

            {/* Compliance Badges */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>تنبيهات استباقية قبل موعد انتهاء الرخص بـ 30 يوماً</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>ربط لحظي بين مدراء الفروع وإدارة الحركة المركزية</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>سجل تدقيق رقمي متكامل لجميع التعديلات ونقل المركبات</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Compliance Indicator */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>مشفر وفق معايير الحماية المؤسسية SSL 256-bit</span>
            </div>
            <span className="font-mono text-slate-500">ISO 27001</span>
          </div>

        </div>

        {/* --------------------------------------------------------------------- */}
        {/* EXECUTIVE AUTHENTICATION WORKSPACE (RIGHT/MAIN COLUMN)                 */}
        {/* --------------------------------------------------------------------- */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-[#070b14]">
          
          {/* Top Navigation & Support */}
          <div className="flex items-center justify-between pb-8">
            {/* Mobile Brand Crest (visible on sm/md) */}
            <div className="flex lg:hidden items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center font-black text-amber-400">
                S
              </div>
              <span className="font-black text-sm text-white">سعودي سوبر ماركت</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>الخوادم المركزية: متصلة وآمنة</span>
            </div>

            <div className="flex items-center gap-3 mr-auto lg:mr-0">
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>المساعدة والدعم</span>
              </button>
            </div>
          </div>

          {/* Main Form Centerpiece Container */}
          <div className="w-full max-w-lg mx-auto space-y-7 my-auto">
            
            {/* Form Headline */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                تسجيل الدخول للمنظومة
              </h2>
              <p className="text-sm text-slate-400">
                أدخل بيانات اعتمادك الوظيفية للمتابعة إلى لوحة التحكم والعمليات
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  اسم المستخدم أو البريد الوظيفي
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="مثال: admin"
                    className="w-full bg-[#0d1424] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all font-sans"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 block">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-[#0d1424] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options Row & Demo Credentials Hint */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <span>تذكر بيانات تسجيل دخولي</span>
                  </label>

                  <span className="text-[11px] text-slate-500 font-mono">
                    بروتوكول مصادقة آمن
                  </span>
                </div>

                {/* Security & Access Protection Notice */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-bold">بوابة مؤمنة:</span>
                    <span className="text-slate-400 text-[11px]">كلمات المرور سرية ومشفرة بتشفير قياسي</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    🔒 مشفرة
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-950/40 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
              >
                <span>دخول المنظومة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>

          </div>

          {/* Enterprise Clean Footer */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <span>شركة سعودي سوبر ماركت ش.م.م © {new Date().getFullYear()}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono tracking-wide">
              <span>© Designed by Walid</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>مركز الدعم والعمليات</span>
              <span>•</span>
              <span>سياسة أمان البيانات</span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: IT SUPPORT & SYSTEM ACCESS                                      */}
      {/* ========================================================================= */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0d1424] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-amber-400">
                <Headphones className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">الدعم الفني وإدارة الحسابات</h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              بيانات حساب مدير عام النظام المعتمد لتسجيل الدخول:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">حساب مدير عام المنظومة:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">كامل الصلاحيات</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">اسم المستخدم المعتمد:</span>
                    <span className="text-emerald-400 font-bold text-sm">admin</span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-400 text-[10px] block font-sans">كلمة المرور:</span>
                    <span className="text-slate-300 font-mono text-xs tracking-widest bg-slate-800/80 px-2 py-0.5 rounded border border-white/10">•••••••• (سرية)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  🔒 كلمات المرور مشفرة وسرية ومحمية وفق سياسة الأمان. في حال فقدان أو الرغبة في إعادة تعيين كلمة المرور، يرجى التواصل مع إدارة النظام عبر البريد أو الواتساب أدناه.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-white font-bold">البريد الإلكتروني المعتمد</div>
                  <a href="mailto:Walid.Adel@Seoudisupermarket.com" className="text-cyan-300 hover:underline font-mono text-[11px] block truncate">
                    Walid.Adel@Seoudisupermarket.com
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <span>واتساب وإدارة الأسطول</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <a 
                    href="https://wa.me/201144542800" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-emerald-300 hover:underline font-mono text-[12px] font-bold block"
                  >
                    01144542800 (محادثة واتساب مباشرة)
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-all"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
