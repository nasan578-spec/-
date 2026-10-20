import React from 'react';
import { 
  BarChart3, 
  Users, 
  Home, 
  FileSpreadsheet, 
  Code2, 
  MapPin, 
  ShieldCheck,
  Sparkles,
  Cloud
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'list' | 'households' | 'sheets' | 'drive' | 'prompt';
  setActiveTab: (tab: 'dashboard' | 'list' | 'households' | 'sheets' | 'drive' | 'prompt') => void;
  totalCount: number;
  totalHouses: number;
  isDriveConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalCount,
  totalHouses,
  isDriveConnected,
}) => {
  return (
    <header className="relative z-30 pt-4 pb-2 px-3 sm:px-6">
      {/* Upper Glass Container */}
      <div className="max-w-7xl mx-auto rounded-3xl glass-panel-elevated p-4 sm:p-6 border border-white/10 shadow-2xl overflow-hidden relative">
        {/* Glow Effects (Navy, Gold, Red) */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-60 h-28 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges & Meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Emblem / Badge */}
            <div className="relative group">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-red-600 p-[2px] shadow-lg shadow-amber-500/20">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center text-center p-1">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                  <span className="text-[9px] font-bold tracking-widest text-white uppercase mt-0.5">ม.2</span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  ระบบสำรวจข้อมูล จปฐ.
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-1">
                ระบบสำรวจ จปฐ. ประชากร <span className="text-amber-400">หมู่ที่ 2</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>ตำบลกงราป อำเภอป่าบอน จังหวัดพัทลุง</span>
              </p>
            </div>
          </div>

          {/* Developer Credit Card */}
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-red-950/70 border border-amber-500/30 rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-inner flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] sm:text-xs text-amber-400 font-semibold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse"></span>
                ผู้พัฒนาระบบ
              </div>
              <div className="text-xs sm:text-sm font-bold text-white leading-tight">
                นายกิตติศักดิ์ สุขช่วย
              </div>
              <div className="text-[11px] text-slate-300 leading-tight">
                ผู้ช่วยฝ่ายปกครอง ม.2 ต.คลองปราบ อ.บ้านนาสาร จ.สุราษฎร์ธานี
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar & Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              แดชบอร์ดสรุปผล
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-600/30 ring-1 ring-blue-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              ค้นหาและรายชื่อ
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-black/30 font-semibold">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('households')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'households'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg shadow-red-600/30 ring-1 ring-red-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              ผังบ้านเลขที่
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-black/30 font-semibold">
                {totalHouses}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'sheets'
                  ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Google Sheets
            </button>

            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'drive'
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 ring-1 ring-blue-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cloud className="w-4 h-4 text-blue-400" />
              Google Drive
              {isDriveConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'prompt'
                  ? 'bg-slate-700 text-amber-300 font-bold shadow-md ring-1 ring-amber-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              คำสั่งพรอมต์ & GAS
            </button>
          </nav>

          {/* Quick Counter pills */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs flex items-center gap-2">
              <span className="text-slate-400">สำรวจแล้ว:</span>
              <span className="text-amber-400 font-bold text-sm">{totalCount} คน</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">ครัวเรือน:</span>
              <span className="text-blue-400 font-bold text-sm">{totalHouses} หลัง</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
