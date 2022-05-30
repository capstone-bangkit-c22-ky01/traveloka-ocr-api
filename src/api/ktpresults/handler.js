const { Pool } = require('pg');
const StorageService = require('../../storage/StorageService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const { nanoid } = require('nanoid');
const fs = require('fs/promises');

const pool = new Pool();

const getKtpResult = async (request, h) => {
	try {
		const dataKtpResult = await fs.readFile('src/outputKtpResult/dummyResult.json', {
			encoding: 'utf-8',
		});
		const data = JSON.parse(dataKtpResult);

		let title = 'Mr';
		if (data.sex.toLowerCase() === 'perempuan' && data.married === 'kawin') {
			title = 'Mrs';
			data.sex = 'Female';
			data.married = 'Married';
		} else if (data.sex.toLowerCase() === 'perempuan' && data.married !== 'kawin') {
			title = 'Ms';
			data.sex = 'Female';
			data.married = 'Single';
		} else if (data.sex.toLowerCase() === 'laki-laki' && data.married === 'kawin') {
			data.sex = 'Male';
			data.married = 'Married';
		} else {
			data.sex = 'Male';
			data.married = 'Single';
		}

		dataKtp = {
			...data,
			title,
		};

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

const postKtpResult = async (request, h) => {
	try {
		const id_ktpresult = nanoid(16);

		const query = {
			text: 'INSERT INTO ktpresults VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
			values: [id_ktpresult, title, name, nationality, nik, gender, marital_status, id_ktp],
		};

		const result = await pool.query(query);
		if (!result.rows.length) {
			throw new InvariantError('Failed add ktpresult');
		}

		const dataKtp = result.rows;
		const response = h.response({
			status: 'success',
			data: { dataKtpResult },
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

module.exports = { postKtpResult, getKtpResult };
