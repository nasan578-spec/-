/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SurveyPerson, GoogleSheetsConfig, ZoneType } from './types/survey';
import { 
  loadSurveyData, 
  saveSurveyData, 
  loadGoogleSheetsConfig, 
  saveGoogleSheetsConfig 
} from './services/storage';
import { User } from 'firebase/auth';
import { initAuth } from './services/googleAuth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SurveyList } from './components/SurveyList';
import { HouseholdsView } from './components/HouseholdsView';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';
import { GoogleDriveView } from './components/GoogleDriveView';
import { PromptViewer } from './components/PromptViewer';
import { SurveyModal } from './components/SurveyModal';
import { FloatingActionButton } from './components/FloatingActionButton';
import { Footer } from './components/Footer';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<SurveyPerson[]>(() => loadSurveyData());
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => loadGoogleSheetsConfig());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'households' | 'sheets' | 'drive' | 'prompt'>('dashboard');
  
  // Google Auth & Drive State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<SurveyPerson | null>(null);
  const [defaultHouseNumber, setDefaultHouseNumber] = useState<string>('');
  const [defaultZone, setDefaultZone] = useState<ZoneType | undefined>(undefined);
  
  // Cross-component Filter
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Listen to Google Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Keep LocalStorage in sync
  useEffect(() => {
    saveSurveyData(data);
  }, [data]);

  // Unique house numbers for suggestions
  const existingHouseNumbers = React.useMemo(() => {
    return Array.from(new Set(data.map((p) => p.houseNumber.trim()))).filter(Boolean);
  }, [data]);

  // Handle Add New Record
  const handleAddNew = () => {
    setEditingPerson(null);
    setDefaultHouseNumber('');
    setDefaultZone(undefined);
    setIsModalOpen(true);
  };

  // Handle Add Member to existing House
  const handleAddMemberToHouse = (houseNumber: string, zone: ZoneType) => {
    setEditingPerson(null);
    setDefaultHouseNumber(houseNumber);
    setDefaultZone(zone);
    setIsModalOpen(true);
  };

  // Handle Edit Record
  const handleEdit = (person: SurveyPerson) => {
    setEditingPerson(person);
    setDefaultHouseNumber(person.houseNumber);
    setDefaultZone(person.zone);
    setIsModalOpen(true);
  };

  // Handle Delete Record
  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((p) => p.id !== id));
    showToast('ลบข้อมูลประชากรเรียบร้อยแล้ว');
  };

  // Handle Save (Add or Update)
  const handleSave = (personData: Partial<SurveyPerson>) => {
    const now = new Date().toISOString();

    if (editingPerson) {
      // Update existing
      setData((prev) =>
        prev.map((item) =>
          item.id === editingPerson.id
            ? ({
                ...item,
                ...personData,
                updatedAt: now,
              } as SurveyPerson)
            : item
        )
      );
      showToast(`อัปเดตข้อมูลของ "${personData.fullName}" สำเร็จ`);
    } else {
      // Add new
      const newPerson: SurveyPerson = {
        id: `jpth-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fullName: personData.fullName || '',
        nickname: personData.nickname || '',
        gender: personData.gender || 'ชาย',
        houseNumber: personData.houseNumber || '',
        moo: personData.moo || 'หมู่ที่ 2',
        subdistrict: personData.subdistrict || 'ตำบลกงราป',
        district: personData.district || 'อำเภอป่าบอน',
        province: personData.province || 'จังหวัดพัทลุง',
        phone: personData.phone || '',
        occupation: personData.occupation || 'ทำสวนยางพารา',
        birthDay: personData.birthDay || 1,
        birthMonth: personData.birthMonth || 1,
        birthYearBE: personData.birthYearBE || 2530,
        birthDateFormatted: personData.birthDateFormatted || '',
        age: personData.age || 0,
        latitude: personData.latitude ?? null,
        longitude: personData.longitude ?? null,
        zone: personData.zone || 'โซนควนเจริญ',
        notes: personData.notes || '',
        surveyDate: personData.surveyDate || now.slice(0, 10),
        createdAt: now,
        updatedAt: now,
      };

      setData((prev) => [newPerson, ...prev]);
      showToast(`บันทึกข้อมูล จปฐ. ของ "${newPerson.fullName}" สำเร็จ`);
    }
    setIsModalOpen(false);
  };

  // Zone filter from Dashboard
  const handleFilterZoneFromDashboard = (zoneName: string) => {
    setSelectedZoneFilter(zoneName);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : 'bg-red-950/90 text-red-200 border-red-500/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCount={data.length}
        totalHouses={existingHouseNumbers.length}
        isDriveConnected={!!googleUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        {activeTab === 'dashboard' && (
          <Dashboard
            data={data}
            onAddNew={handleAddNew}
            onFilterZone={handleFilterZoneFromDashboard}
            onNavigateToList={() => {
              setSelectedZoneFilter(null);
              setActiveTab('list');
            }}
          />
        )}

        {activeTab === 'list' && (
          <SurveyList
            data={data}
            onAddNew={handleAddNew}
            onAddMemberToHouse={handleAddMemberToHouse}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenSheetsModal={() => setActiveTab('sheets')}
            selectedZoneFilter={selectedZoneFilter}
            onClearZoneFilter={() => setSelectedZoneFilter(null)}
          />
        )}

        {activeTab === 'households' && (
          <HouseholdsView
            data={data}
            onAddMemberToHouse={handleAddMemberToHouse}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={handleAddNew}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsIntegration
            config={sheetsConfig}
            onUpdateConfig={setSheetsConfig}
            data={data}
            onImportData={(imported) => {
              setData(imported);
              showToast(`นำเข้าข้อมูลจาก Google Sheets สำเร็จ (${imported.length} คน)`);
            }}
          />
        )}

        {activeTab === 'drive' && (
          <GoogleDriveView
            user={googleUser}
            accessToken={accessToken}
            onLoginSuccess={(u, t) => {
              setGoogleUser(u);
              setAccessToken(t);
            }}
            onLogout={() => {
              setGoogleUser(null);
              setAccessToken(null);
            }}
            currentData={data}
            onRestoreData={(restored) => {
              setData(restored);
              showToast(`กู้คืนข้อมูลจาก Google Drive สำเร็จ (${restored.length} คน)`);
            }}
          />
        )}

        {activeTab === 'prompt' && <PromptViewer />}
      </main>

      {/* Survey Add/Edit Modal */}
      <SurveyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingPerson}
        defaultHouseNumber={defaultHouseNumber}
        defaultZone={defaultZone}
        existingHouseNumbers={existingHouseNumbers}
      />

      {/* Floating Action Button (+) positioned above mobile bottom bar */}
      <FloatingActionButton onClick={handleAddNew} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
