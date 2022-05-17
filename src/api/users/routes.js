const { postUserHandler } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/users',
		handler: postUserHandler,
	},
	{
		method: 'GET',
		path: '/users/{id}',
		handler: () => {},
	},
	{
		method: 'GET',
		path: '/users',
		handler: () => {},
	},
];

module.exports = routes;
