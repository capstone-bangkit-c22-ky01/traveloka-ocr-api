const {
	postAuthenticationHandler,
	putAuthenticationHandler,
	deleteAuthenticationHandler,
} = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/authentications',
		handler: postAuthenticationHandler,
	},
	{
		method: 'PUT',
		path: '/authentications',
		handler: putAuthenticationHandler,
	},
	{
		method: 'DELETE',
		path: '/authentications',
		handler: deleteAuthenticationHandler,
	},
];

module.exports = routes;
