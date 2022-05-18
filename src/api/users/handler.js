const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

const pool = new Pool();

const verifyEmail = async (email) => {
	const query = {
		text: 'SELECT email FROM users WHERE email = $1',
		values: [email],
	};

	const result = await pool.query(query);

	if (result.rows.length > 0) {
		throw new InvariantError('Filed to add email. Email is alredy in use.');
	}
};

const postUserHandler = async (request, h) => {
	try {
		const { name, email, password, fotoProfil } = request.payload;
		await verifyEmail(email);

		const id = `users-${nanoid(16)}`;
		const hashedPassword = await bcrypt.hash(password, 10);

		const query = {
			text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5) RETURNING id',
			values: [id, name, email, hashedPassword, fotoProfil],
		};

		const result = await pool.query(query);
		if (!result.rows.length) {
			throw new InvariantError('Failed to add user');
		}

		const userId = result.rows[0].id;
		const response = h.response({
			status: 'success',
			message: 'User added successfully',
			data: {
				userId,
			},
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

const getUserByIdHandler = async (request, h) => {
	try {
		const { id } = request.params;

		const query = {
			text: 'SELECT * FROM users WHERE id = $1',
			values: [id],
		};
		const result = await pool.query(query);
		if (!result.rows.length) {
			throw new NotFoundError('User tidak ditemukan');
		}

		const dataUser = result.rows;
		return {
			status: 'success',
			data: { user: dataUser },
		};
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

module.exports = { postUserHandler, getUserByIdHandler };
