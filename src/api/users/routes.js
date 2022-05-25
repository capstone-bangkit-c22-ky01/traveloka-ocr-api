const { postUserHandler, getUserByAuthHandler, putUserByAuthHandler } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/users',
		handler: postUserHandler,
	},
	{
		method: 'GET',
		path: '/users',
		config: {
			auth: 'ocrapp_jwt',
			handler: getUserByAuthHandler,
		},
	},
	{
		method: 'PUT',
		path: '/users',
		options: {
			auth: {
				strategy: 'ocrapp_jwt',
			},
			payload: {
				allow: 'multipart/form-data',
				multipart: true,
				output: 'stream',
				maxBytes: 512000,
			},
			handler: putUserByAuthHandler,
		},
	},
];

module.exports = routes;
