import os from 'os';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import { createSelfSignedCertificate } from './createSelfSignedCertificate';
import { certificatedHostsListFilePath } from './certificatedHostsList';
import { certificateDirectoryPath } from './common';

const defaultKeyPath = path.resolve(certificateDirectoryPath, 'localhost-key.pem');
const defaultCertificatePath = path.resolve(certificateDirectoryPath, 'localhost.pem');
const gitignorePath = path.resolve(process.cwd(), '.gitignore');
const customHost = 'localhost.domain.com';

jest.mock('os', () => {
  return {
    networkInterfaces: (param: string) => {
      return [];
    },
  };
});

const existsSyncSpy = jest.spyOn(fs, 'existsSync');
const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync');
const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync');
const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
const execSyncSpy = jest.spyOn(child_process, 'execSync');
const appendFileSyncSpy = jest.spyOn(fs, 'appendFileSync');

describe('shared/utils/selfSignedCertificate', () => {
  beforeEach(() => {
    writeFileSyncSpy.mockImplementation(() => undefined);
    mkdirSyncSpy.mockImplementation(() => {
      return undefined;
    });
    execSyncSpy.mockImplementation((command) => {
      if (command === 'mkcert -CAROOT') return '/location';
      return '';
    });

    readFileSyncSpy.mockImplementation((path) => {
      if (path === gitignorePath) return '';
      return `localhost,${customHost}`;
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
    existsSyncSpy.mockReset();
    mkdirSyncSpy.mockReset();
    writeFileSyncSpy.mockReset();
    execSyncSpy.mockReset();
  });
  it('should generate certificate', async () => {
    existsSyncSpy.mockImplementation((path) => {
      if (path === certificatedHostsListFilePath || path === gitignorePath) {
        return false;
      }
      return true;
    });

    const result = createSelfSignedCertificate({});

    expect(execSyncSpy).toHaveBeenNthCalledWith(
      1,
      `mkcert -install -key-file "${defaultKeyPath}" -cert-file "${defaultCertificatePath}" localhost`
    );

    expect(result).toEqual({
      keyPath: defaultKeyPath,
      certificatePath: defaultCertificatePath,
    });
  });
  it('should generate certificate for provided host', async () => {
    existsSyncSpy.mockImplementation((path) => {
      if (path === certificatedHostsListFilePath || path === gitignorePath) {
        return false;
      }
      return true;
    });
    const result = createSelfSignedCertificate({ host: customHost });
    expect(execSyncSpy).toHaveBeenNthCalledWith(
      1,
      `mkcert -install -key-file "${defaultKeyPath}" -cert-file "${defaultCertificatePath}" localhost ${customHost}`
    );
    expect(result).toEqual({
      keyPath: defaultKeyPath,
      certificatePath: defaultCertificatePath,
    });
  });

  it('should return already existed certificate if it was generated previously', async () => {
    existsSyncSpy.mockImplementation((path) => {
      if (path === gitignorePath) {
        return false;
      }
      return true;
    });
    const result = createSelfSignedCertificate({ host: customHost });
    expect(execSyncSpy).toHaveBeenCalledTimes(0);

    expect(result).toEqual({
      keyPath: defaultKeyPath,
      certificatePath: defaultCertificatePath,
    });
  });

  it('should use custom certificate if provided', () => {
    const customCertificate = {
      certificatePath: path.resolve('path-to-custom-certificate/cert.pem'),
      keyPath: path.resolve('path-to-custom-certificate/key.pem'),
    };
    const result = createSelfSignedCertificate({
      host: customHost,
      ...customCertificate,
    });

    expect(execSyncSpy).toHaveBeenCalledTimes(0);

    expect(result).toEqual({
      keyPath: customCertificate.keyPath,
      certificatePath: customCertificate.certificatePath,
    });
  });
  it('if a new host be provided, a new certificate should be generated even if a certificate already exists.', () => {
    existsSyncSpy.mockImplementation((path) => {
      if (path === gitignorePath) {
        return false;
      }
      return true;
    });
    const result = createSelfSignedCertificate({ host: 'new.localhost.domain' });
    expect(execSyncSpy).toHaveBeenNthCalledWith(
      1,
      `mkcert -install -key-file "${defaultKeyPath}" -cert-file "${defaultCertificatePath}" localhost new.localhost.domain`
    );

    expect(result).toEqual({
      keyPath: defaultKeyPath,
      certificatePath: defaultCertificatePath,
    });
  });
  it('should add certificates folder to .gitignore if .gitignore file exist', () => {
    existsSyncSpy.mockImplementation((path) => {
      return true;
    });
    const result = createSelfSignedCertificate({ host: 'new.localhost.domain' });
    expect(appendFileSyncSpy).toBeCalledTimes(1);

    expect(result).toEqual({
      keyPath: defaultKeyPath,
      certificatePath: defaultCertificatePath,
    });
  });
});
