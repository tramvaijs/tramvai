export interface ProgressStateRequest {
  file: null | string;
  loaders: string[];
}

export interface ProgressState {
  start: [number, number] | null;
  progress: number;
  done: boolean;
  message: string;
  details: string[];
  request: null | ProgressStateRequest;
  hasErrors: boolean;
  color: string;
  name: string;
}
