const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const TokenManager = require('../../tokenize/TokenManager');

const pool = new Pool();

const verifyUserCredential = async (email, password) => {
	const query = {
		text: 'SELECT id, password FROM users WHERE email = $1',
		values: [email],
	};

	const result = await pool.query(query);
	if (!result.rows.length) {
		throw new AuthenticationError('The credentials you provided are wrong');
	}

	const { id, password: hashedPassword } = result.rows[0];
	const match = await bcrypt.compare(password, hashedPassword);
	if (!match) {
		throw new AuthenticationError('The credentials you provided are wrong');
	}

	return id;
};

const verifyRefreshToken = async (token) => {
	const query = {
		text: 'SELECT token FROM authentications WHERE token = $1',
		values: [token],
	};

	const result = await pool.query(query);
	if (!result.rows.length) {
		throw new InvariantError('Refresh token invalid');
	}
};

const deleteRefreshToken = async (token) => {
	const query = {
		text: 'DELETE FROM authentications WHERE token = $1',
		values: [token],
	};
	await pool.query(query);
};

const postAuthenticationHandler = async (request, h) => {
	try {
		const { email, password } = request.payload;

		const id = await verifyUserCredential(email, password);

		const accessToken = TokenManager.generateAccessToken({ id });
		const refreshToken = TokenManager.generateRefreshToken({ id });

		const query = {
			text: 'INSERT INTO authentications VALUES($1)',
			values: [refreshToken],
		};
		await pool.query(query);

		const response = h.response({
			status: 'success',
			message: 'Authentication success',
			data: {
				accessToken,
				refreshToken,
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
			message: 'Maaf, terjadi kegagalan pada server kami.',
		});
		response.code(500);
		console.error(error);
		return response;
	}
};

const putAuthenticationHandler = async (request, h) => {
	try {
		const { refreshToken } = request.payload;
		await verifyRefreshToken(refreshToken);
		const { id } = TokenManager.verifyRefreshToken(refreshToken);

		const accessToken = TokenManager.generateAccessToken({ id });
		return {
			status: 'success',
			message: 'Access Token berhasil diperbarui',
			data: {
				accessToken,
			},
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
			message: 'Maaf, terjadi kegagalan pada server kami.',
		});
		response.code(500);
		console.error(error);
		return response;
	}
};

const deleteAuthenticationHandler = async (request, h) => {
	try {
		const { refreshToken } = request.payload;
		await verifyRefreshToken(refreshToken);
		await deleteRefreshToken(refreshToken);

		return {
			status: 'success',
			message: 'Authentications has been removed',
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
			message: 'Maaf, terjadi kegagalan pada server kami.',
		});
		response.code(500);
		console.error(error);
		return response;
	}
};

// Google Auth
const getGoogleAuthenticationHandler = async (request, h) => {
	try {
		if (request.auth.isAuthenticated) {
			const token = request.auth.credentials;
			const user = request.auth.credentials.profile.raw;

			const dataUser = {
				id: user.sub,
				name: user.name,
				picture: user.picture,
				email: user.email,
				email_verified: user.email_verified,
			};

			const data = {
				token: token.token,
				expiresIn: token.expiresIn,
				profile: dataUser,
			};

			const response = h.response({
				status: 'success',
				message: 'Authentication success',
				data,
			});
			response.code(201);
			return response;
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
			message: 'Maaf, terjadi kegagalan pada server kami.',
		});
		response.code(500);
		console.error(error);
		return response;
	}
};

module.exports = {
	postAuthenticationHandler,
	putAuthenticationHandler,
	deleteAuthenticationHandler,
	getGoogleAuthenticationHandler,
};
