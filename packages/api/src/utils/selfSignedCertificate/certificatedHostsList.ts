import fs from 'fs';
import path from 'path';
import { certificateDirectoryPath } from './common';

export const certificatedHostsListFilePath = path.resolve(
  certificateDirectoryPath,
  'certificatedHostsList'
);
const separator = ',';

export const createCertificatedHostsListFile = (data: string[]) => {
  fs.writeFileSync(certificatedHostsListFilePath, data.join(separator), 'utf-8');
};

export const readCertificatedHostsListFile = (): Set<string> | null => {
  if (!fs.existsSync(certificatedHostsListFilePath)) {
    return null;
  }

  const data = fs.readFileSync(certificatedHostsListFilePath, 'utf-8');
  return new Set(data.split(separator));
};
