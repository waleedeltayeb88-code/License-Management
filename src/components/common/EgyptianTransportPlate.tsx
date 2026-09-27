import React from 'react';

interface EgyptianTransportPlateProps {
  vehicleNumber: string;
  plateLetters?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Authentic Egyptian Commercial Transport Vehicle License Plate (لوحة سيارات النقل المصرية)
 * Features:
 * - Red top band for commercial / transport vehicles (نقل) with 'مِصْر' and 'EGYPT'
 * - High-contrast embossed white reflective metallic lower section
 * - Authentic separated Arabic letters and digits
 * - Metallic border, corner rivet stamps, and 3D pressed metal effect
 */
export const EgyptianTransportPlate: React.FC<EgyptianTransportPlateProps> = ({
  vehicleNumber,
  plateLetters = '',
  size = 'md',
  className = ''
}) => {
  // Check if special vehicle (e.g. Golf Car)
  const isGolfCar = (plateLetters && plateLetters.includes('جولف')) || vehicleNumber.toLowerCase().includes('golf');

  // Format letters: separate with spaced styling if regular Arabic letters
  const cleanLetters = plateLetters.trim() || 'س ع د';
  const displayLetters = isGolfCar 
    ? 'جولف كار' 
    : cleanLetters.split(/\s+/).join('  ');

  // Size variations
  const sizeStyles = {
    sm: {
      container: 'w-[105px] h-[40px] rounded-[5px]',
      topBand: 'h-[14px] text-[8px] px-1.5',
      bottomBand: 'h-[26px] px-1',
      letters: 'text-[11px] font-black',
      digits: 'text-[12px] font-black tracking-normal',
      rivet: 'w-1 h-1',
      hologram: 'w-2 h-2',
    },
    md: {
      container: 'w-[124px] h-[46px] rounded-[6px]',
      topBand: 'h-[16px] text-[9px] px-2',
      bottomBand: 'h-[30px] px-1.5',
      letters: 'text-[13px] font-black',
      digits: 'text-[14px] font-black tracking-normal',
      rivet: 'w-1.5 h-1.5',
      hologram: 'w-2.5 h-2.5',
    },
    lg: {
      container: 'w-[160px] h-[58px] rounded-[7px]',
      topBand: 'h-[20px] text-[11px] px-2.5',
      bottomBand: 'h-[38px] px-2',
      letters: 'text-[17px] font-black',
      digits: 'text-[18px] font-black tracking-normal',
      rivet: 'w-2 h-2',
      hologram: 'w-3 h-3',
    }
  }[size];

  return (
    <div
      dir="ltr"
      title={`لوحة نقل مصرية: ${plateLetters} ${vehicleNumber}`}
      className={`relative inline-flex flex-col select-none overflow-hidden bg-slate-900 border-[2px] border-[#0a0f1d] ring-1 ring-slate-400/60 shadow-[0_3px_8px_rgba(0,0,0,0.6)] transition-all duration-200 group-hover:scale-[1.03] group-hover:shadow-[0_4px_14px_rgba(220,38,38,0.35)] ${sizeStyles.container} ${className}`}
      style={{
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.5)'
      }}
    >
      {/* 4 Corner Rivets / Screws (مسامير تثبيت اللوحة المعدنية) */}
      <span className={`absolute top-0.5 left-0.5 ${sizeStyles.rivet} rounded-full bg-gradient-to-br from-slate-200 to-slate-500 border border-slate-700 shadow-inner z-20 opacity-80`} />
      <span className={`absolute top-0.5 right-0.5 ${sizeStyles.rivet} rounded-full bg-gradient-to-br from-slate-200 to-slate-500 border border-slate-700 shadow-inner z-20 opacity-80`} />
      <span className={`absolute bottom-0.5 left-0.5 ${sizeStyles.rivet} rounded-full bg-gradient-to-br from-slate-200 to-slate-500 border border-slate-700 shadow-inner z-20 opacity-80`} />
      <span className={`absolute bottom-0.5 right-0.5 ${sizeStyles.rivet} rounded-full bg-gradient-to-br from-slate-200 to-slate-500 border border-slate-700 shadow-inner z-20 opacity-80`} />

      {/* ========================================================================= */}
      {/* TOP BAND: OFFICIAL RED FOR EGYPTIAN COMMERCIAL / TRANSPORT (نقل)         */}
      {/* ========================================================================= */}
      <div 
        className={`w-full flex items-center justify-between text-white font-bold bg-gradient-to-b from-[#df2929] via-[#cc1f1f] to-[#b31414] border-b border-[#8a0c0c] z-10 ${sizeStyles.topBand}`}
        style={{
          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
        }}
      >
        {/* Left: EGYPT in English */}
        <span className="font-sans font-black tracking-widest leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
          EGYPT
        </span>

        {/* Center: Hologram Eagle Emblem watermark */}
        <div className="flex items-center justify-center">
          <div 
            className={`${sizeStyles.hologram} rounded-full bg-amber-300/40 border border-amber-200/60 flex items-center justify-center shadow-inner`}
            title="علامة النسر المائية المؤمنة"
          >
            <span className="text-[6px] text-amber-100 font-serif leading-none">★</span>
          </div>
        </div>

        {/* Right: مِصْر in Arabic calligraphy */}
        <span 
          dir="rtl" 
          className="font-serif font-black tracking-tight leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}
        >
          مِـصْـر
        </span>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: EMBOSSED METALLIC WHITE PLATE (أرضية اللوحة البيضاء)     */}
      {/* ========================================================================= */}
      <div 
        className={`w-full flex-1 flex items-center justify-between bg-gradient-to-b from-[#ffffff] via-[#f7f8fa] to-[#e6e9ee] text-slate-950 relative overflow-hidden ${sizeStyles.bottomBand}`}
      >
        {/* Metallic Plate Light Specular Reflection Bar */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />

        {/* Subtle Horizontal Security Watermark Strip */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-slate-300/40 pointer-events-none" />

        {/* Left Half: Numbers (الأرقام) */}
        <div className="flex-1 flex items-center justify-center px-1 text-center">
          <span 
            className={`font-mono text-slate-950 font-black leading-none tracking-tight ${sizeStyles.digits}`}
            style={{
              textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.7)',
              letterSpacing: size === 'sm' ? '-0.5px' : '0px'
            }}
          >
            {vehicleNumber}
          </span>
        </div>

        {/* Center Vertical Plate Divider Line (الخط الفاصل في لوحة المرور) */}
        <div className="w-[1.5px] h-[75%] bg-gradient-to-b from-slate-400 via-slate-500 to-slate-400 shadow-[0_0_1px_rgba(0,0,0,0.3)] shrink-0 my-auto" />

        {/* Right Half: Arabic Letters (الحروف العربية) */}
        <div dir="rtl" className="flex-1 flex items-center justify-center px-1 text-center">
          <span 
            className={`font-sans text-slate-950 font-black leading-none ${sizeStyles.letters}`}
            style={{
              fontFamily: 'Tahoma, Arial, sans-serif',
              textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.7)',
              letterSpacing: isGolfCar ? '0px' : '2px'
            }}
          >
            {displayLetters}
          </span>
        </div>
      </div>
    </div>
  );
};
