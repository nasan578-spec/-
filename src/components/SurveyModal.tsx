import React, { useState, useEffect } from 'react';
import { SurveyPerson, ZONES, OCCUPATIONS, THAI_MONTHS, ZoneType, GenderType } from '../types/survey';
import { calculatePreciseAge, formatThaiDate } from '../services/storage';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Briefcase, 
  Calendar, 
  Home, 
  FileText, 
  Locate, 
  Check, 
  ExternalLink,
  Sparkles,
  AlertCircle,
  Lock
} from 'lucide-react';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Partial<SurveyPerson>) => void;
  initialData?: SurveyPerson | null;
  defaultHouseNumber?: string;
  defaultZone?: ZoneType;
  existingHouseNumbers: string[];
}

export const SurveyModal: React.FC<SurveyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultHouseNumber,
  defaultZone,
  existingHouseNumbers,
}) => {
  const currentYearBE = new Date().getFullYear() + 543;

  // Fixed Location as explicitly specified by user:
  // "ในช่องหมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน ให้ใส่ข้อมูลตามนั้นโดยไม่ต้องแก้ไข"
  const FIXED_MOO = 'หมู่ที่ 2';
  const FIXED_SUBDISTRICT = 'ตำบลกงราป';
  const FIXED_DISTRICT = 'อำเภอป่าบอน';
  const FIXED_PROVINCE = 'จังหวัดพัทลุง';

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<GenderType>('ชาย');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState(OCCUPATIONS[0]);

  // วัน เดือน ปี พ.ศ. เกิด
  const [birthDay, setBirthDay] = useState<number>(1);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthYearBE, setBirthYearBE] = useState<number>(2535);
  const [calculatedAge, setCalculatedAge] = useState<number>(calculatePreciseAge(1, 1, 2535));

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [zone, setZone] = useState<ZoneType>(ZONES[0]);
  const [notes, setNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setNickname(initialData.nickname || '');
      setGender(initialData.gender || 'ชาย');
      setHouseNumber(initialData.houseNumber || '');
      setPhone(initialData.phone || '');
      setOccupation(initialData.occupation || OCCUPATIONS[0]);

      const d = initialData.birthDay || 1;
      const m = initialData.birthMonth || 1;
      const y = initialData.birthYearBE || 2535;
      setBirthDay(d);
      setBirthMonth(m);
      setBirthYearBE(y);
      setCalculatedAge(initialData.age ?? calculatePreciseAge(d, m, y));

      setLatitude(initialData.latitude ?? null);
      setLongitude(initialData.longitude ?? null);
      setZone(initialData.zone || ZONES[0]);
      setNotes(initialData.notes || '');
    } else {
      setFullName('');
      setNickname('');
      setGender('ชาย');
      setHouseNumber(defaultHouseNumber || '');
      setPhone('');
      setOccupation(OCCUPATIONS[0]);

      const defaultYear = currentYearBE - 30;
      setBirthDay(15);
      setBirthMonth(6);
      setBirthYearBE(defaultYear);
      setCalculatedAge(calculatePreciseAge(15, 6, defaultYear));

      setLatitude(null);
      setLongitude(null);
      setZone(defaultZone || ZONES[0]);
      setNotes('');
    }
    setGpsError(null);
  }, [initialData, defaultHouseNumber, defaultZone, isOpen]);

  // Recalculate age whenever day, month, or year changes
  const handleDateChange = (d: number, m: number, y: number) => {
    setBirthDay(d);
    setBirthMonth(m);
    setBirthYearBE(y);
    setCalculatedAge(calculatePreciseAge(d, m, y));
  };

  // GPS Geolocation feature
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('อุปกรณ์นี้ไม่รองรับการดึงพิกัด GPS');
      return;
    }
    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS error', err);
        setGpsError('ไม่สามารถอ่านพิกัดจาก GPS ได้ (ใช้พิกัดประมาณการ ม.2 กงราป หรือกรอกเอง)');
        if (!latitude || !longitude) {
          setLatitude(7.2845);
          setLongitude(100.0125);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    if (!houseNumber.trim()) {
      alert('กรุณากรอกบ้านเลขที่');
      return;
    }

    const formattedBirthDate = formatThaiDate(birthDay, birthMonth, birthYearBE);

    onSave({
      fullName: fullName.trim(),
      nickname: nickname.trim(),
      gender,
      houseNumber: houseNumber.trim(),
      moo: FIXED_MOO,
      subdistrict: FIXED_SUBDISTRICT,
      district: FIXED_DISTRICT,
      province: FIXED_PROVINCE,
      phone: phone.trim(),
      occupation,
      birthDay,
      birthMonth,
      birthYearBE,
      birthDateFormatted: formattedBirthDate,
      age: calculatedAge,
      latitude,
      longitude,
      zone,
      notes: notes.trim(),
      surveyDate: initialData?.surveyDate || new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  if (!isOpen) return null;

  // Generate Year options: 2470 up to currentYearBE
  const yearOptions = [];
  for (let y = currentYearBE; y >= 2470; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      {/* Modal Dialog */}
      <div 
        className="w-full max-w-2xl rounded-3xl glass-panel-elevated border border-amber-500/30 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-red-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {initialData ? 'แก้ไขข้อมูล จปฐ. ประชากร' : 'บันทึกข้อมูล จปฐ. ประชากรใหม่'}
              </h3>
              <p className="text-xs text-slate-300">
                หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน จังหวัดพัทลุง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: ชื่อ นามสกุล ชื่อเล่น เพศ */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" />
              1. ข้อมูลประจำตัว
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Full Name */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อ - นามสกุล <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมชาย พรหมศิริ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Nickname */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อเล่น
                </label>
                <input
                  type="text"
                  placeholder="เช่น ชาย, ก้อง, ปุ๊ก"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Gender */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เพศ <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ชาย', 'หญิง', 'อื่นๆ'] as GenderType[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        gender === g
                          ? g === 'ชาย'
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                            : g === 'หญิง'
                            ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                            : 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
                          : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ที่อยู่ และ ข้อมูลพื้นที่คงที่ (หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน) */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                2. ที่อยู่ และโซนพื้นที่
              </div>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                ข้อมูลพื้นที่คงที่ (ไม่ต้องแก้ไข)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* House Number (Editable) */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  บ้านเลขที่ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 12, 34/2, 105/1"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold text-amber-300"
                />
                {existingHouseNumbers.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400">บ้านที่มีอยู่แล้ว:</span>
                    {existingHouseNumbers.slice(0, 5).map(hn => (
                      <button
                        key={hn}
                        type="button"
                        onClick={() => setHouseNumber(hn)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-amber-400 border border-white/5"
                      >
                        {hn}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Zone Dropdown (3 Zones) */}
              <div className="sm:col-span-7">
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  โซนพื้นที่ (1. ควนเจริญ, 2. อนามัย, 3. หลังสถานีรถไฟ) <span className="text-red-400">*</span>
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as ZoneType)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold text-white bg-slate-900 cursor-pointer"
                >
                  {ZONES.map((z, idx) => (
                    <option key={z} value={z} className="bg-slate-900 text-white">
                      {idx + 1}. {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* Locked Fixed Location Box (User explicit requirement) */}
              <div className="sm:col-span-12 bg-slate-900/90 border border-emerald-500/30 p-3 rounded-2xl relative overflow-hidden">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>ตำแหน่งการปกครอง (กำหนดไว้คงที่ตามคำสั่ง โดยไม่ต้องแก้ไข):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block">หมู่ที่</span>
                    <span className="font-bold text-white text-xs">{FIXED_MOO}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block">ตำบล</span>
                    <span className="font-bold text-white text-xs">{FIXED_SUBDISTRICT}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block">อำเภอ</span>
                    <span className="font-bold text-white text-xs">{FIXED_DISTRICT}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block">จังหวัด</span>
                    <span className="font-bold text-white text-xs">{FIXED_PROVINCE}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: วัน เดือน ปี พ.ศ. เกิด (ครบถ้วนตามคำสั่งใหม่) & อาชีพ */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              3. วัน เดือน ปี พ.ศ. เกิด และ อาชีพ
            </div>

            {/* วัน เดือน ปี พ.ศ. เกิด 3 Dropdowns */}
            <div className="bg-gradient-to-br from-slate-900/90 to-blue-950/40 p-4 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  วัน เดือน ปี พ.ศ. เกิด <span className="text-red-400">*</span>
                </label>
                <div className="text-[11px] text-slate-300 bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-white/10">
                  {formatThaiDate(birthDay, birthMonth, birthYearBE)}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                {/* Day */}
                <div className="col-span-3 sm:col-span-3">
                  <label className="block text-[11px] text-slate-400 mb-1">วันที่</label>
                  <select
                    value={birthDay}
                    onChange={(e) => handleDateChange(Number(e.target.value), birthMonth, birthYearBE)}
                    className="w-full px-2.5 py-2 rounded-xl glass-input text-xs font-semibold text-white bg-slate-900"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="bg-slate-900 text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month */}
                <div className="col-span-5 sm:col-span-5">
                  <label className="block text-[11px] text-slate-400 mb-1">เดือน</label>
                  <select
                    value={birthMonth}
                    onChange={(e) => handleDateChange(birthDay, Number(e.target.value), birthYearBE)}
                    className="w-full px-2.5 py-2 rounded-xl glass-input text-xs font-semibold text-white bg-slate-900"
                  >
                    {THAI_MONTHS.map((mName, idx) => (
                      <option key={mName} value={idx + 1} className="bg-slate-900 text-white">
                        {mName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year BE */}
                <div className="col-span-4 sm:col-span-4">
                  <label className="block text-[11px] text-slate-400 mb-1">ปี พ.ศ.</label>
                  <select
                    value={birthYearBE}
                    onChange={(e) => handleDateChange(birthDay, birthMonth, Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl glass-input text-xs font-bold text-amber-300 bg-slate-900"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y} className="bg-slate-900 text-white">
                        พ.ศ. {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time calculated age display */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">อายุปัจจุบัน (คำนวณและรันอัตโนมัติ):</span>
                <div className="px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm flex items-center gap-1.5">
                  <span>{calculatedAge}</span>
                  <span className="text-xs font-normal text-emerald-400">ปีบริบูรณ์</span>
                </div>
              </div>
            </div>

            {/* Occupation Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                อาชีพ (Dropdown) <span className="text-red-400">*</span>
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white cursor-pointer"
              >
                {OCCUPATIONS.map((occ) => (
                  <option key={occ} value={occ} className="bg-slate-900 text-white">
                    {occ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: พิกัดบ้าน ละติจูด-ลองจิจูด + GPS */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                4. พิกัดบ้าน (ละติจูด - ลองจิจูด)
              </div>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'กำลังดึงพิกัด GPS...' : '📍 ดึงพิกัดปัจจุบันจาก GPS'}
              </button>
            </div>

            {gpsError && (
              <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">ละติจูด (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="เช่น 7.2845"
                  value={latitude ?? ''}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">ลองจิจูด (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="เช่น 100.0125"
                  value={longitude ?? ''}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            {latitude && longitude && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400 font-semibold">✓ บันทึกพิกัดแล้ว:</span>
                <span>{latitude}, {longitude}</span>
                <a
                  href={`https://maps.google.com/?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1 ml-auto"
                >
                  <ExternalLink className="w-3 h-3" />
                  เปิด Google Maps ดูตำแหน่งจริง
                </a>
              </div>
            )}
          </div>

          {/* Section 5: หมายเหตุอื่นๆ */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              5. หมายเหตุอื่นๆ (ข้อมูลสุขภาพ / ความช่วยเหลือพิเศษ / ครัวเรือน)
            </label>
            <textarea
              rows={2}
              placeholder="ระบุข้อมูลเพิ่มเติม เช่น ผู้ป่วยติดเตียง, ผู้พิการ, ผู้สูงอายุต้องการความช่วยเหลือ, เบี้ยยังชีพ, จำนวนไร่ทำกิน..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-xs leading-relaxed"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              บันทึกข้อมูล จปฐ.
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
