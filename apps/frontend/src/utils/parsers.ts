import Papa from 'papaparse';
import XLSX from 'xlsx';
import JSZip from 'jszip';

export async function parseCSV(fileBuffer: Buffer | string): Promise<any[]> {
  const csvStr = typeof fileBuffer === 'string' ? fileBuffer : fileBuffer.toString('utf8');
  const { data } = Papa.parse(csvStr, { header: true, skipEmptyLines: true });
  return data;
}

export async function parseXLSX(fileBuffer: Buffer): Promise<any[]> {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

export async function parseJSON(fileBuffer: Buffer | string): Promise<any[]> {
  const jsonStr = typeof fileBuffer === 'string' ? fileBuffer : fileBuffer.toString('utf8');
  const data = JSON.parse(jsonStr);
  return Array.isArray(data) ? data : [data];
}

export async function parseZIP(fileBuffer: Buffer): Promise<any[]> {
  const zip = await JSZip.loadAsync(fileBuffer);
  const results: any[] = [];
  for (const filename of Object.keys(zip.files)) {
    const file = zip.files[filename];
    if (!file.dir) {
      const ext = filename.split('.').pop()?.toLowerCase();
      const buf = await file.async('nodebuffer');
      if (ext === 'csv') results.push(...await parseCSV(buf));
      else if (ext === 'xlsx') results.push(...await parseXLSX(buf));
      else if (ext === 'json') results.push(...await parseJSON(buf));
    }
  }
  return results;
}
