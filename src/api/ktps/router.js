const routes = [
  {
    method: 'POST',
    path: '/katepe',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
      },
    },
    handler: '#',
  },
];

module.exports = routes;