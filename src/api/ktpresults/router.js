const { postKtpResult, getKtpResult } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/ktpresult',
		handler: postKtpResult,
	},
	{
		method: 'GET',
		path: '/ktpresult',
		handler: getKtpResult,
	},
];

module.exports = routes;
