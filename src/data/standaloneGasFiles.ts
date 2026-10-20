export const STANDALONE_GAS_CODE = `/**
 * =========================================================================
 * ไฟล์: Code.gs (โค้ดฝั่งเซิร์ฟเวอร์ Google Apps Script)
 * ระบบสำรวจ จปฐ. ประชากร หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน
 * ผู้พัฒนา: นายกิตติศักดิ์ สุขช่วย (ผู้ช่วยฝ่ายปกครองหมู่ที่ 2 ตำบลคลองปราบ)
 * อำเภอบ้านนาสาร จังหวัดสุราษฎร์ธานี
 * =========================================================================
 */

// แสดงหน้าเว็บ index.html เมื่อเปิด Web App
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('ระบบสำรวจ จปฐ. ประชากร ม.2 ต.กงราป อ.ป่าบอน')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// รวมไฟล์ย่อย (ถ้ามีการแยกไฟล์)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ดึงข้อมูลประชากรทั้งหมดจาก Google Sheet
function getSurveyData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // ถ้ายังไม่มีแถวหัวตาราง ให้สร้างอัตโนมัติ
    if (sheet.getLastRow() === 0) {
      initSheetHeader(sheet);
      return [];
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var headers = data[0];
    var results = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      results.push(item);
    }
    
    return results;
  } catch (error) {
    throw new Error('ไม่สามารถดึงข้อมูลได้: ' + error.toString());
  }
}

// บันทึกหรือแก้ไขข้อมูลประชากร
function savePersonData(person) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      initSheetHeader(sheet);
    }
    
    var allData = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    // ค้นหาว่ามี id นี้อยู่แล้วหรือไม่ (ถ้ามีจะเป็นการแก้ไข)
    for (var r = 1; r < allData.length; r++) {
      if (allData[r][0] == person.id) {
        rowIndex = r + 1;
        break;
      }
    }
    
    var timestamp = new Date().toISOString();
    var rowValues = [
      person.id || ('jpth-' + Date.now()),
      person.fullName,
      person.nickname || '',
      person.gender,
      person.houseNumber,
      'หมู่ที่ 2',
      'ตำบลกงราป',
      'อำเภอป่าบอน',
      'จังหวัดพัทลุง',
      person.zone,
      person.phone || '',
      person.occupation,
      person.birthDay || '',
      person.birthMonth || '',
      person.birthYearBE || '',
      person.birthDateFormatted || '',
      person.age || 0,
      person.latitude || '',
      person.longitude || '',
      person.notes || '',
      person.surveyDate || timestamp.slice(0, 10),
      timestamp
    ];
    
    if (rowIndex > 0) {
      // แก้ไขข้อมูลเดิม
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      return { status: 'success', message: 'แก้ไขข้อมูลสำเร็จ', id: person.id };
    } else {
      // เพิ่มแถวใหม่
      sheet.appendRow(rowValues);
      return { status: 'success', message: 'บันทึกข้อมูลใหม่สำเร็จ', id: rowValues[0] };
    }
  } catch (error) {
    throw new Error('ไม่สามารถบันทึกข้อมูลได้: ' + error.toString());
  }
}

// ลบข้อมูลประชากรตาม ID
function deletePersonData(personId) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var allData = sheet.getDataRange().getValues();
    
    for (var r = 1; r < allData.length; r++) {
      if (allData[r][0] == personId) {
        sheet.deleteRow(r + 1);
        return { status: 'success', message: 'ลบข้อมูลเรียบร้อย' };
      }
    }
    return { status: 'error', message: 'ไม่พบข้อมูลที่ต้องการลบ' };
  } catch (error) {
    throw new Error('ไม่สามารถลบข้อมูลได้: ' + error.toString());
  }
}

// สร้างหัวตารางและจัดสไตล์
function initSheetHeader(sheet) {
  var headers = [
    'id', 'fullName', 'nickname', 'gender', 'houseNumber', 'moo',
    'subdistrict', 'district', 'province', 'zone', 'phone', 'occupation',
    'birthDay', 'birthMonth', 'birthYearBE', 'birthDateFormatted', 'age',
    'latitude', 'longitude', 'notes', 'surveyDate', 'updatedAt'
  ];
  sheet.appendRow(headers);
  var range = sheet.getRange(1, 1, 1, headers.length);
  range.setBackground('#0b192c');
  range.setFontColor('#f59e0b');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}
`;

