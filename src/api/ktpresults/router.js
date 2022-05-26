const { postKtpResult, getKtpResult } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/ktpresult',
		options: {
			auth: {
				strategy: 'ocrapp_jwt',
			},
			handler: postKtpResult,
		}
	},
	{
		method: 'GET',
		path: '/ktpresult',
		handler: getKtpResult,
	},
];

module.exports = routes;
