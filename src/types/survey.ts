export type ZoneType = 'โซนควนเจริญ' | 'โซนอนามัย' | 'โซนหลังสถานีรถไฟ';

export type GenderType = 'ชาย' | 'หญิง' | 'อื่นๆ';

export interface SurveyPerson {
  id: string;
  fullName: string;          // 1. ชื่อ-นามสกุล
  nickname?: string;         // 10. ชื่อเล่น
  gender: GenderType;        // 11. เพศ (ชาย / หญิง / อื่นๆ)
  houseNumber: string;       // บ้านเลขที่
  moo: string;               // ค่าคงที่: หมู่ที่ 2
  subdistrict: string;       // ค่าคงที่: ตำบลกงราป
  district: string;          // ค่าคงที่: อำเภอป่าบอน
  province: string;          // จังหวัดพัทลุง
  phone: string;             // 2. เบอร์โทรศัพท์
  occupation: string;        // 3. อาชีพ (Dropdown)
  birthDay?: number;         // วันเกิด (1-31)
  birthMonth?: number;       // เดือนเกิด (1-12)
  birthYearBE: number;       // 4. ปี พ.ศ. เกิด (เช่น 2530)
  birthDateFormatted?: string; // วัน เดือน ปี พ.ศ. เกิด เช่น "12 เมษายน 2518"
  age: number;               // อายุปัจจุบันที่คำนวณอัตโนมัติ
  latitude?: number | null;  // 5. พิกัดละติจูด
  longitude?: number | null; // 5. พิกัดลองติจูด
  zone: ZoneType;            // 9. โซน (1.โซนควนเจริญ, 2.โซนอนามัย, 3.โซนหลังสถานีรถไฟ)
  notes?: string;            // 6. ช่องหมายเหตุอื่นๆ
  surveyDate: string;        // วันที่สำรวจ
  createdAt: string;
  updatedAt: string;
}

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const ZONES: ZoneType[] = [
  'โซนควนเจริญ',
  'โซนอนามัย',
  'โซนหลังสถานีรถไฟ',
];

export const OCCUPATIONS = [
  'ทำสวนยางพารา',
  'ทำสวนปาล์มน้ำมัน',
  'ทำสวนผลไม้ (ทุเรียน/เงาะ/มังคุด)',
  'เกษตรกรรม/ปศุสัตว์/ประมง',
  'ค้าขาย/ร้านชำ/ธุรกิจส่วนตัว',
  'รับจ้างทั่วไป/กรรมกร',
  'รับราชการ/พนักงานรัฐวิสาหกิจ',
  'พนักงานบริษัท/เอกชน',
  'นักเรียน/นักศึกษา',
  'ผู้สูงอายุ/ผู้รับเบี้ยยังชีพ/บำนาญ',
  'พ่อบ้าน/แม่บ้าน',
  'ว่างงาน',
  'อื่นๆ'
];

export interface GoogleSheetsConfig {
  sheetUrl: string;
  webAppUrl: string;
  lastSyncedAt?: string;
  autoSync: boolean;
}
