import path from 'node:path';

export const certificateDirectory = 'certificates';
export const certificateDirectoryPath = path.resolve(process.cwd(), certificateDirectory);

export interface Certificate {
  keyPath: string;
  certificatePath: string;
}
