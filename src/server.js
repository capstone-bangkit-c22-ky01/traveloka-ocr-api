require('dotenv').config();

const Hapi = require('@hapi/hapi');

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

	server.route({
		method: 'GET',
		path: '/',
		handler: (request, h) => {
			const response = h.response({
				status: 'success',
				message: 'Server jalan ges',
			});
			return response;
		},
	});

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
