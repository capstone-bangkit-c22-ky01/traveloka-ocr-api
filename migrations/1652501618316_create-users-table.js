exports.up = (pgm) => {
	pgm.createTable('users', {
		id: {
			type: 'VARCHAR(50)',
			primaryKey: true,
		},
		name: {
			type: 'TEXT',
			notNull: true,
		},
		email: {
			type: 'VARCHAR(100)',
			unique: true,
			notNull: true,
		},
		password: {
			type: 'TEXT',
			notNull: true,
		},
		foto_profil: {
			type: 'TEXT',
			notNull: false,
		},
	});
};

exports.down = (pgm) => {
	pgm.dropTable('users');
};
