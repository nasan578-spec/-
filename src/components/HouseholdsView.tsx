import React, { useState } from 'react';
import { SurveyPerson, ZoneType } from '../types/survey';
import { 
  Home, 
  UserPlus, 
  Users, 
  MapPin, 
  Edit3, 
  Trash2, 
  Phone, 
  Search, 
  ExternalLink 
} from 'lucide-react';

interface HouseholdsViewProps {
  data: SurveyPerson[];
  onAddMemberToHouse: (houseNumber: string, zone: ZoneType) => void;
  onEdit: (person: SurveyPerson) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const HouseholdsView: React.FC<HouseholdsViewProps> = ({
  data,
  onAddMemberToHouse,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group residents by House Number
  const houseGroups = React.useMemo(() => {
    const groups: Record<string, { houseNumber: string; zone: ZoneType; members: SurveyPerson[] }> = {};

    data.forEach((person) => {
      const houseKey = person.houseNumber.trim();
      if (!groups[houseKey]) {
        groups[houseKey] = {
          houseNumber: houseKey,
          zone: person.zone,
          members: [],
        };
      }
      groups[houseKey].members.push(person);
    });

    return Object.values(groups).sort((a, b) => {
      // Natural sort by house numbers
      return a.houseNumber.localeCompare(b.houseNumber, undefined, { numeric: true });
    });
  }, [data]);

  const filteredGroups = houseGroups.filter((g) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const matchHouse = g.houseNumber.toLowerCase().includes(q);
    const matchZone = g.zone.toLowerCase().includes(q);
    const matchMember = g.members.some(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.nickname || '').toLowerCase().includes(q) ||
        m.occupation.toLowerCase().includes(q)
    );
    return matchHouse || matchZone || matchMember;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Header Bar */}
      <div className="glass-panel-elevated p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-red-500" />
            ผังทะเบียนครัวเรือนตามบ้านเลขที่
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            จัดกลุ่มประชากรตามบ้านเลขที่ เพื่อความสะดวกในการสำรวจสมาชิกในครอบครัวเพิ่มเติม (เพิ่มสมาชิกภายหลังได้ในคลิกเดียว)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาบ้านเลขที่ หรือชื่อคนในบ้าน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl glass-input text-xs w-60"
            />
          </div>
          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            + บ้านเลขที่ใหม่
          </button>
        </div>
      </div>

      {/* Houses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGroups.map((group) => {
          const firstMemberWithCoords = group.members.find((m) => m.latitude && m.longitude);

          return (
            <div
              key={group.houseNumber}
              className="glass-panel rounded-3xl border border-white/10 hover:border-amber-500/30 shadow-lg overflow-hidden flex flex-col justify-between"
            >
              {/* House Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                    <Home className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-white">
                        บ้านเลขที่ {group.houseNumber}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {group.zone}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      หมู่ที่ 2 ต.กงราป อ.ป่าบอน จ.พัทลุง
                    </span>
                  </div>
                </div>

                {/* Add member button for this specific house */}
                <button
                  onClick={() => onAddMemberToHouse(group.houseNumber, group.zone)}
                  className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="เพิ่มรายชื่อคนในบ้านเลขที่นี้"
                >
                  <UserPlus className="w-3.5 h-3.5 text-red-400" />
                  <span>+ เพิ่มคนในบ้านนี้</span>
                </button>
              </div>

              {/* Members in this House */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                  <span className="font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    สมาชิกในครัวเรือน ({group.members.length} คน)
                  </span>
                  {firstMemberWithCoords && (
                    <a
                      href={`https://maps.google.com/?q=${firstMemberWithCoords.latitude},${firstMemberWithCoords.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <MapPin className="w-3 h-3 text-red-400" />
                      พิกัด GPS บ้าน
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  {group.members.map((member, idx) => (
                    <div
                      key={member.id}
                      className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-2 hover:bg-slate-900/90 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-white/5 text-[11px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white truncate">
                              {member.fullName}
                            </span>
                            {member.nickname && (
                              <span className="text-xs text-slate-400">({member.nickname})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                            <span className="text-blue-300 font-medium">{member.gender}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{member.age} ปี ({member.birthDateFormatted || `พ.ศ. ${member.birthYearBE}`})</span>
                            <span>•</span>
                            <span className="text-slate-300 truncate">{member.occupation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {member.phone && member.phone !== '-' && (
                          <a
                            href={`tel:${member.phone}`}
                            className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40"
                            title={`โทรหา ${member.fullName}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onEdit(member)}
                          className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบข้อมูลของ "${member.fullName}" หรือไม่?`)) {
                              onDelete(member.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                          title="ลบข้อมูล"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-5 py-3 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>สำรวจแล้ว: {group.members[0]?.surveyDate || 'ล่าสุด'}</span>
                <button
                  onClick={() => onAddMemberToHouse(group.houseNumber, group.zone)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  + เพิ่มคนที่ {group.members.length + 1} ในบ้านนี้
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
