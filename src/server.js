require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

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

	await server.register(Jwt);

	server.auth.strategy('ocrapp_jwt', 'jwt', {
		keys: process.env.ACCESS_TOKEN_KEY,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: process.env.ACCESS_TOKEN_AGE,
		},
		validate: (artifacts) => ({
			isValid: true,
			credentials: {
				id: artifacts.decoded.payload.id,
			},
		}),
	});

	server.route(routesUsers);
	server.route(authenticationsRoutes);

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
