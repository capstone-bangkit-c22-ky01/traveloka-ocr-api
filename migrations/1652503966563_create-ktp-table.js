/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('ktp', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        image_name: {
            type: 'TEXT',
            notNull: true,
        },
        id_user: {
            type: 'VARCHAR(50)',
            notNull: true,
        },   

    });

    pgm.addConstraint(
        'ktp',
        'fk_ktp.id_user_users.id',
        'FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE'
    );
};

exports.down = (pgm) => {
    pgm.dropTable('ktp');
};