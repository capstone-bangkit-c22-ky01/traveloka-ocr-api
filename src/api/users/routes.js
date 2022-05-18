const { postUserHandler, getUserByIdHandler } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/users',
		handler: postUserHandler,
	},
	{
		method: 'GET',
		path: '/users/{id}',
		handler: getUserByIdHandler,
	},
	{
		method: 'GET',
		path: '/users',
		handler: () => {},
	},
];

module.exports = routes;
