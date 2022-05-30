require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Bell = require('@hapi/bell');
const Inert = require('@hapi/inert');

// users
const routesUsers = require('./api/users/routes');
// authentications
const routesAuth = require('./api/authentications/routes');
// flights
const routeFlights = require('./api/flights/routes');
// ktpresults
const routesKtpResults = require('./api/ktpresults/router');
// ktps
const routesKtps = require('./api/ktps/router');

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

	await server.register([
		{
			plugin: Jwt,
		},
		{
			plugin: Bell,
		},
		{
			plugin: Inert,
		},
	]);

	// Declare an authentication strategy using jwt scheme
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

	// Declare an authentication strategy using Bell scheme
	server.auth.strategy('google', 'bell', {
		provider: 'google',
		password: 'cookie_encryption_password_secure',
		clientId: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		isSecure: process.env.NODE_ENV === 'production',
		location: server.info.uri,
	});

	server.route(routesUsers);
	server.route(routesAuth);
	server.route(routeFlights);
	server.route(routesKtpResults);
	server.route(routesKtps);

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
