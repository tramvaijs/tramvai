import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import type { Certificate } from '../../types/base';
import { getHosts } from './getHosts';
import { certificateDirectoryPath, certificateDirectory } from './common';
import {
  createCertificatedHostsListFile,
  readCertificatedHostsListFile,
} from './certificatedHostsList';

interface CreateSelfSignedCertificateOptions {
  host?: string;
  keyPath?: string;
  certificatePath?: string;
}

// eslint-disable-next-line max-statements
export const createSelfSignedCertificate = (
  options: CreateSelfSignedCertificateOptions
): Certificate => {
  try {
    const { host } = options;
    const hosts = getHosts(host === '0.0.0.0' ? null : host);
    const hostsFile = readCertificatedHostsListFile();

    const defaultKeyPath = path.resolve(certificateDirectoryPath, 'localhost-key.pem');
    const defaultCertificatePath = path.resolve(certificateDirectoryPath, 'localhost.pem');

    const keyPath = options.keyPath ? path.resolve(options.keyPath) : defaultKeyPath;
    const certificatePath = options.certificatePath
      ? path.resolve(options.certificatePath)
      : defaultCertificatePath;

    // check if certificates are already generated, in this case we simply skip step

    const isExternalCertificateProvided = options.certificatePath && options.keyPath;

    const isCertificateAlreadyExist =
      !isExternalCertificateProvided &&
      fs.existsSync(keyPath) &&
      fs.existsSync(certificatePath) &&
      hostsFile &&
      hosts.every((h) => hostsFile.has(h));

    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    if (
      fs.existsSync(gitignorePath) &&
      !fs.readFileSync(gitignorePath, 'utf-8').includes(certificateDirectory)
    ) {
      fs.appendFileSync(gitignorePath, `\n${certificateDirectory}`);
    }

    if (isExternalCertificateProvided || isCertificateAlreadyExist) {
      console.log(
        chalk.blue(
          'Certificates for https environment are already exist, skipping step with certificate generation'
        )
      );

      return {
        keyPath,
        certificatePath,
      };
    }

    fs.mkdirSync(certificateDirectoryPath, { recursive: true });
    createCertificatedHostsListFile(hosts);

    // TODO: maybe it is better to install mkcert for users for better dx
    // check https://github.com/liuweiGL/vite-plugin-mkcert/blob/main/plugin/index.ts and https://github.com/vercel/next.js/blob/28fdc367b1f6d41245ea036bc40d1035a8a4d0e4/packages/next/src/lib/mkcert.ts#L68
    execSync(
      `mkcert -install -key-file "${keyPath}" -cert-file "${certificatePath}" ${hosts.join(' ')}`
    );

    if (!fs.existsSync(keyPath) || !fs.existsSync(certificatePath)) {
      throw new Error(
        'Error occured while certificate creation. Generated certificate files not found'
      );
    }

    const CAROOTFileLocation = execSync('mkcert -CAROOT').toString().trim();

    console.log(chalk.green(`Root certificate located in ${chalk.blue(CAROOTFileLocation)}`));

    return {
      keyPath,
      certificatePath,
    };
  } catch (error) {
    console.error(
      chalk.red(
        `Error while generating the certificate. The mkcert tool may not be installed please check and install it if that is the case.`
      )
    );
    throw new Error(error);
  }
};
