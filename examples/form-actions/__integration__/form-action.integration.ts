import { expect } from '@playwright/test';
import { test } from './test-fixture';

test.describe('form-actions endpoints', () => {
  test.describe('has JS', () => {
    test('POST + json response returns OK resultCode with payload', async ({ app }) => {
      await app
        .request('/', {
          method: 'post',
          body: { responseType: 'json', username: 'TestUser' },
          contentType: 'json',
          headers: { accept: 'application/json' },
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.resultCode).toBe('OK');
          expect(res.body.payload.result).toBe('Hello, world!');
          expect(res.body.payload.username).toBe('TestUser');
        });
    });

    test('POST + redirect returns REDIRECT resultCode with nextUrl', async ({ app }) => {
      await app
        .request('/', {
          method: 'post',
          body: { responseType: 'redirect' },
          contentType: 'json',
          headers: { accept: 'application/json' },
        })
        .expect(303)
        .expect((res: any) => {
          expect(res.body.resultCode).toBe('REDIRECT');
          expect(res.body.nextUrl).toBe('/success');
        });
    });
  });

  test.describe('no JS', () => {
    test('POST + redirect returns 303 with Location header', async ({ app }) => {
      await app
        .request('/', {
          method: 'post',
          body: { responseType: 'redirect' },
          contentType: 'form',
        })
        .expect(303)
        .expect('location', '/success');
    });

    test('POST + json renders form action result in HTML response', async ({ app }) => {
      await app
        .request('/', {
          method: 'post',
          body: { responseType: 'json', username: 'NoJSUser' },
          contentType: 'form',
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('Hello, world!');
          expect(res.text).toContain('NoJSUser');
        });
    });
  });

  test.describe('schema validation', () => {
    test('valid data returns 200 with OK resultCode and payload', async ({ app }) => {
      await app
        .request('/schema-validation/', {
          method: 'post',
          body: { name: 'Alice', email: 'alice@example.com', age: 25 },
          contentType: 'json',
          headers: { accept: 'application/json' },
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.resultCode).toBe('OK');
          expect(res.body.payload.name).toBe('Alice');
          expect(res.body.payload.email).toBe('alice@example.com');
        });
    });

    test('invalid data returns 400 with ERROR resultCode', async ({ app }) => {
      await app
        .request('/schema-validation/', {
          method: 'post',
          body: { name: 'X', email: 'not-an-email', age: 10 },
          contentType: 'json',
          headers: { accept: 'application/json' },
        })
        .expect(400)
        .expect((res: any) => {
          expect(res.body.resultCode).toBe('ERROR');
        });
    });
  });
});
