export interface BaseBatchRecord {
  fullName: string;
  birthDate: string;
  birthTime: string;
  latitude: string | number;
  longitude: string | number;
  [key: string]: any; // For additional fields
}

export interface BatchRecord extends BaseBatchRecord {
  rowIndex: number;
  status: 'pending' | 'success' | 'failed' | 'duplicate';
  message?: string;
  errors?: ValidationError[];
}

export interface BatchSummary {
  total: number;
  valid: number;
  invalid: number;
  uploaded: number;
  failed: number;
  skipped: number;
  duplicates: number;
  errors: ValidationError[];
  records: BatchRecord[];
  timestamp?: Date;
  duration?: string;
}

export type StepType = 'upload' | 'validate' | 'submit' | 'done';

export interface UploadHistoryItem {
  id: string;
  filename: string;
  status: 'completed' | 'failed' | 'processing';
  timestamp: Date;
  records: number;
  errors: number;
  duplicateCount: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface UploadProgress {
  total: number;
  processed: number;
  percentage: number;
  status: 'idle' | 'parsing' | 'validating' | 'uploading' | 'completed' | 'error';
  errors: ValidationError[];
}
