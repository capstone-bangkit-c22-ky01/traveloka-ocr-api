const { Pool } = require('pg');
const StorageService = require('../../storage/StorageService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

const pool = new Pool();

const getKtpResult = async (request, h) => {
	try {

		const { id } = request.auth.credentials

		const queryImageKtp = {
			text: 'SELECT id FROM ktps WHERE id_user = $1',
			values: [id],
		}
		
		const getIdKtp = await pool.query(queryImageKtp);
		const id_ktp = getIdKtp.rows[0].id ;
		
		const query = { 
			text: 'SELECT title, name, nationality, nik, sex, married FROM ktpresults WHERE id_ktp = $1',
			values: [id_ktp]
		}
		

		const result = await pool.query(query);
		if (!result.rows.length) {
			throw new InvariantError('Failed to get data from ktpresult');
		}

		const dataKtp = result.rows[0];
		
		if (dataKtp.sex == 'Perempuan' && dataKtp.married == 'Kawin') {
			dataKtp.title = 'Mrs';
			dataKtp.sex = 'Female';
			dataKtp.married = 'Married';
		} else if (dataKtp.sex == 'Perempuan' && dataKtp.married !== 'Kawin') {
			dataKtp.title = 'Ms';
			dataKtp.sex = 'Female';
			dataKtp.married = 'Single';
		} else if (dataKtp.sex == 'laki-laki' && dataKtp.married == 'Kawin') {
			dataKtp.title = 'Mr';
			dataKtp.sex = 'Male';
			dataKtp.married = 'Married';
		} else {
			dataKtp.title = 'Mr';
			dataKtp.sex = 'Male';
			dataKtp.married = 'Single';
		}

		const response = h.response({
			status: 'success',
			data: dataKtp,
		});
		response.code(201);
		return response;

	} catch (error) {
		if (error instanceof ClientError) {
			const response = h.response({
				status: 'fail',
				message: error.message,
			});
			response.code(error.statusCode);
			return response;
		}

		// Server ERROR!
		const response = h.response({
			status: 'error',
			message: 'Sorry, there was a failure on our server.',
		});
		response.code(500);
		console.error(error);
		return response;
	}
};

const putKtpResult = async (request, h) => {
	try {
		const { title, name, nationality, nik, sex, married } = request.payload;

		const query = {
			text: 'UPDATE ktpresults SET title=$1, name=$2, nationality=$3, nik=$4, sex=$5, married=$6 RETURNING *',
			values: [title, name, nationality, nik, sex, married],
		};

		const result = await pool.query(query);
		if (!result.rows.length) {
			throw new InvariantError('Failed to update ktpresult');
		}

		const dataKtp = result.rows;
		const response = h.response({
			status: 'success',
			data: { dataKtp },
		});
		response.code(201);
		return response;

	} catch (error) {
		if (error instanceof ClientError) {
			const response = h.response({
				status: 'fail',
				message: error.message,
			});
			response.code(error.statusCode);
			return response;
		}

		// Server ERROR!
		const response = h.response({
			status: 'error',
			message: 'Sorry, our server are busy. Please, try again later.',
		});
		response.code(500);
		console.error(error);
		return response;
	}
};

module.exports = {  getKtpResult, putKtpResult };
