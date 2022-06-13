const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const ClientError = require('../../exceptions/ClientError');

const pool = new Pool();

const getFlightsHandler = async (request, h) => {
	const { departure, destination } = request.query;
	const query = {
		text: `SELECT * FROM airlines
        	JOIN flights ON flights.id_airline = airlines.id`,
	};
	const result = await pool.query(query);
	const flights = result.rows;
	let flighFilter = flights;

	// filter data fligths
	if (departure !== undefined && destination !== undefined) {
		flighFilter = flights.filter(
			(flight) =>
				flight.departure.toLowerCase() === departure.toLowerCase() &&
				flight.destination.toLowerCase() === destination.toLowerCase(),
		);
	}

	const response = h.response({
		status: 'success',
		data: {
			flights: flighFilter.map((flight) => ({
				id: flight.id,
				airline: flight.airline,
				icon: flight.icon,
				depart_time: flight.depart_time,
				arrival_time: flight.arrival_time,
				departure: flight.departure,
				destination: flight.destination,
				price: flight.price,
			})),
		},
	});
	response.code(200);
	return response;
};

const postFlightBookingHandler = async (request, h) => {
	try {
		const { id: idFlight } = request.payload;
		const { id: idUser } = request.auth.credentials;

		const id = `booking-${nanoid(16)}`;
		const status = 'pending';
		const bookingCode = Math.floor(Math.random() * 1000000000);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		const query = {
			text: 'INSERT INTO bookings VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
			values: [id, status, bookingCode, idUser, idFlight, createdAt, updatedAt],
		};
		const result = await pool.query(query);
		if (!result.rows[0].id) {
			throw new InvariantError('Booking failed to add');
		}

		const response = h.response({
			status: 'success',
			message: 'Booking success',
			data: {
				bookingId: id,
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

const getBookingByUserIdHandler = async (request, h) => {
	try {
		const { id: idUser } = request.auth.credentials;
		const query = {
			text: `SELECT * FROM flights
			 			JOIN bookings ON bookings.id_flight = flights.id 
						WHERE bookings.id_user = $1`,
			values: [idUser],
		};
		const result = await pool.query(query);
		const bookings = result.rows;
		return {
			status: 'success',
			data: {
				bookings: bookings.map((booking) => ({
					id: booking.id,
					departure: booking.departure,
					destination: booking.destination,
					booking_code: booking.booking_code,
					price: booking.price,
					status: booking.status,
				})),
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
			message: 'Sorry, there was a failure on our server.',
		});
		response.code(500);
		console.error(error);
		return response;
	}
};

const getBookingDetailsByBookingIdHandler = async (request, h) => {
	try {
		const { bookingId: idBooking } = request.params;

		const query = {
			text: 'SELECT bookings.id, depart_time, arrival_time, departure, destination, status, price, booking_code, passenger_name, passenger_title, airline, icon FROM flights INNER JOIN bookings ON flights.id=bookings.id_flight INNER JOIN airlines ON flights.id_airline=airlines.id WHERE bookings.id = $1',
			values: [idBooking],
		};
		const result = await pool.query(query);
		const bookings = result.rows;
		return {
			status: 'success',
			data: {
				bookings: bookings.map((booking) => ({
					id: booking.id,
					departure: booking.departure,
					destination: booking.destination,
					status: booking.status,
					price: booking.price,
					booking_code: booking.booking_code,
					passenger_name: booking.passenger_name,
					passenger_title: booking.passenger_title,
					depart_time: booking.depart_time,
					arrival_time: booking.arrival_time,
					airline: booking.airline,
					icon: booking.icon,
				})),
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
			message: 'Sorry, there was a failure on our server.',
		});
		response.code(500);
		console.error(error);
		return response;
	}
};

const putBookingByIdHandler = async (request, h) => {
	try {
		const { id: idBooking } = request.params;
		const { title, name } = request.payload;

		const status = 'success';
		const updatedAt = new Date().toISOString();

		const query = {
			text: 'UPDATE bookings SET status = $1, updated_at = $2, passenger_name = $3, passenger_title = $4 WHERE id = $5 RETURNING id',
			values: [status, updatedAt, name, title, idBooking],
		};

		const result = await pool.query(query);
		if (!result.rows[0].id) {
			throw new InvariantError('Booking failed to update');
		}

		const response = h.response({
			status: 'success',
			message: 'Booking updated',
			data: {
				bookingId: idBooking,
			},
		});
		response.code(200);
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

module.exports = {
	getFlightsHandler,
	postFlightBookingHandler,
	getBookingByUserIdHandler,
	putBookingByIdHandler,
	getBookingDetailsByBookingIdHandler,
};
