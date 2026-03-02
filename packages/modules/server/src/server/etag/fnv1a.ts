/* eslint-disable no-bitwise, @typescript-eslint/no-shadow */

// MIT License
//
// Copyright (c) desudesutalk (https://github.com/desudesutalk)
// Copyright (c) Travis Webb <me@traviswebb.com>
// Copyright (c) SukkaW <hi@skk.moe> (https://skk.moe)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the Software
// is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// The fnv1a implementation is created by @desudesutalk (https://github.com/desudesutalk) in
// https://github.com/tjwebb/fnv-plus/pull/9, and contributed to Travis Webb's
// "fnv-plus" library. @SukkaW (https://github.com/SukkaW) modifies it to support Buffers w/o
// sacrificing performance

/**
 * @reference https://github.com/fastify/fastify-etag/blob/main/fnv1a.js
 * Work faster than `etag` and `fnv-plus` libraries
 */
// eslint-disable-next-line max-statements
export function fnv1a(str: string | Buffer) {
  const l = str.length - 3;
  let i = 0;
  let t0 = 0;
  let v0 = 0x9dc5;

  let t1 = 0;
  let v1 = 0x811c;

  let get;

  if (str instanceof Buffer) {
    get = (i: number) => str[i];
  } else if (typeof str === 'string') {
    get = (i: number) => str.charCodeAt(i);
  } else {
    throw new TypeError('input must be a string or a buffer');
  }

  while (i < l) {
    v0 ^= get(i++);
    t0 = v0 * 403;
    t1 = v1 * 403;
    t1 += v0 << 8;
    v1 = (t1 + (t0 >>> 16)) & 65535;
    v0 = t0 & 65535;
    v0 ^= get(i++);
    t0 = v0 * 403;
    t1 = v1 * 403;
    t1 += v0 << 8;
    v1 = (t1 + (t0 >>> 16)) & 65535;
    v0 = t0 & 65535;
    v0 ^= get(i++);
    t0 = v0 * 403;
    t1 = v1 * 403;
    t1 += v0 << 8;
    v1 = (t1 + (t0 >>> 16)) & 65535;
    v0 = t0 & 65535;
    v0 ^= get(i++);
    t0 = v0 * 403;
    t1 = v1 * 403;
    t1 += v0 << 8;
    v1 = (t1 + (t0 >>> 16)) & 65535;
    v0 = t0 & 65535;
  }

  while (i < l + 3) {
    v0 ^= get(i++);
    t0 = v0 * 403;
    t1 = v1 * 403;
    t1 += v0 << 8;
    v1 = (t1 + (t0 >>> 16)) & 65535;
    v0 = t0 & 65535;
  }

  return ((v1 << 16) >>> 0) + v0;
}
