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
];

module.exports = routes;
