const { addImageKtp } = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/ktp',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
      },
    },
    handler: addImageKtp,
  },
];

module.exports = routes;