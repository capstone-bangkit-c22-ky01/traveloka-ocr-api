const {
	getFlightsHandler,
	postFlightBookingHandler,
	getBookingByUserIdHandler,
	putBookingByIdHandler,
} = require('./handler');

const routes = [
	{
		method: 'GET',
		path: '/flights',
		handler: getFlightsHandler,
	},
	{
		method: 'POST',
		path: '/flights/booking',
		options: {
			auth: {
				strategy: 'ocrapp_jwt',
			},
			handler: postFlightBookingHandler,
		},
	},
	{
		method: 'GET',
		path: '/flights/booking',
		options: {
			auth: {
				strategy: 'ocrapp_jwt',
			},
			handler: getBookingByUserIdHandler,
		},
	},
	{
		method: 'PUT',
		path: '/flights/booking/{id}',
		options: {
			auth: {
				strategy: 'ocrapp_jwt',
			},
			handler: putBookingByIdHandler,
		},
	},
];

module.exports = routes;
