import type { FastifyInstance } from 'fastify';

export function serveRootErrorBoundary({
  response,
  app,
}: {
  response: string;
  app: FastifyInstance;
}) {
  app.register(async (instance) => {
    instance.all('/_errors/5xx', (request, reply) => {
      reply.status(200);
      reply.header('Content-Type', 'text/html; charset=utf-8');
      reply.header('Content-Length', Buffer.byteLength(response, 'utf8'));
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate');

      return response;
    });
  });
}
