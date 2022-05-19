const { postUserHandler, getUserByAuthHandler } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/users',
		handler: postUserHandler,
	},
	{
		method: 'GET',
		path: '/users',
		options: {
			auth: {
				strategies: ['ocrapp_jwt', 'google'],
			},
			handler: getUserByAuthHandler,
		},
	},
];

module.exports = routes;
