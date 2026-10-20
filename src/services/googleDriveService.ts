import { SurveyPerson } from '../types/survey';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

/**
 * List files from Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  query?: string,
  pageSize = 30
): Promise<DriveFileItem[]> {
  let q = "trashed = false";
  if (query && query.trim()) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const url = `${DRIVE_API_URL}/files?pageSize=${pageSize}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&orderBy=modifiedTime desc&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Search specifically for survey backup files
 */
export async function listSurveyBackups(accessToken: string): Promise<DriveFileItem[]> {
  const q = "trashed = false and (name contains 'จปฐ' or name contains 'jpth')";
  const url = `${DRIVE_API_URL}/files?pageSize=20&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&orderBy=modifiedTime desc&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Upload a survey backup file (JSON) to Google Drive
 */
export async function uploadSurveyBackupToDrive(
  accessToken: string,
  fileName: string,
  surveyData: SurveyPerson[]
): Promise<DriveFileItem> {
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'ไฟล์สำรองข้อมูล จปฐ. ประชากร หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน',
  };

  const fileContent = JSON.stringify(
    {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      location: 'หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน จังหวัดพัทลุง',
      developer: 'นายกิตติศักดิ์ สุขช่วย',
      totalRecords: surveyData.length,
      data: surveyData,
    },
    null,
    2
  );

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`อัปโหลดไฟล์ไม่สำเร็จ (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Upload CSV file directly to Google Drive
 */
export async function uploadCsvToDrive(
  accessToken: string,
  fileName: string,
  csvContent: string
): Promise<DriveFileItem> {
  const metadata = {
    name: fileName,
    mimeType: 'text/csv',
    description: 'ตารางข้อมูล จปฐ. ประชากร หมู่ที่ 2 ตำบลกงราป อำเภอป่าบอน',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv; charset=UTF-8\r\n\r\n' +
    csvContent +
    closeDelimiter;

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`อัปโหลด CSV ไม่สำเร็จ (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Download and parse a backup file content from Google Drive
 */
export async function downloadDriveFileContent(
  accessToken: string,
  fileId: string
): Promise<any> {
  const url = `${DRIVE_API_URL}/files/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`ไม่สามารถดาวน์โหลดไฟล์ได้ (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete a file from Google Drive
 * (Note: Caller MUST require user confirmation dialog first)
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<boolean> {
  const url = `${DRIVE_API_URL}/files/${fileId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`ไม่สามารถลบไฟล์ได้ (${res.status})`);
  }

  return true;
}
