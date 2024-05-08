const mysql = require('mysql');

function getNewConnection() {
    return mysql.createConnection(
        {
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_Pass,
            database: 'estate_database'
        }
    );
}

export default getNewConnection;