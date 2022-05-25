const { Pool } = require('pg');
const StorageService = require('../../storage/StorageService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const { nanoid } = require('nanoid');
const fs = require('fs');

const pool = new Pool();

function ktpResult() {
  try {
    // read ktp result data from json
    const ktpResultJson = fs.readFileSync('../../outputKtpResult/dummyResult.json', 'utf-8');
    const dataKtpResult = JSON.parse(ktpResultJson)

    if (dataKtpResult.marital_status.toUpperCase() == ' BELUM KAWIN') {
      if (dataKtpResult.gender.toUpperCase() == 'PRIA') {
        dataKtpResult.title = "Mr";
      } else {
        dataKtpResult.title = "Mr";
      }
    } else {
      if (dataKtpResult.gender.toUpperCase() == 'PRIA') {
        title = "Mr";
      } else {
        title = "Ms";
      }
    }

    if(dataKtpResult.gender.toUpperCase() == 'PRIA') {
      dataKtpResult.gender = "Male";
    } else {
      dataKtpResult.gender = "Female";
    }

    if(dataKtpResult.marital_status.toUpperCase() == 'BELUM KAWIN') {
      dataKtpResult.marital_status = "Single"
    } else {
      dataKtpResult.marital_status = "Married";
    }

    console.log(dataKtpResult)
    return(dataKtpResult)
    
  } catch (error) {
    console.log(error)
  }
}

const postKtpResult = async (request, h) => {
  try {
    ktpResult();
    const {name, nationality, nik, gender, marital_status, title, id_ktp} = dataKtpResult;
    
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