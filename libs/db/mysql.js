const dbInfo = require('../../conf/database');
const mysql = require('mysql');
const connection = mysql.createConnection(dbInfo);


module.exports = connection;
