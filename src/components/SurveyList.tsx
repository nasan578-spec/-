import React, { useState, useMemo } from 'react';
import { SurveyPerson, ZONES, ZoneType } from '../types/survey';
import { 
  Search, 
  MapPin, 
  Phone, 
  Briefcase, 
  Calendar, 
  Edit3, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Filter, 
  Download, 
  Home, 
  UserPlus,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { exportToCSV, formatThaiDate } from '../services/storage';

interface SurveyListProps {
  data: SurveyPerson[];
  onAddNew: () => void;
  onAddMemberToHouse: (houseNumber: string, zone: ZoneType) => void;
  onEdit: (person: SurveyPerson) => void;
  onDelete: (id: string) => void;
  onOpenSheetsModal: () => void;
  selectedZoneFilter?: string | null;
  onClearZoneFilter?: () => void;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  data,
  onAddNew,
  onAddMemberToHouse,
  onEdit,
  onDelete,
  onOpenSheetsModal,
  selectedZoneFilter,
  onClearZoneFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeZone, setActiveZone] = useState<string>(selectedZoneFilter || 'all');
  const [activeGender, setActiveGender] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Sync external zone filter
  React.useEffect(() => {
    if (selectedZoneFilter) {
      setActiveZone(selectedZoneFilter);
    }
  }, [selectedZoneFilter]);

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Zone filter
      if (activeZone !== 'all' && item.zone !== activeZone) {
        return false;
      }
      // Gender filter
      if (activeGender !== 'all' && item.gender !== activeGender) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = item.fullName.toLowerCase().includes(query);
        const matchesNickname = (item.nickname || '').toLowerCase().includes(query);
        const matchesHouse = item.houseNumber.toLowerCase().includes(query);
        const matchesPhone = item.phone.toLowerCase().includes(query);
        const matchesOccupation = item.occupation.toLowerCase().includes(query);
        const matchesZone = item.zone.toLowerCase().includes(query);
        const matchesNotes = (item.notes || '').toLowerCase().includes(query);

        return (
          matchesName ||
          matchesNickname ||
          matchesHouse ||
          matchesPhone ||
          matchesOccupation ||
          matchesZone ||
          matchesNotes
        );
      }
      return true;
    });
  }, [data, activeZone, activeGender, searchTerm]);

  return (
    <div className="space-y-5 pb-24">
      {/* Search & Filter Bar */}
      <div className="glass-panel-elevated p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ-นามสกุล, ชื่อเล่น, บ้านเลขที่, เบอร์โทร, อาชีพ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl glass-input text-sm font-medium placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenSheetsModal}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="ค้นหาและเชื่อมโยง Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Google Sheets</span>
            </button>

            <button
              onClick={() => exportToCSV(filteredData)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="ส่งออกไฟล์ CSV"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>ส่งออก Excel/CSV</span>
            </button>

            <button
              onClick={onAddNew}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มประชากร</span>
            </button>
          </div>
        </div>

        {/* Filter Pills (3 Zones + Gender) */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Zones */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              โซน:
            </span>
            <button
              onClick={() => {
                setActiveZone('all');
                if (onClearZoneFilter) onClearZoneFilter();
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeZone === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              ทั้งหมด ({data.length})
            </button>

            {ZONES.map((z) => {
              const count = data.filter((p) => p.zone === z).length;
              return (
                <button
                  key={z}
                  onClick={() => setActiveZone(z)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeZone === z
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 border border-blue-400'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {z} ({count})
                </button>
              );
            })}
          </div>

          {/* Gender filter & View toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveGender('all')}
                className={`px-2 py-1 rounded-lg ${
                  activeGender === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                ทุกเพศ
              </button>
              <button
                onClick={() => setActiveGender('ชาย')}
                className={`px-2 py-1 rounded-lg ${
                  activeGender === 'ชาย' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                ชาย
              </button>
              <button
                onClick={() => setActiveGender('หญิง')}
                className={`px-2 py-1 rounded-lg ${
                  activeGender === 'หญิง' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                หญิง
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg ${
                  viewMode === 'cards' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                การ์ด
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg ${
                  viewMode === 'table' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                ตาราง
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <div>
          พบประชากรที่ตรงกับเงื่อนไข{' '}
          <span className="text-amber-400 font-bold">{filteredData.length}</span> รายการ
          {activeZone !== 'all' && (
            <span className="ml-1 text-slate-300">({activeZone})</span>
          )}
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-amber-400 hover:underline"
          >
            ล้างคำค้นหา
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-white/10">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white">ไม่พบรายชื่อประชากร</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            ไม่พบข้อมูลที่ตรงกับคำค้นหา &ldquo;{searchTerm}&rdquo; หรือตัวกรองที่เลือกไว้ ลองเปลี่ยนคำค้นหาหรือเพิ่มประชากรใหม่
          </p>
          <button
            onClick={onAddNew}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + บันทึกสำรวจคนใหม่
          </button>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((person) => {
            const isMale = person.gender === 'ชาย';
            const isFemale = person.gender === 'หญิง';

            const zoneBadgeClass = 
              person.zone === 'โซนควนเจริญ'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : person.zone === 'โซนอนามัย'
                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                : 'bg-red-500/15 text-red-300 border-red-500/30';

            return (
              <div
                key={person.id}
                className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-amber-500/40 transition-all shadow-lg hover:shadow-2xl flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Upper Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar initial or icon */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isMale
                            ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                            : isFemale
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {person.nickname ? person.nickname.slice(0, 2) : person.fullName.slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                            {person.fullName}
                          </h4>
                          {person.nickname && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                              ({person.nickname})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              isMale
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : isFemale
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {person.gender}
                          </span>
                          <span className="text-xs text-emerald-400 font-semibold">
                            อายุ {person.age} ปี • เกิด {person.birthDateFormatted || formatThaiDate(person.birthDay, person.birthMonth, person.birthYearBE)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Zone Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${zoneBadgeClass}`}>
                      {person.zone}
                    </span>
                  </div>

                  {/* House & Occupation info */}
                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-white/5 my-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        บ้านเลขที่:
                      </span>
                      <span className="font-bold text-white text-sm">
                        {person.houseNumber} {person.moo}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        อาชีพ:
                      </span>
                      <span className="font-semibold text-slate-200">
                        {person.occupation}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        เบอร์โทร:
                      </span>
                      {person.phone && person.phone !== '-' ? (
                        <a
                          href={`tel:${person.phone}`}
                          className="font-bold text-emerald-300 hover:underline flex items-center gap-1"
                        >
                          {person.phone}
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </div>
                  </div>

                  {/* GPS & Notes */}
                  {person.latitude && person.longitude && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {person.latitude.toFixed(4)}, {person.longitude.toFixed(4)}
                      </span>
                      <a
                        href={`https://maps.google.com/?q=${person.latitude},${person.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 underline font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        ดูบนแผนที่
                      </a>
                    </div>
                  )}

                  {person.notes && (
                    <div className="text-[11px] text-slate-400 bg-white/5 p-2 rounded-xl mb-3 border border-white/5 line-clamp-2">
                      <span className="text-amber-400 font-semibold">หมายเหตุ:</span> {person.notes}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons (Edit, Add to this house, Delete) */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-1.5">
                  {/* Add member to this house button */}
                  <button
                    onClick={() => onAddMemberToHouse(person.houseNumber, person.zone)}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                    title={`เพิ่มสมาชิกในบ้านเลขที่ ${person.houseNumber}`}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                    <span>+ คนในบ้านนี้</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(person)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-white/10 transition-all"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบข้อมูลของ "${person.fullName}" หรือไม่?`)) {
                          onDelete(person.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-white/10 transition-all"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-amber-400 uppercase font-bold tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-3">เพศ/อายุ</th>
                  <th className="py-3 px-3">บ้านเลขที่</th>
                  <th className="py-3 px-3">โซน</th>
                  <th className="py-3 px-3">อาชีพ</th>
                  <th className="py-3 px-3">เบอร์โทร</th>
                  <th className="py-3 px-3">พิกัด GPS</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((person) => (
                  <tr key={person.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>{person.fullName}</div>
                      {person.nickname && (
                        <div className="text-[11px] text-slate-400">({person.nickname})</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div><span className="font-bold text-slate-200">{person.gender}</span> / {person.age} ปี</div>
                      <div className="text-[10px] text-emerald-400 font-medium">
                        {person.birthDateFormatted || formatThaiDate(person.birthDay, person.birthMonth, person.birthYearBE)}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-amber-300">
                      {person.houseNumber}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[11px]">
                        {person.zone}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{person.occupation}</td>
                    <td className="py-3 px-3">
                      {person.phone ? (
                        <a href={`tel:${person.phone}`} className="text-emerald-400 hover:underline">
                          {person.phone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {person.latitude && person.longitude ? (
                        <a
                          href={`https://maps.google.com/?q=${person.latitude},${person.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3 text-red-400" />
                          ดูแผนที่
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAddMemberToHouse(person.houseNumber, person.zone)}
                          className="p-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/40"
                          title="เพิ่มคนในบ้านนี้"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(person)}
                          className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบข้อมูลของ "${person.fullName}" หรือไม่?`)) {
                              onDelete(person.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
