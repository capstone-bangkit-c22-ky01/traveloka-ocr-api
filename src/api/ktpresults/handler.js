const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

const pool = new Pool();

const getKtpResultsByIdHandler = async (request, h) => {
  try {
    const { id_ktpresult } = request.params;

    const query = {
      text: 'SELECT * FROM ktpresults WHERE id = $1',
      value: [id_ktpresult],
    };

    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('KTP Result tidak ditemukan')
    }

    const dataKtp = result.rows;
    return {
      status: 'success',
      data: { user: dataKtp },
    }
  } catch {
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
}

const editKtpResultByIdHandler = async (request, h) => {
  try {
    const { id_ktpresult } = request.params
    const { title, name, nationality, nik, gender, marital_status } = request.payload;
    
    const query = {
      text: 'UPDATE ktpresults SET ($1, $2, $3, $4, $5, $6) WHERE id = $7',
      values: [title, name, nationality, nik, gender, marital_status, id_ktpresult]
    }

    const updateResult = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('KTP Result tidak ditemukan')
    }

    const UpdateDataKtp = updateResult.rows;
    const response = h.response({
      status: 'success',
      message: 'Update Successfully',
      data: {
        UpdateDataKtp, 
      }
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
}

const deleteKtpResultByIdHandler = async (request, h) => {
  try {
    const { id_ktpresult } = request.params;

    const query = {
      text: 'DELETE FROM ktpresults WHERE id = $1',
      values: [id_ktpresult],
    };
    
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('KTP Result tidak ditemukan')
    }

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    }
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
}

module.exports = {
  getKtpResultsByIdHandler, editKtpResultByIdHandler, deleteKtpResultByIdHandler,
};