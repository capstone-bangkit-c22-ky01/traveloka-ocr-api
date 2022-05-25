const { Pool } = require('pg');
const StorageService = require('../../storage/StorageService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const { nanoid } = require('nanoid');

const pool = new Pool();

var dummyResult = {
  'name' : 'Nanami Kento',
  'nationality' : 'Indonesia',
  'nik' : 1212112121221112,
  'gender' : 'Pria',
  'marital_status' : 'Belum Kawin',
  'id_ktp' : '12432'
};

var title, gender, marital_status;

if (dummyResult.marital_status.toUpperCase() == 'KAWIN') {
  if (dummyResult.gender.toUpperCase() == 'PRIA') {
    title = "Mr";
  } else {
    title = "Mrs";
  }
} else {
  if (dummyResult.gender.toUpperCase() == 'PRIA') {
    title = "Mr";
  } else {
    title = "Ms";
  }
}

if(dummyResult.gender.toUpperCase() == 'PRIA') {
  gender = "Male";
} else {
  gender = "Female";
}

if(dummyResult.marital_status.toUpperCase() == 'BELUM KAWIN') {
  marital_status = "Single"
} else {
  marital_status = "Married";
}

dummyResult.title = title;
dummyResult.gender = gender;
dummyResult.marital_status =marital_status;


const postKtpResult = async (request, h) => {
  try {
    const {name, nationality, nik, gender, marital_status, title, id_ktp} = dummyResult;
    
    const id_ktpresult = nanoid(16);
    
    const query = {
      text: 'INSERT INTO ktpresults VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      values: [id_ktpresult, title, name, nationality, nik, gender, marital_status, id_ktp]
    };
    
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Failed add ktpresult')
    }

    const dataKtp = result.rows;
    const response = h.response({
      status: 'success',
      data: { dataKtp },
    })
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


module.exports = { postKtpResult };