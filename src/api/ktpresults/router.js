const { getKtpResultsByIdHandler, editKtpResultByIdHandler, deleteKtpResultByIdHandler } = require ('./handler');

const routes = [
  {
		method: 'GET',
		path: '/ktpresult/{id}',
		handler: getKtpResultsByIdHandler,
  },
  {
		method: 'PUT',
		path: '/ktpresult/{id}',
		handler: editKtpResultByIdHandler,
  },
  {
		method: 'DELETE',
		path: '/ktpresult/{id}',
		handler: deleteKtpResultByIdHandler,
  },
];

module.exports = { routes };