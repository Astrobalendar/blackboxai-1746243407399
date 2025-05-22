/// <reference lib="dom" />
/// <reference types="node" />
/// <reference lib="dom" />

import Papa from 'papaparse';
import { BatchRecord, ValidationError } from '@/types/batch-upload';

export const parseCSV = async (file: globalThis.File): Promise<BatchRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as unknown as BatchRecord[]);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
};

export const parseJSON = async (file: globalThis.File): Promise<BatchRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new globalThis.FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(Array.isArray(json) ? json : [json]);
      } catch (error) {
        reject(new Error('Invalid JSON format'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsText(file);
  });
};

export const validateBatchRecord = (record: BatchRecord, index: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!record.fullName?.trim()) {
    errors.push({
      row: index + 1,
      field: 'fullName',
      message: 'Full name is required',
    });
  }

  if (!record.birthDate) {
    errors.push({
      row: index + 1,
      field: 'birthDate',
      message: 'Birth date is required',
    });
  } else if (isNaN(Date.parse(record.birthDate))) {
    errors.push({
      row: index + 1,
      field: 'birthDate',
      message: 'Invalid date format. Use YYYY-MM-DD',
    });
  }

  if (!record.birthTime) {
    errors.push({
      row: index + 1,
      field: 'birthTime',
      message: 'Birth time is required',
    });
  } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(record.birthTime)) {
    errors.push({
      row: index + 1,
      field: 'birthTime',
      message: 'Invalid time format. Use HH:MM or HH:MM:SS',
    });
  }

  if (!record.latitude || isNaN(parseFloat(record.latitude))) {
    errors.push({
      row: index + 1,
      field: 'latitude',
      message: 'Valid latitude is required',
    });
  }

  if (!record.longitude || isNaN(parseFloat(record.longitude))) {
    errors.push({
      row: index + 1,
      field: 'longitude',
      message: 'Valid longitude is required',
    });
  }

  return errors;
};

export const validateBatchData = (data: BatchRecord[]): { valid: BatchRecord[]; errors: ValidationError[] } => {
  const valid: BatchRecord[] = [];
  const errors: ValidationError[] = [];

  data.forEach((record, index) => {
    const recordErrors = validateBatchRecord(record, index);
    if (recordErrors.length === 0) {
      valid.push(record);
    } else {
      errors.push(...recordErrors);
    }
  });

  return { valid, errors };
};
