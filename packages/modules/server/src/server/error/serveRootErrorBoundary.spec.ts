import Fastify from 'fastify';
import { serveRootErrorBoundary } from './serveRootErrorBoundary';

describe('serveRootErrorBoundary', () => {
  it('respond succesfully', async () => {
    const app = Fastify();
    const text = 'Error Text';

    serveRootErrorBoundary({ app, response: text });

    const response = await app.inject('/_errors/5xx');

    expect(response.body).toBe(text);
  });
});
