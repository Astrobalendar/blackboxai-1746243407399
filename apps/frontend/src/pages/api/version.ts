import type { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let commit = '';
  let timestamp = '';
  try {
    commit = execSync('git rev-parse HEAD').toString().trim();
    timestamp = execSync('git log -1 --format=%cd --date=iso-strict').toString().trim();
  } catch (e) {
    commit = 'unknown';
    timestamp = new Date().toISOString();
  }
  res.status(200).json({ commit, timestamp });
}
