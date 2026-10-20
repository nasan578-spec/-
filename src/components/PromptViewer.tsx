import React, { useState } from 'react';
import { SPEC_PROMPT_TEXT, GOOGLE_APPS_SCRIPT_CODE } from '../data/gasCodeTemplate';
import { STANDALONE_GAS_HTML } from '../data/standaloneGasFiles';
import { 
  Code2, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  Layers,
  FileCode,
  Download
} from 'lucide-react';

export const PromptViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'html' | 'code' | 'prompt'>('html');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedGas, setCopiedGas] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(STANDALONE_GAS_HTML);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleCopyGas = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedGas(true);
    setTimeout(() => setCopiedGas(false), 2500);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(SPEC_PROMPT_TEXT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Info */}
      <div className="glass-panel-elevated p-6 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Google Apps Script (GAS) WebApp Pack
                </span>
                <span className="text-xs text-slate-400">ชุดโค้ด 2 ไฟล์พร้อมใช้</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                ชุดโค้ด: 1. อินเด็กซ์และจาวาสคริปต์ & 2. โค้ดเซิร์ฟเวอร์
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                สามารถคัดลอกไปวางใน Google Apps Script (ส่วนขยาย &gt; Apps Script ใน Google Sheet) เพื่อเปิด Web App ได้ทันที
              </p>
            </div>
          </div>

          {/* Subtabs Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveSubTab('html')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'html'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              1. index.html (พร้อม JS)
            </button>
            <button
              onClick={() => setActiveSubTab('code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'code'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              2. Code.gs (โค้ด)
            </button>
            <button
              onClick={() => setActiveSubTab('prompt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'prompt'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              3. คำสั่งพรอมต์
            </button>
          </div>
        </div>
      </div>

      {/* Content depending on Active Sub Tab */}

      {/* Tab 1: index.html (HTML + JavaScript) */}
      {activeSubTab === 'html' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">
                  1. ไฟล์ index.html (หน้าเว็บอินเด็กซ์และจาวาสคริปต์ในตัว)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                สร้างไฟล์ชื่อ <b className="text-amber-400">index.html</b> ใน Google Apps Script แล้ววางโค้ดชุดนี้ลงไป (รวม HTML, CSS สไตล์กระจกสะท้อน, และ JavaScript ควบคุมระบบไว้ครบในไฟล์เดียว)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadFile('index.html', STANDALONE_GAS_HTML, 'text/html')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1.5"
                title="ดาวน์โหลดไฟล์ index.html"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                ดาวน์โหลดไฟล์
              </button>
              <button
                onClick={handleCopyHtml}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-4 h-4" />
                    คัดลอก index.html แล้ว!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    คัดลอก index.html ทั้งหมด
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-white/10 max-h-[550px] overflow-y-auto text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed scrollbar-thin">
            {STANDALONE_GAS_HTML}
          </div>
        </div>
      )}

      {/* Tab 2: Code.gs (Server-side Google Apps Script) */}
      {activeSubTab === 'code' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h4 className="text-base font-bold text-white">
                  2. ไฟล์ Code.gs (โค้ดฝั่งเซิร์ฟเวอร์ของ Google Apps Script)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                วางในไฟล์ <b className="text-blue-400">Code.gs</b> ใน Google Apps Script ทำหน้าที่รับ-ส่งข้อมูลกับ Google Sheet
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadFile('Code.gs', GOOGLE_APPS_SCRIPT_CODE, 'text/plain')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1.5"
                title="ดาวน์โหลดไฟล์ Code.gs"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                ดาวน์โหลดไฟล์
              </button>
              <button
                onClick={handleCopyGas}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all"
              >
                {copiedGas ? (
                  <>
                    <Check className="w-4 h-4" />
                    คัดลอก Code.gs แล้ว!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    คัดลอก Code.gs ทั้งหมด
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-white/10 max-h-[550px] overflow-y-auto text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed scrollbar-thin">
            {GOOGLE_APPS_SCRIPT_CODE}
          </div>
        </div>
      )}

      {/* Tab 3: Prompt Specification */}
      {activeSubTab === 'prompt' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-white">
                3. คำสั่งพรอมต์ตามข้อกำหนด (Prompt Specification)
              </h4>
            </div>
            <button
              onClick={handleCopyPrompt}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-4 h-4" />
                  คัดลอกแล้ว!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  คัดลอกคำสั่งพรอมต์
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-white/10 max-h-[550px] overflow-y-auto text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed scrollbar-thin">
            {SPEC_PROMPT_TEXT}
          </div>
        </div>
      )}
    </div>
  );
};
