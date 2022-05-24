const { postKtpResult } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/ktpresult',
		handler: postKtpResult,
	},
];

module.exports = routes;
