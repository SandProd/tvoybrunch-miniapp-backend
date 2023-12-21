const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'tvoybruc.mysql.tools',
    user: 'tvoybruc_db',
    password: 'wjtMG2Wc',
    database: 'tvoybruc_db'
});

module.exports = connection;