export const STANDALONE_GAS_HTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ระบบสำรวจ จปฐ. ประชากร ม.2 ต.กงราป อ.ป่าบอน</title>
  
  <!-- Google Fonts: Prompt -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    body {
      font-family: 'Prompt', sans-serif;
      background: radial-gradient(circle at 15% 15%, rgba(14, 28, 54, 0.7) 0%, transparent 45%),
                  radial-gradient(circle at 85% 85%, rgba(220, 38, 38, 0.25) 0%, transparent 40%),
                  radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.12) 0%, transparent 50%),
                  #070d18;
      background-attachment: fixed;
      color: #f8fafc;
      min-height: 100vh;
    }
    
    /* สไตล์กระจกสะท้อน Glassmorphism */
    .glass-panel {
      background: rgba(14, 25, 45, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    }
    
    .glass-elevated {
      background: rgba(18, 32, 58, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.75), 0 1px 0 0 rgba(255, 255, 255, 0.15) inset;
    }
    
    .glass-input {
      background: rgba(10, 20, 36, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f1f5f9;
      transition: all 0.2s ease;
    }
    .glass-input:focus {
      background: rgba(15, 28, 50, 0.95);
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
      outline: none;
    }
  </style>
</head>
<body class="p-3 sm:p-6 pb-28">

  <!-- ================= ส่วนหัว Header & Developer Credit ================= -->
  <header class="max-w-6xl mx-auto glass-elevated rounded-3xl p-5 sm:p-6 border border-white/15 shadow-2xl mb-6 relative overflow-hidden">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ระบบสำรวจ จปฐ.
          </span>
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-white">
          ระบบสำรวจ จปฐ. ประชากร <span class="text-amber-400">หมู่ที่ 2</span>
        </h1>
        <p class="text-xs text-slate-300 mt-0.5">
          📍 ตำบลกงราป อำเภอป่าบอน จังหวัดพัทลุง
        </p>
      </div>

      <!-- ป้ายเครดิตผู้พัฒนา -->
      <div class="bg-gradient-to-r from-blue-950 via-slate-900 to-red-950 border border-amber-500/40 rounded-2xl p-3 px-4 shadow-inner">
        <div class="text-[11px] font-bold text-amber-400">ผู้พัฒนาระบบ</div>
        <div class="text-sm font-extrabold text-white">นายกิตติศักดิ์ สุขช่วย</div>
        <div class="text-[11px] text-slate-300">
          (ผู้ช่วยฝ่ายปกครองหมู่ที่ 2 ตำบลคลองปราบ) อำเภอบ้านนาสาร จังหวัดสุราษฎร์ธานี
        </div>
      </div>
    </div>

    <!-- เมนูนำทาง (แท็บ) -->
    <div class="flex items-center gap-2 mt-5 pt-3 border-t border-white/10 overflow-x-auto">
      <button onclick="switchTab('dashboard')" id="tab-btn-dashboard" class="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amber-500 text-slate-950 shadow-md">
        📊 แดชบอร์ดสถิติ
      </button>
      <button onclick="switchTab('list')" id="tab-btn-list" class="px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-300 hover:bg-white/5">
        👥 ค้นหาและรายชื่อ (<span id="count-badge">0</span>)
      </button>
      <button onclick="switchTab('households')" id="tab-btn-households" class="px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-300 hover:bg-white/5">
        🏠 ผังบ้านเลขที่ (<span id="house-badge">0</span>)
      </button>
      <button onclick="openModal()" class="ml-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md">
        + บันทึกคนใหม่
      </button>
    </div>
  </header>

  <!-- ================= หน้าหลัก Container ================= -->
  <main class="max-w-6xl mx-auto">

    <!-- แท็บ 1: แดชบอร์ดสรุปผล -->
    <section id="view-dashboard" class="space-y-6">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="glass-panel p-4 rounded-2xl border border-white/10 text-center">
          <span class="text-xs text-slate-400 block">ประชากรที่สำรวจ</span>
          <span id="stat-total" class="text-2xl sm:text-3xl font-extrabold text-amber-400">0</span>
          <span class="text-xs text-slate-400 ml-1">คน</span>
        </div>
        <div class="glass-panel p-4 rounded-2xl border border-white/10 text-center">
          <span class="text-xs text-slate-400 block">จำนวนหลังคาเรือน</span>
          <span id="stat-houses" class="text-2xl sm:text-3xl font-extrabold text-blue-400">0</span>
          <span class="text-xs text-slate-400 ml-1">หลัง</span>
        </div>
        <div class="glass-panel p-4 rounded-2xl border border-white/10 text-center">
          <span class="text-xs text-slate-400 block">ชาย / หญิง</span>
          <span id="stat-gender" class="text-xl sm:text-2xl font-bold text-white">0/0</span>
        </div>
        <div class="glass-panel p-4 rounded-2xl border border-white/10 text-center">
          <span class="text-xs text-slate-400 block">อายุเฉลี่ย</span>
          <span id="stat-avg-age" class="text-2xl sm:text-3xl font-extrabold text-emerald-400">0</span>
          <span class="text-xs text-slate-400 ml-1">ปี</span>
        </div>
      </div>

      <!-- สัดส่วน 3 โซน (1.ควนเจริญ, 2.อนามัย, 3.หลังสถานีรถไฟ) -->
      <div class="glass-elevated p-5 rounded-3xl border border-white/10">
        <h3 class="text-base font-bold text-white mb-3">📍 สัดส่วนประชากรตาม 3 โซนพื้นที่</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="zone-cards">
          <!-- จะถูกเรนเดอร์ด้วย JavaScript -->
        </div>
      </div>
    </section>

    <!-- แท็บ 2: ค้นหาและรายชื่อประชากร -->
    <section id="view-list" class="space-y-4 hidden">
      <div class="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <input type="text" id="search-input" oninput="renderList()" placeholder="🔍 ค้นหาชื่อ-นามสกุล, ชื่อเล่น, บ้านเลขที่, อาชีพ..." class="w-full sm:w-96 px-4 py-2.5 rounded-xl glass-input text-xs">
        <select id="filter-zone" onchange="renderList()" class="w-full sm:w-48 px-3 py-2.5 rounded-xl glass-input text-xs bg-slate-900">
          <option value="all">ทุกโซนพื้นที่</option>
          <option value="โซนควนเจริญ">1. โซนควนเจริญ</option>
          <option value="โซนอนามัย">2. โซนอนามัย</option>
          <option value="โซนหลังสถานีรถไฟ">3. โซนหลังสถานีรถไฟ</option>
        </select>
      </div>
      <div id="person-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- การ์ดรายชื่อจะถูกเรนเดอร์ที่นี่ -->
      </div>
    </section>

    <!-- แท็บ 3: ผังบ้านเลขที่ -->
    <section id="view-households" class="space-y-4 hidden">
      <div id="household-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- จัดกลุ่มครัวเรือนจะถูกเรนเดอร์ที่นี่ -->
      </div>
    </section>

  </main>

  <!-- ================= ปุ่มบวก Floating Action Button (FAB) มุมขวาล่าง ================= -->
  <button onclick="openModal()" class="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40 w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 hover:scale-110 active:scale-95 shadow-2xl shadow-red-600/50 flex items-center justify-center text-white text-3xl font-black ring-4 ring-amber-400/30 border border-white/20 transition-all duration-300" title="เพิ่มข้อมูล จปฐ. ใหม่">
    +
  </button>

  <!-- ================= Modal ฟอร์มบันทึกข้อมูล (Add/Edit) ================= -->
  <div id="modal-form" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden flex items-center justify-center p-3 overflow-y-auto">
    <div class="w-full max-w-xl glass-elevated rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden my-auto">
      <div class="px-5 py-3.5 bg-gradient-to-r from-blue-950 to-red-950 border-b border-white/10 flex items-center justify-between">
        <h3 id="modal-title" class="text-base font-bold text-white">บันทึกข้อมูล จปฐ. ประชากร</h3>
        <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm">✕</button>
      </div>

      <form onsubmit="handleFormSubmit(event)" class="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
        <input type="hidden" id="field-id">

        <!-- 1. ชื่อ นามสกุล ชื่อเล่น เพศ -->
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-8">
            <label class="block font-semibold text-slate-300 mb-1">ชื่อ - นามสกุล *</label>
            <input type="text" id="field-fullName" required class="w-full px-3 py-2 rounded-xl glass-input text-xs" placeholder="เช่น นายสมชาย ใจดี">
          </div>
          <div class="col-span-4">
            <label class="block font-semibold text-slate-300 mb-1">ชื่อเล่น</label>
            <input type="text" id="field-nickname" class="w-full px-3 py-2 rounded-xl glass-input text-xs" placeholder="เช่น ชาย">
          </div>
          <div class="col-span-6">
            <label class="block font-semibold text-slate-300 mb-1">เพศ *</label>
            <select id="field-gender" class="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900">
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>
          <div class="col-span-6">
            <label class="block font-semibold text-slate-300 mb-1">เบอร์โทรศัพท์</label>
            <input type="tel" id="field-phone" class="w-full px-3 py-2 rounded-xl glass-input text-xs" placeholder="เช่น 081-234-5678">
          </div>
        </div>

        <!-- 2. ข้อมูลพื้นที่คงที่ & บ้านเลขที่ & โซน -->
        <div class="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
          <div class="text-[11px] font-bold text-emerald-400">🔒 ตำแหน่งการปกครองคงที่ (ไม่ต้องแก้ไข):</div>
          <div class="grid grid-cols-3 gap-2 text-[11px] text-slate-300 font-semibold">
            <div class="bg-black/40 p-1.5 rounded-lg text-center">หมู่ที่ 2</div>
            <div class="bg-black/40 p-1.5 rounded-lg text-center">ตำบลกงราป</div>
            <div class="bg-black/40 p-1.5 rounded-lg text-center">อำเภอป่าบอน</div>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-5">
            <label class="block font-semibold text-slate-300 mb-1">บ้านเลขที่ *</label>
            <input type="text" id="field-houseNumber" required class="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-amber-300" placeholder="เช่น 12 หรือ 45/1">
          </div>
          <div class="col-span-7">
            <label class="block font-semibold text-amber-300 mb-1">โซนพื้นที่ *</label>
            <select id="field-zone" class="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold bg-slate-900">
              <option value="โซนควนเจริญ">1. โซนควนเจริญ</option>
              <option value="โซนอนามัย">2. โซนอนามัย</option>
              <option value="โซนหลังสถานีรถไฟ">3. โซนหลังสถานีรถไฟ</option>
            </select>
          </div>
        </div>

        <!-- 3. วัน เดือน ปี พ.ศ. เกิด พร้อมรันอายุปัจจุบัน -->
        <div class="p-3 rounded-2xl bg-blue-950/40 border border-amber-500/30 space-y-2">
          <div class="flex justify-between items-center">
            <label class="font-bold text-amber-300">📅 วัน เดือน ปี พ.ศ. เกิด *</label>
            <span id="calculated-age-badge" class="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 font-bold text-[11px] border border-emerald-500/40">
              อายุ 0 ปี
            </span>
          </div>
          <div class="grid grid-cols-12 gap-2">
            <div class="col-span-3">
              <span class="block text-[10px] text-slate-400">วันที่</span>
              <select id="field-birthDay" onchange="updateAge()" class="w-full px-2 py-1.5 rounded-lg glass-input text-xs bg-slate-900"></select>
            </div>
            <div class="col-span-5">
              <span class="block text-[10px] text-slate-400">เดือน</span>
              <select id="field-birthMonth" onchange="updateAge()" class="w-full px-2 py-1.5 rounded-lg glass-input text-xs bg-slate-900"></select>
            </div>
            <div class="col-span-4">
              <span class="block text-[10px] text-slate-400">ปี พ.ศ.</span>
              <select id="field-birthYearBE" onchange="updateAge()" class="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-bold text-amber-300 bg-slate-900"></select>
            </div>
          </div>
        </div>

        <!-- 4. อาชีพ -->
        <div>
          <label class="block font-semibold text-slate-300 mb-1">อาชีพ (Dropdown) *</label>
          <select id="field-occupation" class="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900">
            <option value="ทำสวนยางพารา">ทำสวนยางพารา</option>
            <option value="ทำสวนปาล์มน้ำมัน">ทำสวนปาล์มน้ำมัน</option>
            <option value="ทำสวนผลไม้ (ทุเรียน/เงาะ/มังคุด)">ทำสวนผลไม้ (ทุเรียน/เงาะ/มังคุด)</option>
            <option value="ค้าขาย/ร้านชำ/ธุรกิจส่วนตัว">ค้าขาย/ร้านชำ/ธุรกิจส่วนตัว</option>
            <option value="รับจ้างทั่วไป/กรรมกร">รับจ้างทั่วไป/กรรมกร</option>
            <option value="รับราชการ/พนักงานรัฐวิสาหกิจ">รับราชการ/พนักงานรัฐวิสาหกิจ</option>
            <option value="พนักงานบริษัท/เอกชน">พนักงานบริษัท/เอกชน</option>
            <option value="นักเรียน/นักศึกษา">นักเรียน/นักศึกษา</option>
            <option value="ผู้สูงอายุ/บำนาญ/เบี้ยยังชีพ">ผู้สูงอายุ/บำนาญ/เบี้ยยังชีพ</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <!-- 5. พิกัด GPS -->
        <div class="space-y-1">
          <div class="flex justify-between items-center">
            <label class="font-semibold text-slate-300">📍 พิกัดบ้าน (ละติจูด, ลองจิจูด)</label>
            <button type="button" onclick="getGPSLocation()" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold">
              📍 ดึงพิกัดจาก GPS
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" step="any" id="field-latitude" placeholder="ละติจูด เช่น 7.2845" class="w-full px-3 py-1.5 rounded-xl glass-input text-xs">
            <input type="number" step="any" id="field-longitude" placeholder="ลองจิจูด เช่น 100.0125" class="w-full px-3 py-1.5 rounded-xl glass-input text-xs">
          </div>
        </div>

        <!-- 6. หมายเหตุ -->
        <div>
          <label class="block font-semibold text-slate-300 mb-1">หมายเหตุอื่นๆ (สุขภาพ/กลุ่มเปราะบาง)</label>
          <textarea id="field-notes" rows="2" class="w-full p-2.5 rounded-xl glass-input text-xs" placeholder="เช่น ผู้ป่วยติดเตียง, ผู้สูงอายุต้องการความช่วยเหลือ..."></textarea>
        </div>

        <div class="pt-3 border-t border-white/10 flex justify-end gap-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">ยกเลิก</button>
          <button type="submit" class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black shadow-lg">บันทึกข้อมูล จปฐ.</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ================= JAVASCRIPT LOGIC ================= -->
  <script>
    const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const CURRENT_YEAR_BE = new Date().getFullYear() + 543;
    let surveyData = [];

    // เริ่มต้นระบบ
    window.addEventListener('DOMContentLoaded', () => {
      initDateSelectors();
      loadDataFromSheet();
    });

    // สร้างตัวเลือก วัน เดือน ปี พ.ศ.
    function initDateSelectors() {
      const daySel = document.getElementById('field-birthDay');
      for (let d = 1; d <= 31; d++) {
        daySel.innerHTML += '<option value="' + d + '">' + d + '</option>';
      }
      daySel.value = 15;

      const monthSel = document.getElementById('field-birthMonth');
      THAI_MONTHS.forEach((m, idx) => {
        monthSel.innerHTML += '<option value="' + (idx + 1) + '">' + m + '</option>';
      });
      monthSel.value = 6;

      const yearSel = document.getElementById('field-birthYearBE');
      for (let y = CURRENT_YEAR_BE; y >= 2470; y--) {
        yearSel.innerHTML += '<option value="' + y + '">พ.ศ. ' + y + '</option>';
      }
      yearSel.value = 2535;
      updateAge();
    }

    // คำนวณอายุปัจจุบันอัตโนมัติ
    function updateAge() {
      const d = parseInt(document.getElementById('field-birthDay').value);
      const m = parseInt(document.getElementById('field-birthMonth').value);
      const y = parseInt(document.getElementById('field-birthYearBE').value);

      const now = new Date();
      let age = now.getFullYear() - (y - 543);
      const curM = now.getMonth() + 1;
      const curD = now.getDate();

      if (curM < m || (curM === m && curD < d)) {
        age--;
      }
      age = Math.max(0, age);
      document.getElementById('calculated-age-badge').innerText = 'อายุ ' + age + ' ปีบริบูรณ์';
      return age;
    }

    // โหลดข้อมูลจาก Google Sheet ผ่าน google.script.run
    function loadDataFromSheet() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(data => {
            surveyData = data || [];
            updateDashboard();
            renderList();
            renderHouseholds();
          })
          .getSurveyData();
      }
    }

    // สลับแท็บหน้าจอ
    function switchTab(tab) {
      ['dashboard', 'list', 'households'].forEach(t => {
        document.getElementById('view-' + t).classList.add('hidden');
        document.getElementById('tab-btn-' + t).className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5';
      });
      document.getElementById('view-' + tab).classList.remove('hidden');
      document.getElementById('tab-btn-' + tab).className = 'px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-md';
    }

    // อัปเดตตัวเลขสถิติบนแดชบอร์ด
    function updateDashboard() {
      const total = surveyData.length;
      document.getElementById('stat-total').innerText = total;
      document.getElementById('count-badge').innerText = total;

      const houses = new Set(surveyData.map(p => (p.houseNumber || '').trim())).size;
      document.getElementById('stat-houses').innerText = houses;
      document.getElementById('house-badge').innerText = houses;

      const male = surveyData.filter(p => p.gender === 'ชาย').length;
      const female = surveyData.filter(p => p.gender === 'หญิง').length;
      document.getElementById('stat-gender').innerText = male + ' / ' + female;

      const avgAge = total > 0 ? Math.round(surveyData.reduce((acc, c) => acc + (Number(c.age) || 0), 0) / total) : 0;
      document.getElementById('stat-avg-age').innerText = avgAge;

      // 3 โซน
      const zones = ['โซนควนเจริญ', 'โซนอนามัย', 'โซนหลังสถานีรถไฟ'];
      let zoneHtml = '';
      zones.forEach(z => {
        const count = surveyData.filter(p => p.zone === z).length;
        zoneHtml += '<div class="glass-panel p-3 rounded-2xl border border-white/10 flex justify-between items-center">' +
          '<div><span class="text-xs font-bold text-white block">' + z + '</span>' +
          '<span class="text-[10px] text-slate-400">ประชากรในโซน</span></div>' +
          '<div class="text-lg font-black text-amber-400">' + count + ' คน</div>' +
          '</div>';
      });
      document.getElementById('zone-cards').innerHTML = zoneHtml;
    }

    // เรนเดอร์การ์ดรายชื่อ
    function renderList() {
      const q = (document.getElementById('search-input').value || '').toLowerCase().trim();
      const zFilter = document.getElementById('filter-zone').value;

      const filtered = surveyData.filter(p => {
        if (zFilter !== 'all' && p.zone !== zFilter) return false;
        if (!q) return true;
        return (p.fullName || '').toLowerCase().includes(q) ||
               (p.nickname || '').toLowerCase().includes(q) ||
               (p.houseNumber || '').toLowerCase().includes(q) ||
               (p.occupation || '').toLowerCase().includes(q);
      });

      let html = '';
      filtered.forEach(p => {
        html += '<div class="glass-panel p-4 rounded-3xl border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between">' +
          '<div>' +
            '<div class="flex justify-between items-start mb-2">' +
              '<div>' +
                '<h4 class="text-sm font-bold text-white">' + p.fullName + (p.nickname ? ' (' + p.nickname + ')' : '') + '</h4>' +
                '<span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">' + p.gender + '</span>' +
                '<span class="text-[11px] text-emerald-400 font-semibold ml-2">อายุ ' + p.age + ' ปี (' + (p.birthDateFormatted || ('พ.ศ.' + p.birthYearBE)) + ')</span>' +
              '</div>' +
              '<span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">' + p.zone + '</span>' +
            '</div>' +
            '<div class="bg-black/30 p-2.5 rounded-xl text-[11px] space-y-1 mb-2">' +
              '<div>🏠 บ้านเลขที่: <b class="text-white">' + p.houseNumber + '</b> ม.2 ต.กงราป อ.ป่าบอน</div>' +
              '<div>💼 อาชีพ: <span class="text-slate-300">' + p.occupation + '</span></div>' +
              (p.phone ? '<div>📞 เบอร์โทร: <a href="tel:' + p.phone + '" class="text-emerald-300 underline font-bold">' + p.phone + '</a></div>' : '') +
            '</div>' +
          '</div>' +
          '<div class="flex justify-between items-center pt-2 border-t border-white/5">' +
            '<button onclick="addMemberToHouse(\\'' + p.houseNumber + '\\', \\'' + p.zone + '\\')" class="text-[11px] text-blue-400 font-bold hover:underline">+ เพิ่มคนในบ้านนี้</button>' +
            '<div class="flex gap-1.5">' +
              '<button onclick="editPerson(\\'' + p.id + '\\')" class="px-2 py-1 rounded-lg bg-slate-800 text-amber-400 text-xs">แก้ไข</button>' +
              '<button onclick="deletePerson(\\'' + p.id + '\\')" class="px-2 py-1 rounded-lg bg-slate-800 text-red-400 text-xs">ลบ</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      });
      document.getElementById('person-list').innerHTML = html || '<div class="col-span-3 text-center text-slate-500 py-8">ไม่พบรายชื่อ</div>';
    }

    // ผังบ้านเลขที่
    function renderHouseholds() {
      const houses = {};
      surveyData.forEach(p => {
        const k = (p.houseNumber || '').trim();
        if (!houses[k]) houses[k] = { houseNumber: k, zone: p.zone, members: [] };
        houses[k].members.push(p);
      });

      let html = '';
      Object.values(houses).forEach(h => {
        let membersList = '';
        h.members.forEach((m, idx) => {
          membersList += '<div class="flex justify-between items-center text-xs bg-slate-900/60 p-2 rounded-xl mb-1">' +
            '<div>' + (idx + 1) + '. <b>' + m.fullName + '</b> (' + m.age + ' ปี) • ' + m.occupation + '</div>' +
            '<button onclick="editPerson(\\'' + m.id + '\\')" class="text-amber-400 hover:underline">แก้ไข</button>' +
          '</div>';
        });

        html += '<div class="glass-panel p-4 rounded-3xl border border-white/10">' +
          '<div class="flex justify-between items-center mb-2 pb-2 border-b border-white/5">' +
            '<h4 class="font-bold text-white text-sm">🏠 บ้านเลขที่ ' + h.houseNumber + ' (' + h.zone + ')</h4>' +
            '<button onclick="addMemberToHouse(\\'' + h.houseNumber + '\\', \\'' + h.zone + '\\')" class="px-2.5 py-1 rounded-xl bg-red-600/20 text-red-300 font-bold text-xs hover:bg-red-600/40">+ เพิ่มคนในบ้านนี้</button>' +
          '</div>' +
          membersList +
        '</div>';
      });
      document.getElementById('household-list').innerHTML = html;
    }

    // ดึงพิกัด GPS ปัจจุบัน
    function getGPSLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          document.getElementById('field-latitude').value = pos.coords.latitude.toFixed(6);
          document.getElementById('field-longitude').value = pos.coords.longitude.toFixed(6);
          alert('ดึงพิกัด GPS สำเร็จ: ' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4));
        }, err => {
          alert('ไม่สามารถอ่าน GPS ได้ กำหนดพิกัดค่าเริ่มต้นให้');
          document.getElementById('field-latitude').value = 7.2845;
          document.getElementById('field-longitude').value = 100.0125;
        });
      }
    }

    // Modal Control
    function openModal() {
      document.getElementById('field-id').value = '';
      document.getElementById('field-fullName').value = '';
      document.getElementById('field-nickname').value = '';
      document.getElementById('field-gender').value = 'ชาย';
      document.getElementById('field-houseNumber').value = '';
      document.getElementById('field-phone').value = '';
      document.getElementById('field-notes').value = '';
      document.getElementById('modal-title').innerText = 'บันทึกข้อมูล จปฐ. ประชากรใหม่';
      document.getElementById('modal-form').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('modal-form').classList.add('hidden');
    }

    function addMemberToHouse(houseNo, zone) {
      openModal();
      document.getElementById('field-houseNumber').value = houseNo;
      document.getElementById('field-zone').value = zone;
      document.getElementById('modal-title').innerText = '+ เพิ่มสมาชิกในบ้านเลขที่ ' + houseNo;
    }

    function editPerson(id) {
      const p = surveyData.find(item => item.id == id);
      if (!p) return;
      openModal();
      document.getElementById('modal-title').innerText = 'แก้ไขข้อมูล: ' + p.fullName;
      document.getElementById('field-id').value = p.id;
      document.getElementById('field-fullName').value = p.fullName || '';
      document.getElementById('field-nickname').value = p.nickname || '';
      document.getElementById('field-gender').value = p.gender || 'ชาย';
      document.getElementById('field-houseNumber').value = p.houseNumber || '';
      document.getElementById('field-phone').value = p.phone || '';
      document.getElementById('field-occupation').value = p.occupation || 'ทำสวนยางพารา';
      document.getElementById('field-zone').value = p.zone || 'โซนควนเจริญ';
      document.getElementById('field-birthDay').value = p.birthDay || 15;
      document.getElementById('field-birthMonth').value = p.birthMonth || 6;
      document.getElementById('field-birthYearBE').value = p.birthYearBE || 2535;
      document.getElementById('field-latitude').value = p.latitude || '';
      document.getElementById('field-longitude').value = p.longitude || '';
      document.getElementById('field-notes').value = p.notes || '';
      updateAge();
    }

    // Submit Form
    function handleFormSubmit(e) {
      e.preventDefault();
      const d = parseInt(document.getElementById('field-birthDay').value);
      const m = parseInt(document.getElementById('field-birthMonth').value);
      const y = parseInt(document.getElementById('field-birthYearBE').value);
      const age = updateAge();

      const person = {
        id: document.getElementById('field-id').value || ('jpth-' + Date.now()),
        fullName: document.getElementById('field-fullName').value.trim(),
        nickname: document.getElementById('field-nickname').value.trim(),
        gender: document.getElementById('field-gender').value,
        houseNumber: document.getElementById('field-houseNumber').value.trim(),
        phone: document.getElementById('field-phone').value.trim(),
        occupation: document.getElementById('field-occupation').value,
        zone: document.getElementById('field-zone').value,
        birthDay: d,
        birthMonth: m,
        birthYearBE: y,
        birthDateFormatted: d + ' ' + THAI_MONTHS[m - 1] + ' พ.ศ. ' + y,
        age: age,
        latitude: document.getElementById('field-latitude').value,
        longitude: document.getElementById('field-longitude').value,
        notes: document.getElementById('field-notes').value.trim()
      };

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(res => {
            alert(res.message);
            closeModal();
            loadDataFromSheet();
          })
          .savePersonData(person);
      } else {
        // Fallback preview
        const idx = surveyData.findIndex(item => item.id == person.id);
        if (idx >= 0) surveyData[idx] = person;
        else surveyData.unshift(person);
        updateDashboard();
        renderList();
        renderHouseholds();
        closeModal();
      }
    }

    // Delete Person
    function deletePerson(id) {
      if (!confirm('ต้องการลบข้อมูลนี้หรือไม่?')) return;
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(res => {
            alert(res.message);
            loadDataFromSheet();
          })
          .deletePersonData(id);
      } else {
        surveyData = surveyData.filter(p => p.id != id);
        updateDashboard();
        renderList();
        renderHouseholds();
      }
    }
  </script>
</body>
</html>
`;
