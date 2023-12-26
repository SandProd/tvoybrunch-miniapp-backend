const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'tvoybruc.mysql.tools',
    user: 'tvoybruc_db',
    password: 'wjtMG2Wc',
    database: 'tvoybruc_db'
});

module.exports = pool;
