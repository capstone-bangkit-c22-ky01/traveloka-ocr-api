const { Pool } = require('pg');
const StorageService = require('../../storage/StorageService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const { nanoid } = require('nanoid');
const fs = require('fs');

const pool = new Pool();

function ktpResult () {
  let dataKtpResult;
  fs.readFile('src/outputKtpResult/dummyResult.json', 'utf-8', (error, data) => {
    if(error){
      console.log(error)
      return;
    }

    dataKtpResult = JSON.parse(data);
    let title = "Mr";

    if (dataKtpResult.marital_status.toUpperCase() == 'BELUM KAWIN') {
      if (dataKtpResult.gender.toUpperCase() == 'PRIA') {
        dataKtpResult.title = title;
        dataKtpResult.gender = "Male";
      } else {
        title = "Ms";
        dataKtpResult.title = title;
        dataKtpResult.gender = "Female";
      }
      dataKtpResult.marital_status = "Single"
    } else {
      if (dataKtpResult.gender.toUpperCase() == 'PRIA') {
        dataKtpResult.gender = "Male";
        dataKtpResult.title = title;
      } else {
        title = "Mrs";
        dataKtpResult.title = title;
        dataKtpResult.gender = "Female";
      }
      dataKtpResult.marital_status = "Married";
    }

    console.log('===========line44')
    console.log(dataKtpResult)
    
  })
  console.log('===========line49')
  console.log(dataKtpResult)
  return dataKtpResult
}

const dataKtpJson = ktpResult()

const postKtpResult = async (request, h) => {
  
  try {
    const dataKtpResult = dataKtpJson;
    console.log('line56=========')
    console.log(dataKtpResult);
    const {name, nationality, nik, gender, marital_status, id_ktp, title} = dataKtpResult;
    
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
      data: { dataKtpResult },
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