export interface BaseParams {
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
}

export interface Certificate {
  keyPath: string;
  certificatePath: string;
}
