import React from 'react';
import { SurveyPerson, ZONES } from '../types/survey';
import { 
  Users, 
  Home, 
  MapPin, 
  Briefcase, 
  UserCheck, 
  HeartHandshake, 
  ArrowUpRight,
  TrendingUp,
  Compass
} from 'lucide-react';

interface DashboardProps {
  data: SurveyPerson[];
  onAddNew: () => void;
  onFilterZone: (zone: string) => void;
  onNavigateToList: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onAddNew,
  onFilterZone,
  onNavigateToList,
}) => {
  const totalCount = data.length;

  // Unique households
  const uniqueHouses = new Set(data.map(p => p.houseNumber.trim()));
  const totalHouses = uniqueHouses.size;

  // Gender counts
  const maleCount = data.filter(p => p.gender === 'ชาย').length;
  const femaleCount = data.filter(p => p.gender === 'หญิง').length;
  const otherGenderCount = data.filter(p => p.gender === 'อื่นๆ').length;

  // Age Groups
  const childrenCount = data.filter(p => p.age < 15).length;
  const workingCount = data.filter(p => p.age >= 15 && p.age < 60).length;
  const elderlyCount = data.filter(p => p.age >= 60).length;
  const averageAge = totalCount > 0 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.age || 0), 0) / totalCount)
    : 0;

  // Zone Breakdown
  const zoneStats = ZONES.map(zoneName => {
    const peopleInZone = data.filter(p => p.zone === zoneName);
    const count = peopleInZone.length;
    const houses = new Set(peopleInZone.map(p => p.houseNumber.trim())).size;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return {
      name: zoneName,
      count,
      houses,
      percentage,
    };
  });

  // Top Occupations
  const occupationMap: Record<string, number> = {};
  data.forEach(p => {
    if (p.occupation) {
      occupationMap[p.occupation] = (occupationMap[p.occupation] || 0) + 1;
    }
  });
  const sortedOccupations = Object.entries(occupationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // GPS Pin count
  const withCoordinatesCount = data.filter(p => p.latitude && p.longitude).length;
  const gpsPercentage = totalCount > 0 ? Math.round((withCoordinatesCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome & Quick Action Hero */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-elevated p-6 sm:p-8 border border-white/15 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-red-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              รายงานสรุปข้อมูล จปฐ. ภาคสนาม
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              สถานการณ์ประชากร <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">หมู่ที่ 2 ต.กงราป อ.ป่าบอน</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              ครอบคลุมพื้นที่ 3 โซน (ควนเจริญ, อนามัย, หลังสถานีรถไฟ) เพื่อการจัดทำฐานข้อมูลความจำเป็นพื้นฐาน (จปฐ.) ในการพัฒนาคุณภาพชีวิตของประชาชนในหมู่บ้าน
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onAddNew}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              + บันทึกสำรวจคนใหม่
            </button>
            <button
              onClick={onNavigateToList}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/15 font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              ค้นหารายชื่อ
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Surveyed */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">ประชากรที่สำรวจ</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{totalCount}</span>
            <span className="text-xs text-amber-400 font-semibold">คน</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>ชาย {maleCount}</span> • <span>หญิง {femaleCount}</span>
          </div>
        </div>

        {/* Total Households */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">จำนวนหลังคาเรือน</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Home className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{totalHouses}</span>
            <span className="text-xs text-blue-400 font-semibold">หลัง</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            เฉลี่ย {totalHouses > 0 ? (totalCount / totalHouses).toFixed(1) : 0} คน / หลัง
          </div>
        </div>

        {/* Elderly / Senior count */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">ผู้สูงอายุ (60 ปีขึ้นไป)</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <HeartHandshake className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{elderlyCount}</span>
            <span className="text-xs text-red-400 font-semibold">คน</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {totalCount > 0 ? Math.round((elderlyCount / totalCount) * 100) : 0}% ของประชากร
          </div>
        </div>

        {/* Average Age & GPS Pinning */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">พิกัด GPS บ้าน</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{gpsPercentage}%</span>
            <span className="text-xs text-emerald-400 font-semibold">({withCoordinatesCount} คน)</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            อายุเฉลี่ย {averageAge} ปี
          </div>
        </div>
      </div>

      {/* Zone Breakdown (Crucial feature #9: 3 Zones) */}
      <div className="glass-panel-elevated p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              การกระจายตัวตาม 3 โซนพื้นที่ ม.2 ต.กงราป อ.ป่าบอน
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              คลิกที่แต่ละโซนเพื่อกรองดูรายชื่อประชากรในโซนนั้นทันที
            </p>
          </div>
          <span className="text-xs text-slate-400">3 โซนปกครอง</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zoneStats.map((zone, idx) => {
            const colors = [
              { border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300', bar: 'bg-gradient-to-r from-amber-500 to-amber-300' },
              { border: 'border-blue-500/40', badge: 'bg-blue-500/20 text-blue-300', bar: 'bg-gradient-to-r from-blue-500 to-indigo-400' },
              { border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-300', bar: 'bg-gradient-to-r from-red-500 to-rose-400' },
            ][idx % 3];

            return (
              <div
                key={zone.name}
                onClick={() => onFilterZone(zone.name)}
                className={`glass-panel p-4 rounded-2xl border ${colors.border} cursor-pointer hover:scale-[1.02] transition-all shadow-lg hover:shadow-2xl relative overflow-hidden`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.badge} inline-block mb-1.5`}>
                      โซนที่ {idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-white">{zone.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white">{zone.count}</span>
                    <span className="text-xs text-slate-400 ml-1">คน</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{zone.houses} หลังคาเรือน</span>
                    <span className="font-semibold text-slate-300">{zone.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${zone.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>กดเพื่อดูรายชื่อในโซนนี้</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demographics & Occupations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender & Age Breakdown */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Users className="w-4.5 h-4.5 text-blue-400" />
            โครงสร้างประชากร (เพศและวัย)
          </h3>

          {/* Gender Bars */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                เพศชาย: {maleCount} คน
              </span>
              <span className="text-slate-400">{totalCount > 0 ? Math.round((maleCount / totalCount) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (maleCount / totalCount) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                เพศหญิง: {femaleCount} คน
              </span>
              <span className="text-slate-400">{totalCount > 0 ? Math.round((femaleCount / totalCount) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (femaleCount / totalCount) * 100 : 0}%` }}
              />
            </div>

            {otherGenderCount > 0 && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    อื่นๆ: {otherGenderCount} คน
                  </span>
                  <span className="text-slate-400">{Math.round((otherGenderCount / totalCount) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${(otherGenderCount / totalCount) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Age Group Badges */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              การแบ่งตามช่วงอายุ
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl text-center">
                <div className="text-xs text-slate-400">วัยเด็ก (0-14)</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">{childrenCount}</div>
                <div className="text-[10px] text-slate-500">คน</div>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl text-center">
                <div className="text-xs text-slate-400">วัยทำงาน (15-59)</div>
                <div className="text-lg font-bold text-amber-400 mt-1">{workingCount}</div>
                <div className="text-[10px] text-slate-500">คน</div>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl text-center">
                <div className="text-xs text-slate-400">สูงอายุ (60+)</div>
                <div className="text-lg font-bold text-red-400 mt-1">{elderlyCount}</div>
                <div className="text-[10px] text-slate-500">คน</div>
              </div>
            </div>
          </div>
        </div>

        {/* Occupations Ranking */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Briefcase className="w-4.5 h-4.5 text-amber-400" />
              กลุ่มอาชีพหลักของประชากร
            </h3>

            <div className="space-y-3">
              {sortedOccupations.length === 0 ? (
                <div className="text-sm text-slate-400 text-center py-6">ยังไม่มีข้อมูลอาชีพ</div>
              ) : (
                sortedOccupations.map(([occ, count], i) => {
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={occ} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                            {i + 1}
                          </span>
                          {occ}
                        </span>
                        <span className="text-slate-400 font-semibold">{count} คน ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>พื้นที่เศรษฐกิจเกษตรกรรม (ยางพารา ปาล์มน้ำมัน เงาะนาสาร)</span>
            <button 
              onClick={onNavigateToList}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              ดูรายละเอียดทั้งหมด →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
