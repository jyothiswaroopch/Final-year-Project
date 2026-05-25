import React from 'react';
import { Lock, Sparkles, Zap, ChevronRight } from 'lucide-react';

const PremiumGate = ({ 
  children, 
  title = "Premium Feature", 
  description = "Upgrade to Radar Pro to unlock advanced analytics and institutional-grade insights.",
  isDark = false,
  className = ""
}) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      {/* Blurred Content */}
      <div className="select-none blur-[6px] opacity-40 pointer-events-none transition-all duration-500">
        {children}
      </div>

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-[2px] z-10 transition-all duration-300 hover:backdrop-blur-sm">
        
        {/* Central Card */}
        <div className={`relative flex flex-col items-center text-center p-8 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border ${isDark ? 'bg-slate-900/95 border-blue-900/50 shadow-blue-900/20' : 'bg-white/95 border-blue-100 shadow-blue-100/50'} animate-in zoom-in duration-500`}>
          
          {/* Animated Background Gradients */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
          
          {/* Icon Badge */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
            <Lock size={28} className="absolute drop-shadow-md" />
            <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-300 animate-pulse" />
          </div>

          <h3 className={`text-xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h3>
          
          <p className={`text-sm font-medium mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {description}
          </p>

          <button className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-900 text-white font-black text-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              Upgrade to Pro
            </span>
            <ChevronRight size={16} className="relative z-10 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
          
          <button className={`mt-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumGate;
