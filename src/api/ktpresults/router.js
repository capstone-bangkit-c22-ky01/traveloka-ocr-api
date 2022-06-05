const { getKtpResult, putKtpResult } = require('./handler');

const routes = [
	{
		method: 'GET',
		path: '/ktpresult',
		options: {
			auth: {
				strategy: 'ocrapp_jwt',
			},
			handler: getKtpResult,
		},
	},
	{
		method: 'PUT',
		path: '/ktpresult',
		options: {
			auth: {
				strategy: 'ocrapp_jwt',
			},
			handler: putKtpResult,
		},
	},
];

module.exports = routes;
