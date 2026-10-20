import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { googleSignIn, logoutGoogle } from '../services/googleAuth';
import { 
  DriveFileItem, 
  listDriveFiles, 
  uploadSurveyBackupToDrive, 
  uploadCsvToDrive,
  downloadDriveFileContent, 
  deleteDriveFile 
} from '../services/googleDriveService';
import { SurveyPerson } from '../types/survey';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  Search, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  FileText, 
  FolderArchive, 
  LogOut, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { formatThaiDate } from '../services/storage';

interface GoogleDriveViewProps {
  user: User | null;
  accessToken: string | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  currentData: SurveyPerson[];
  onRestoreData: (restored: SurveyPerson[]) => void;
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({
  user,
  accessToken,
  onLoginSuccess,
  onLogout,
  currentData,
  onRestoreData,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('จปฐ');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load files when access token is available
  useEffect(() => {
    if (accessToken) {
      loadFiles();
    }
  }, [accessToken]);

  const loadFiles = async (query = searchQuery) => {
    if (!accessToken) return;
    setIsLoadingFiles(true);
    try {
      const items = await listDriveFiles(accessToken, query);
      setFiles(items);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: 'ไม่สามารถโหลดรายการไฟล์จาก Google Drive ได้', type: 'error' });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onLoginSuccess(res.user, res.accessToken);
        setStatusMessage({ text: `เข้าสู่ระบบด้วย Google สำเร็จ: ${res.user.email}`, type: 'success' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: 'การลงชื่อเข้าใช้ Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', type: 'error' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    onLogout();
    setFiles([]);
    setStatusMessage({ text: 'ออกจากระบบ Google แล้ว', type: 'info' });
  };

  // Upload JSON backup
  const handleBackupJson = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `จปฐ_ม2_กงราป_ป่าบอน_สำรองข้อมูล_${dateStr}.json`;

    try {
      const uploaded = await uploadSurveyBackupToDrive(accessToken, fileName, currentData);
      setStatusMessage({
        text: `สำรองข้อมูล ${currentData.length} รายการ ขึ้น Google Drive สำเร็จ! (${fileName})`,
        type: 'success',
      });
      loadFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: `เกิดข้อผิดพลาดในการสำรองข้อมูล: ${err.message}`, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Upload CSV to Drive
  const handleBackupCsv = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `จปฐ_ม2_กงราป_ป่าบอน_${dateStr}.csv`;

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

    const rows = currentData.map((item, idx) => [
      idx + 1,
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
      `"${item.birthDateFormatted || formatThaiDate(item.birthDay, item.birthMonth, item.birthYearBE)}"`,
      item.age,
      item.latitude ?? '',
      item.longitude ?? '',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      item.surveyDate || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    try {
      await uploadCsvToDrive(accessToken, fileName, csvContent);
      setStatusMessage({
        text: `อัปโหลดไฟล์ตาราง ${fileName} ไปยัง Google Drive เรียบร้อยแล้ว`,
        type: 'success',
      });
      loadFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: `เกิดข้อผิดพลาดในการอัปโหลด CSV: ${err.message}`, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Restore backup from Drive file
  const handleRestoreFile = async (file: DriveFileItem) => {
    if (!accessToken) return;
    if (!confirm(`คุณต้องการนำเข้าข้อมูลจากไฟล์ "${file.name}" มาแทนที่ข้อมูลปัจจุบันหรือไม่?`)) {
      return;
    }

    try {
      const content = await downloadDriveFileContent(accessToken, file.id);
      if (content && Array.isArray(content.data) && content.data.length > 0) {
        onRestoreData(content.data);
        setStatusMessage({
          text: `นำเข้าข้อมูลจาก Google Drive สำเร็จจำนวน ${content.data.length} รายการ`,
          type: 'success',
        });
      } else {
        alert('รูปแบบไฟล์ไม่ถูกต้อง หรือไม่พบข้อมูลในไฟล์นี้');
      }
    } catch (err: any) {
      console.error(err);
      alert('ไม่สามารถดาวน์โหลดหรืออ่านไฟล์นี้ได้');
    }
  };

  // Delete file from Drive (Explicit user confirmation required by policy)
  const handleDeleteFile = async (file: DriveFileItem) => {
    if (!accessToken) return;
    const confirmed = confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ "${file.name}" ออกจาก Google Drive อย่างถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้`
    );
    if (!confirmed) return;

    try {
      await deleteDriveFile(accessToken, file.id);
      setStatusMessage({ text: `ลบไฟล์ "${file.name}" จาก Google Drive เรียบร้อยแล้ว`, type: 'success' });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err: any) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบไฟล์: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="glass-panel-elevated p-6 rounded-3xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Google Drive API
                </span>
                <span className="text-xs text-slate-400">ระบบคลาวด์และสำรองข้อมูล</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                การจัดการไฟล์และสำรองข้อมูลผ่าน Google Drive
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                เชื่อมต่อบัญชี Google ของท่านเพื่อจัดเก็บไฟล์สำรวจ จปฐ. ปลอดภัย เข้าถึงได้ทุกที่
              </p>
            </div>
          </div>

          {/* User Auth Status / Sign-in Button */}
          <div>
            {user ? (
              <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 p-2 pl-3 rounded-2xl">
                <div className="text-right">
                  <div className="text-xs font-bold text-white">{user.displayName || 'ผู้ใช้งาน Google'}</div>
                  <div className="text-[10px] text-slate-400">{user.email}</div>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-xl border border-amber-500/40" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    G
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/40 transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {/* Official Google 'G' icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Message */}
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
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {!user ? (
        /* Not logged in State */
        <div className="glass-panel p-10 rounded-3xl text-center space-y-4 border border-white/10 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
            <Cloud className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white">ลงชื่อเข้าใช้เพื่อเปิดใช้งาน Google Drive</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            เชื่อมต่อ Google Drive เพื่อสำรองข้อมูล จปฐ. ม.2 ต.กงราป อ.ป่าบอน ขึ้นสู่ระบบคลาวด์ส่วนตัวของคุณ สามารถกู้คืนข้อมูล ค้นหาไฟล์ และส่งออกตารางไปยัง Google Drive ได้ตลอดเวลา
          </p>
          <div className="pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl inline-flex items-center gap-3 transition-all"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      ) : (
        /* Logged in: Backup Actions & Drive Browser */
        <div className="space-y-6">
          {/* Quick Backup Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backup JSON */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderArchive className="w-4 h-4" />
                    สำรองข้อมูลทั้งระบบ (Full JSON Backup)
                  </span>
                  <span className="text-xs text-slate-400">{currentData.length} รายการ</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  บันทึกชุดข้อมูล จปฐ. ขึ้น Google Drive
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  บันทึกข้อมูลประชากรทั้งหมด พิกัด GPS วันเดือนปีเกิด และหมายเหตุ เป็นไฟล์สำรองปลอดภัยใน Google Drive สามารถกดกู้คืนข้อมูลได้ตลอดเวลา
                </p>
              </div>

              <button
                onClick={handleBackupJson}
                disabled={isUploading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                {isUploading ? 'กำลังอัปโหลด...' : 'สำรองข้อมูล JSON ไปยัง Drive'}
              </button>
            </div>

            {/* Backup CSV */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    ส่งออกไฟล์ตาราง (Google Sheet / CSV)
                  </span>
                  <span className="text-xs text-slate-400">สำหรับเปิดดูใน Sheet</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  ส่งออกตารางประชากรเป็นไฟล์ CSV
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  อัปโหลดไฟล์ตารางพร้อมคอลัมน์ชื่อ นามสกุล วันเดือนปีเกิด (พ.ศ.) อายุ โซน และที่อยู่ สามารถเปิดและแชร์ใน Google Drive ได้ทันที
                </p>
              </div>

              <button
                onClick={handleBackupCsv}
                disabled={isUploading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดตาราง CSV ไปยัง Drive'}
              </button>
            </div>
          </div>

          {/* Drive File Browser & Search */}
          <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  ค้นหาและเรียกดูไฟล์ใน Google Drive
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ค้นหาไฟล์สำรองข้อมูล จปฐ. หรือไฟล์เอกสารอื่นๆ ใน Google Drive ของท่าน
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="พิมพ์คำค้นหา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                    className="px-3 py-1.5 rounded-xl glass-input text-xs w-48"
                  />
                </div>
                <button
                  onClick={() => loadFiles()}
                  disabled={isLoadingFiles}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-all"
                  title="รีเฟรชไฟล์"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* File List */}
            {isLoadingFiles ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
                <p>กำลังเชื่อมต่อและดึงรายการไฟล์จาก Google Drive...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-white/5 space-y-2">
                <Cloud className="w-8 h-8 mx-auto text-slate-600" />
                <p>ไม่พบไฟล์ที่ตรงกับคำค้นหา &ldquo;{searchQuery}&rdquo;</p>
                <button
                  onClick={handleBackupJson}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  + กดสำรองข้อมูลไฟล์แรกขึ้น Google Drive ทันที
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                {files.map((file) => {
                  const isBackup = file.name.includes('.json') && file.name.includes('จปฐ');

                  return (
                    <div
                      key={file.id}
                      className="bg-slate-900/70 hover:bg-slate-900 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                          {isBackup ? <FolderArchive className="w-5 h-5 text-amber-400" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                            <span>{file.name}</span>
                            {isBackup && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                ไฟล์สำรอง จปฐ.
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>แก้ไข: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('th-TH') : '-'}</span>
                            {file.size && <span>• {(Number(file.size) / 1024).toFixed(1)} KB</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isBackup && (
                          <button
                            onClick={() => handleRestoreFile(file)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1"
                            title="กู้คืนข้อมูลสำรวจจากไฟล์นี้"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>กู้คืน</span>
                          </button>
                        )}
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                            title="เปิดดูใน Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteFile(file)}
                          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/40"
                          title="ลบไฟล์จาก Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
