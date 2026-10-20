import React, { useState } from 'react';
import { GoogleSheetsConfig, SurveyPerson } from '../types/survey';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  UploadCloud, 
  Download, 
  Check, 
  Copy, 
  ShieldCheck, 
  Globe,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { exportToCSV, saveGoogleSheetsConfig } from '../services/storage';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/gasCodeTemplate';

interface GoogleSheetsIntegrationProps {
  config: GoogleSheetsConfig;
  onUpdateConfig: (newConfig: GoogleSheetsConfig) => void;
  data: SurveyPerson[];
  onImportData: (imported: SurveyPerson[]) => void;
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  config,
  onUpdateConfig,
  data,
  onImportData,
}) => {
  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl || '');
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedGas, setCopiedGas] = useState(false);

  const handleSaveConfig = () => {
    const updated = {
      ...config,
      sheetUrl: sheetUrl.trim(),
      webAppUrl: webAppUrl.trim(),
    };
    onUpdateConfig(updated);
    saveGoogleSheetsConfig(updated);
    setStatusMessage({ text: 'บันทึกการตั้งค่า Google Sheets เรียบร้อยแล้ว', type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCopyGas = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedGas(true);
    setTimeout(() => setCopiedGas(false), 2500);
  };

  // Pull data from GAS Web App
  const handleFetchFromSheet = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({
        text: 'กรุณากรอก Web App URL ของ Google Apps Script ก่อนดำเนินการ',
        type: 'error',
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({ text: 'กำลังเชื่อมต่อและดึงข้อมูลจาก Google Sheets...', type: 'info' });

    try {
      const response = await fetch(webAppUrl.trim(), { method: 'GET' });
      const result = await response.json();

      if (result && Array.isArray(result.data) && result.data.length > 0) {
        // Map data from sheet to SurveyPerson format
        const parsed: SurveyPerson[] = result.data.map((r: any, idx: number) => ({
          id: r.id || `sheet-${Date.now()}-${idx}`,
          fullName: r.fullName || r['ชื่อ-นามสกุล'] || '',
          nickname: r.nickname || r['ชื่อเล่น'] || '',
          gender: (r.gender || r['เพศ'] || 'ชาย') as any,
          houseNumber: String(r.houseNumber || r['บ้านเลขที่'] || ''),
          moo: r.moo || 'หมู่ที่ 2',
          subdistrict: r.subdistrict || 'ตำบลคลองปราบ',
          district: r.district || 'อำเภอบ้านนาสาร',
          province: r.province || 'จังหวัดสุราษฎร์ธานี',
          phone: String(r.phone || r['เบอร์โทร'] || ''),
          occupation: r.occupation || r['อาชีพ'] || 'เกษตรกร',
          birthYearBE: Number(r.birthYearBE || r['ปีเกิด(พ.ศ.)'] || 2530),
          age: Number(r.age || r['อายุ'] || 35),
          latitude: r.latitude ? Number(r.latitude) : null,
          longitude: r.longitude ? Number(r.longitude) : null,
          zone: (r.zone || r['โซน'] || 'โซนควนเจริญ') as any,
          notes: r.notes || r['หมายเหตุ'] || '',
          surveyDate: r.surveyDate || new Date().toISOString().slice(0, 10),
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        onImportData(parsed);
        setStatusMessage({
          text: `ดึงข้อมูลสำเร็จ! นำเข้ารายชื่อประชากรเรียบร้อยจำนวน ${parsed.length} รายการ`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: 'เชื่อมต่อได้ แต่ไม่พบข้อมูลใน Google Sheet หรือยังไม่มีแถวข้อมูล',
          type: 'info',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: 'ไม่สามารถดึงข้อมูลได้: ตรวจสอบว่า Web App URL ถูกต้อง และตั้งค่า Who has access เป็น "Anyone" หรือไม่',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Push all local data to Google Sheet
  const handlePushToSheet = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({
        text: 'กรุณากรอก Web App URL ของ Google Apps Script ก่อนส่งข้อมูล',
        type: 'error',
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({ text: 'กำลังส่งข้อมูลประชากรขึ้น Google Sheets...', type: 'info' });

    try {
      let successCount = 0;
      for (const item of data) {
        await fetch(webAppUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors', // standard for GAS web apps cross-origin POST
          body: JSON.stringify({ action: 'add', data: item }),
        });
        successCount++;
      }

      setStatusMessage({
        text: `ส่งข้อมูล จปฐ. จำนวน ${successCount} รายการไปยัง Google Sheets เรียบร้อยแล้ว`,
        type: 'success',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: 'เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง Google Apps Script',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="glass-panel-elevated p-6 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Workspace
                </span>
                <span className="text-xs text-slate-400">Google Apps Script (GAS)</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                เชื่อมต่อและค้นหาข้อมูลผ่าน Google Sheets
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                ซิงค์ข้อมูล จปฐ. ม.2 คลองปราบ ไปยัง Google Sheet ของท่านได้แบบ 2 ทาง (Two-way Sync)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportToCSV(data)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              ดาวน์โหลดไฟล์ CSV ทันที
            </button>
            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                เปิด Google Sheet จริง
              </a>
            )}
          </div>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-red-950/60 border-red-500/40 text-red-300'
                : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Configuration & Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Card */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            ตั้งค่า URL ลิงก์และ Google Apps Script
          </h4>

          {/* Sheet Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              1. ลิงก์ Google Sheet สำหรับเปิดดูข้อมูล (Google Spreadsheet URL)
            </label>
            <input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              วางลิงก์ชีตเพื่อให้ผู้สำรวจกดเปิดดูตารางสรุปใน Google Sheet ได้ในคลิกเดียว
            </span>
          </div>

          {/* Web App URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              2. URL ของเว็บแอปพลิเคชัน Google Apps Script (Web App URL)
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              ได้จากการ Deploy Apps Script เป็น Web App (เลือก Anyone has access)
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              บันทึกการตั้งค่า
            </button>
          </div>

          {/* Direct Action Buttons */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleFetchFromSheet}
              disabled={isSyncing}
              className="px-4 py-3 rounded-2xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              ดึงข้อมูลจาก Google Sheet
            </button>

            <button
              onClick={handlePushToSheet}
              disabled={isSyncing}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              ส่งข้อมูลทั้งหมด ({data.length} คน) ขึ้น Sheet
            </button>
          </div>
        </div>

        {/* Quick Instructions & GAS Script */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                โค้ด Google Apps Script พร้อมใช้
              </h4>
              <button
                onClick={handleCopyGas}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all"
              >
                {copiedGas ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    คัดลอกแล้ว!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    คัดลอกโค้ด GAS
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              นำโค้ดนี้ไปวางใน Google Sheet ของท่าน (เมนู ส่วนขยาย &gt; Apps Script) แล้วกด Deploy เป็น Web App
            </p>

            <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/10 max-h-56 overflow-y-auto text-[11px] font-mono text-slate-300 leading-relaxed scrollbar-thin">
              <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ระบบรองรับการทำงานแบบออฟไลน์ผ่าน LocalStorage หากไม่มีอินเทอร์เน็ต</span>
          </div>
        </div>
      </div>
    </div>
  );
};
