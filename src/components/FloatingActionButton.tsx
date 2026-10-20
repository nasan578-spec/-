import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40 group">
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={onClick}
        className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-2xl shadow-red-600/50 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ring-4 ring-amber-400/30 border border-white/20 focus:outline-none focus:ring-4 focus:ring-amber-400/60"
        aria-label="เพิ่มรายชื่อประชากรใหม่"
        title="เพิ่มรายชื่อประชากรใหม่ (+)"
      >
        {/* Subtle glowing ring animation */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 to-amber-400 opacity-40 blur group-hover:opacity-80 transition duration-300 animate-pulse pointer-events-none" />
        
        {/* Plus Icon */}
        <Plus className="w-8 h-8 relative z-10 stroke-[3] transition-transform duration-300 group-hover:rotate-90 text-white" />
      </button>

      {/* Floating Tooltip Label for Desktop/Tablet */}
      <div className="hidden sm:block absolute right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        <div className="bg-slate-900 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-xl">
          + เพิ่มข้อมูล จปฐ.
        </div>
      </div>
    </div>
  );
};
