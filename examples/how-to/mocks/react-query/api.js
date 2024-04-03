const range = require('@tinkoff/utils/array/range');

module.exports = {
  api: 'FAKE_API',
  mocks: {
    'GET /api/base': {
      status: 200,
      headers: {},
      payload: 'Hello, Mock!',
    },
    'GET /api/cancel': async (req, res) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      res.status(200);
      res.send('Hello, Mock!');
    },
    'GET /api/group/test-1': {
      status: 200,
      headers: {},
      payload: 'test 1111',
    },
    'GET /api/group/test-2': {
      status: 200,
      headers: {},
      payload: 'test 2222',
    },
    'GET /api/time': (req, res) => {
      res.status(200);
      res.send(Date.now().toString());
    },
    'GET /api/auth': {
      status: 200,
      headers: {},
      payload: 'hidden api',
    },
    'GET /api/list': (() => {
      const list = range(0, 100).map((x) => `${x}^2 = ${x * x}`);

      return (req, res) => {
        const start = Number(req.query.start);
        const count = Number(req.query.count);
        const end = start + count;

        res.status(200);
        res.json({
          list: list.slice(start, end),
          nextPage: end < list.length ? end : null,
        });
      };
    })(),
    'POST /api/post': (req, res) => {
      res.status(200);

      console.log(req.body);

      res.send('post');
    },
    'GET /api/by-route': (req, res) => {
      const { route } = req.query;

      res.status(200);

      res.send(`response-${route}`);
    },
  },
};
