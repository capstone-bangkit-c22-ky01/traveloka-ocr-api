exports.up = (pgm) => {
  pgm.createTable('ktpresults',  {
    id: {
			type: 'VARCHAR(50)',
			primaryKey: true,
    },
    title: {
      type: 'VARCHAR(5)',
      notNull: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    nationality: {
      type: 'TEXT',
      notNull: true,
    },
    nik: {
			type: 'BIGINT',
			unique: true,
			notNull: true,
    }, 
    sex: {
      type: 'VARCHAR(20)',
      notNull: true,
    },
    married: {
      type: 'VARCHAR(20)',
      notNull: false,
    },
    id_ktp: {
      type: 'VARCHAR(50)',
      notNull: true,
    }
  }); 

  pgm.addConstraint(
    'ktpresults',
    'fk_ktpresults.id_ktp_ktps.id',
    'FOREIGN KEY(id_ktp) REFERENCES ktps(id) ON DELETE CASCADE'
  )
};

exports.down = (pgm) => {
  pgm.dropTable('ktpresults');
};