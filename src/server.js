require('dotenv').config();

const Hapi = require('@hapi/hapi');

// users
const routesUsers = require('./api/users/routes');

//authentications
const authenticationsRoutes = require('./api/authentications/routes');

const init = async () => {
	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	});

	server.route(routesUsers);
	server.route(authenticationsRoutes);

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
