import { GoogleSheetsConfig, SurveyPerson, THAI_MONTHS } from '../types/survey';
import { INITIAL_SURVEY_DATA } from '../data/initialData';

const STORAGE_KEY = 'jpth_m2_gongrap_data_v2';
const CONFIG_KEY = 'jpth_m2_gongrap_config_v2';

export function formatThaiDate(day?: number, month?: number, yearBE?: number): string {
  if (!yearBE) return '-';
  const d = day ? `${day} ` : '';
  const m = month && month >= 1 && month <= 12 ? `${THAI_MONTHS[month - 1]} ` : '';
  return `${d}${m}พ.ศ. ${yearBE}`.trim();
}

export function calculatePreciseAge(day?: number, month?: number, yearBE?: number): number {
  if (!yearBE || isNaN(yearBE)) return 0;
  
  const now = new Date();
  const currentYearCE = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();

  const birthYearCE = yearBE - 543;
  let age = currentYearCE - birthYearCE;

  if (month) {
    if (currentMonth < month) {
      age--;
    } else if (currentMonth === month && day && currentDay < day) {
      age--;
    }
  }

  return Math.max(0, age);
}

export function loadSurveyData(): SurveyPerson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveSurveyData(INITIAL_SURVEY_DATA);
      return INITIAL_SURVEY_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SURVEY_DATA;
  } catch (err) {
    console.error('Failed to load survey data from localStorage', err);
    return INITIAL_SURVEY_DATA;
  }
}

export function saveSurveyData(data: SurveyPerson[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save survey data to localStorage', err);
  }
}

export function loadGoogleSheetsConfig(): GoogleSheetsConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1ExampleGoogleSheetForJpthM2Gongrap/edit',
    webAppUrl: '',
    autoSync: false,
  };
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error(e);
  }
}

export function exportToCSV(data: SurveyPerson[]): void {
  const headers = [
    'ลำดับ',
    'ชื่อ-นามสกุล',
    'ชื่อเล่น',
    'เพศ',
    'บ้านเลขที่',
    'หมู่ที่',
    'ตำบล',
    'อำเภอ',
    'จังหวัด',
    'โซน',
    'เบอร์โทรศัพท์',
    'อาชีพ',
    'วัน เดือน ปี พ.ศ. เกิด',
    'อายุ(ปี)',
    'ละติจูด',
    'ลองติจูด',
    'หมายเหตุ',
    'วันที่สำรวจ'
  ];

  const rows = data.map((item, index) => {
    const birthText = item.birthDateFormatted || formatThaiDate(item.birthDay, item.birthMonth, item.birthYearBE);
    const calculatedAge = item.age ?? calculatePreciseAge(item.birthDay, item.birthMonth, item.birthYearBE);

    return [
      index + 1,
      `"${item.fullName || ''}"`,
      `"${item.nickname || ''}"`,
      `"${item.gender || ''}"`,
      `"${item.houseNumber || ''}"`,
      `"${item.moo || 'หมู่ที่ 2'}"`,
      `"${item.subdistrict || 'ตำบลกงราป'}"`,
      `"${item.district || 'อำเภอป่าบอน'}"`,
      `"${item.province || 'จังหวัดพัทลุง'}"`,
      `"${item.zone || ''}"`,
      `"${item.phone || ''}"`,
      `"${item.occupation || ''}"`,
      `"${birthText}"`,
      calculatedAge,
      item.latitude ?? '',
      item.longitude ?? '',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      item.surveyDate || ''
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `จปฐ_ม2_กงราป_ป่าบอน_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
