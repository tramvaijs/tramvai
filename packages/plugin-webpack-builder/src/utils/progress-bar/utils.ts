import { NEXT } from './const';
import { ProgressStateRequest } from './types';

export function range(len: number) {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
}

export const formatRequest = (request: ProgressStateRequest) => {
  const loaders = request.loaders.join(NEXT);

  if (loaders.length === 0) {
    return request.file || '';
  }

  return `${loaders}${NEXT}${request.file}`;
};
