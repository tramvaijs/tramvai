import type { FastifyInstance } from 'fastify';

export function serveRootErrorBoundary({
  render,
  app,
}: {
  render: () => Promise<string>;
  app: FastifyInstance;
}) {
  // Error page is static so we can cache it
  let response: string;

  // Warm up error page on startup
  setTimeout(() => {
    if (!response) {
      // eslint-disable-next-line promise/catch-or-return
      render().then((res) => {
        response = res;
      });
    }
  }, 0);

  app.register(async (instance) => {
    instance.all('/_errors/5xx', async (request, reply) => {
      if (!response) {
        response = await render();
      }

      reply.status(200);
      reply.header('Content-Type', 'text/html; charset=utf-8');
      reply.header('Content-Length', Buffer.byteLength(response, 'utf8'));
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate');

      return response;
    });
  });
}
