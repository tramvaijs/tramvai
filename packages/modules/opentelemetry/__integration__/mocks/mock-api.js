module.exports = {
  api: 'MOCK_API',
  mocks: {
    'GET /json': (req, res) => {
      res.status(200).send({
        response: {
          headers: req.headers,
        },
      });
    },
    'GET /filtered-json': (req, res) => {
      res.status(200).send({
        response: {
          headers: req.headers,
        },
      });
    },
  },
};
