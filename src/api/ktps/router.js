const { addImageKtp } = require('./handler');
// const { replaceImageKtp } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/ktp',
		options: {
			payload: {
				output: 'stream',
				parse: true,
				multipart: true,
				maxBytes: 1000 * 1000 * 3,
			},
			auth: {
				strategies: ['ocrapp_jwt', 'google'],
			},
		},
		handler: addImageKtp,
	},
	{
		method: 'PUT',
		path: '/ktp',
		options: {
			payload: {
				output: 'stream',
				parse: true,
				multipart: true,
				maxBytes: 1000 * 1000 * 3,
			},
			auth: {
				strategies: ['ocrapp_jwt', 'google'],
			},
		},
		handler: addImageKtp,
	},
];

module.exports = routes;
