const mysql = require('mysql');
const config = require('../../config/db_config');

const connection = mysql.createConnection(config);

const selectWomenQuery = 'SELECT * FROM user WHERE name LIKE ?';

connection.connect((err) => {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
})

connection.query(selectWomenQuery, ['양희찬'], (err, result) => {
    console.log(result)
});

connection.end();