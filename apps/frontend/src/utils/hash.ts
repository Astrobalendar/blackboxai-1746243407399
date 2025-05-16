import crypto from 'crypto';

export function recordHash(fullName: string, dob: string, tob: string, pob: string) {
  return crypto.createHash('sha256').update(`${fullName}|${dob}|${tob}|${pob}`).digest('hex');
}
