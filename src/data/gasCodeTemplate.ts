export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script (GAS) สำหรับระบบสำรวจ จปฐ. ประชากร หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน
 * พัฒนาโดย: นายกิตติศักดิ์ สุขช่วย (ผู้ช่วยฝ่ายปกครองหมู่ที่ 2 ตำบลคลองปราบ)
 * อำเภอบ้านนาสาร จังหวัดสุราษฎร์ธานี
 * 
 * วิธีติดตั้ง:
 * 1. เปิด Google Sheet ของท่าน
 * 2. ไปที่เมนู ส่วนขยาย (Extensions) > Apps Script
 * 3. ลบโค้ดเดิมแล้ววางโค้ดชุดนี้ลงไป
 * 4. กดปุ่ม 'ทำให้ใช้งานได้' (Deploy) > 'การทำให้ใช้งานได้รายการใหม่' (New deployment)
 * 5. เลือกประเภท: เว็บแอป (Web App)
 * 6. ช่อง 'ผู้มีสิทธิ์เข้าถึง' (Who has access): เลือก 'ทุกคน' (Anyone)
 * 7. คัดลอก Web App URL นำไปวางในหน้าตั้งค่าเว็บนี้ เพื่อเชื่อมต่อข้อมูลแบบเรียลไทม์
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // แปลงข้อมูลเป็น JSON
  var result = [];
  if (data.length > 1) {
    var headers = data[0];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      result.push(obj);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    count: result.length,
    data: result
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // สร้างหัวตารางถ้ายังไม่มี
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'id', 'fullName', 'nickname', 'gender', 'houseNumber', 'moo',
        'subdistrict', 'district', 'province', 'zone', 'phone', 'occupation',
        'birthDay', 'birthMonth', 'birthYearBE', 'birthDateFormatted', 'age',
        'latitude', 'longitude', 'notes', 'surveyDate', 'updatedAt'
      ]);
      // ปรับแต่งสีหัวตารางโทนน้ำเงินเข้มตัวอักษรสีทอง
      var headerRange = sheet.getRange(1, 1, 1, 22);
      headerRange.setBackground('#0f172a');
      headerRange.setFontColor('#f59e0b');
      headerRange.setFontWeight('bold');
    }
    
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'add';
    var record = body.data;
    
    if (action === 'add' || action === 'edit') {
      var allRows = sheet.getDataRange().getValues();
      var rowIndex = -1;
      
      // ค้นหาแถวเดิมถ้าเป็นการแก้ไข (โดยดูจาก id)
      for (var r = 1; r < allRows.length; r++) {
        if (allRows[r][0] == record.id) {
          rowIndex = r + 1;
          break;
        }
      }
      
      var rowValues = [
        record.id,
        record.fullName,
        record.nickname || '',
        record.gender,
        record.houseNumber,
        record.moo || 'หมู่ที่ 2',
        record.subdistrict || 'ตำบลกงราป',
        record.district || 'อำเภอป่าบอน',
        record.province || 'จังหวัดพัทลุง',
        record.zone,
        record.phone || '',
        record.occupation,
        record.birthDay || '',
        record.birthMonth || '',
        record.birthYearBE || '',
        record.birthDateFormatted || '',
        record.age,
        record.latitude || '',
        record.longitude || '',
        record.notes || '',
        record.surveyDate,
        new Date().toISOString()
      ];
      
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        id: record.id
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export const SPEC_PROMPT_TEXT = `[คำสั่งพรอมต์ (System & Feature Specification) สำหรับสร้างระบบสำรวจ จปฐ. ฉบับปรับปรุง]

คุณเป็นผู้เชี่ยวชาญด้านการพัฒนา Web Application ด้วย Google Apps Script (GAS), HTML, CSS (Bootstrap 5 หรือ Tailwind CSS) และ JavaScript

โปรดออกแบบและสร้างระบบ "ระบบสำรวจ จปฐ. ประชากร" 
โดยออกแบบเป็น Responsive WebApp ที่มี UX/UI สวยงาม ทันสมัย ใช้งานง่ายทั้งบนมือถือ (Mobile-first) และคอมพิวเตอร์

【 ข้อมูลพื้นที่สำรวจคงที่ 】
- ในช่อง หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน ให้ใส่ข้อมูลตามนั้นโดยไม่ต้องแก้ไข (ล็อกค่าคงที่ Read-only)

【 ธีมและโทนสีของระบบ 】
- ธีมสีหลัก: โทนน้ำเงินเข้ม (Deep Navy #0B192C / #102A4D) เสริมด้วยสีเหลืองทองสง่างาม (#F59E0B / #FACC15) และสีแดงสดตัดคมชัด (#DC2626 / #EF4444)
- รูปแบบดีไซน์: สไตล์กระจกสะท้อน (Glassmorphism) มีเลเยอร์ซ้อนกัน โปร่งแสง สะอาดตา อ่านข้อมูลง่าย มีมิติแสงเงาชัดเจน
- แผง Dashboard สรุปข้อมูลสถิติประชากร และระบบค้นหาข้อมูลอัจฉริยะ

【 รายละเอียดฟังก์ชันและช่องข้อมูลที่ต้องมี 】
1. ช่องกรอกชื่อ - นามสกุล
2. ช่องใส่ชื่อเล่น
3. ช่องเลือกเพศ (ชาย / หญิง / อื่นๆ)
4. ช่องกรอกบ้านเลขที่ (พร้อมระบบจัดกลุ่มคนในบ้านเลขที่เดียวกัน)
5. ช่องกรอกเบอร์โทรศัพท์ (มีปุ่มกดโทรออกได้ทันที)
6. ช่องเลือกอาชีพ: สร้างเป็น Dropdown เมนู (ทำสวนยางพารา, ทำสวนปาล์มน้ำมัน, สวนผลไม้เงาะ/ทุเรียน, ค้าขาย, ข้าราชการ/พนักงานรัฐ, รับจ้างทั่วไป, นักเรียน/นักศึกษา, ผู้สูงอายุ ฯลฯ)
7. วัน เดือน ปี พ.ศ. เกิด: มีตัวเลือกครบทั้ง วันที่ (1-31) เดือน (มกราคม-ธันวาคม) และปี พ.ศ. พร้อมระบบคำนวณและรันอายุปัจจุบันอัตโนมัติแบบเรียลไทม์
8. พิกัดบ้าน ละติจูด-ลองจิจูด (Latitude/Longitude): พร้อมปุ่มกดดึงพิกัดจาก GPS อัตโนมัติในคลิกเดียว และลิงก์เปิด Google Maps ดูตำแหน่งจริง
9. Dropdown เลือกโซนในพื้นที่ 3 โซนหลัก:
   - 1. โซนควนเจริญ
   - 2. โซนอนามัย
   - 3. โซนหลังสถานีรถไฟ
10. ช่องหมายเหตุอื่นๆ (สำหรับบันทึกข้อมูลเพิ่มเติม เช่น โรคประจำตัว, ผู้ป่วยติดเตียง, ความช่วยเหลือที่ต้องการ)
11. ปุ่มค้นหารายชื่อจาก Google Sheets และลิงก์เชื่อมโยงกับ Google Sheets สามารถค้นหาชื่อ นามสกุล บ้านเลขที่ เบอร์โทร ได้แบบทันที
12. ปุ่มเพิ่มข้อมูล (+) แบบ Floating Action Button (FAB): เป็นวงกลมมีเครื่องหมายบวกอยู่มุมขวาล่าง ยกสูงเหนือขึ้นไปจากปุ่มกดกลับของระบบมือถือ เพื่อให้กดใช้งานด้วยนิ้วโป้งข้างเดียวได้สะดวกที่สุดในภาคสนาม
13. ปุ่มแก้ไขข้อมูลและปุ่มเพิ่มรายชื่อสมาชิกในบ้านเลขที่เดียวกันภายหลังได้ทันทีเมื่อไปสำรวจซ้ำ
14. ไม่ต้องระบุปีงบประมาณ

【 เครดิตผู้พัฒนาระบบ 】
พัฒนาโดย: นายกิตติศักดิ์ สุขช่วย (ผู้ช่วยฝ่ายปกครองหมู่ที่ 2 ตำบลคลองปราบ) อำเภอบ้านนาสาร จังหวัดสุราษฎร์ธานี
`;
