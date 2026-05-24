import React from 'react';
import { BookOpen, BookMarked, PlayCircle, Award, Clock } from 'lucide-react';

export const ICON_MAP = { BookMarked, PlayCircle, Award, BookOpen };

export const COLOR_MAP = {
  blue:    { bg: 'bg-blue-500/10',   text: 'text-blue-400',   bar: 'bg-blue-400',   border: 'border-blue-500/30',   badge: 'bg-blue-500/20 text-blue-300'   },
  purple:  { bg: 'bg-purple-500/10', text: 'text-purple-400', bar: 'bg-purple-400', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
  emerald: { bg: 'bg-emerald-500/10',text: 'text-emerald-400',bar: 'bg-emerald-400',border: 'border-emerald-500/30',badge: 'bg-emerald-500/20 text-emerald-300'},
};

export const LIGHT_COLOR_MAP = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',   bar: 'bg-blue-600',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'    },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600', bar: 'bg-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600',bar: 'bg-emerald-600',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700'},
};

export function CourseCard({ course, isTrader, onClick, progress }) {
  const cm = isTrader ? COLOR_MAP[course.color] : LIGHT_COLOR_MAP[course.color];
  const Icon = ICON_MAP[course.icon] || BookOpen;
  const completed = Object.values(progress?.chapters || {}).filter(Boolean).length;
  const total = course.chapters?.length || 0;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border cursor-pointer group transition-all duration-200 ${
        isTrader
          ? `bg-white/5 border-white/10 hover:border-[${course.color === 'blue' ? '#00f3ff' : '#a855f7'}]/40 hover:bg-white/10`
          : `bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300`
      }`}
    >
      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${cm.bg} ${cm.text}`}>
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cm.badge}`}>
          {course.difficulty}
        </span>
        <span className={`text-[10px] font-bold flex items-center gap-1 ${isTrader ? 'text-slate-400' : 'text-slate-500'}`}>
          <Clock size={10} /> {course.duration}
        </span>
      </div>
      <h3 className={`font-black text-base mb-1 group-hover:underline ${isTrader ? 'text-white uppercase tracking-wide' : 'text-slate-800'}`}>
        {course.title}
      </h3>
      <p className={`text-sm mb-4 leading-snug line-clamp-2 ${isTrader ? 'text-slate-400' : 'text-slate-500'}`}>
        {course.description}
      </p>
      {/* Progress bar */}
      <div className="space-y-1 mt-auto">
        <div className={`h-1.5 w-full rounded-full ${isTrader ? 'bg-white/10' : 'bg-slate-100'}`}>
          <div
            className={`h-1.5 rounded-full transition-all ${cm.bar || 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className={`text-[10px] font-bold pt-1 ${isTrader ? 'text-slate-500' : 'text-slate-400'}`}>
          {pct > 0 ? `${pct}% complete · ${completed}/${total} chapters` : `${total} chapters · ${course.quiz?.length || 0} quiz questions`}
        </div>
      </div>
    </div>
  );
}
