// const mysql = require('mysql');
// require('dotenv').config();

// var connection = mysql.createConnection({
//     port: process.env.DB_PORT,
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// }
// )

// connection.connect((err)=>{
//     if(!err){
//         console.log("Database connected successfully");
//     } else {
//         console.log(err);
//     }
// })

// module.exports = connection;

// const mysql = require('mysql');
// require('dotenv').config();

// const pool = mysql.createPool({
//     connectionLimit: 10,
//     port: process.env.DB_PORT,
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });

// pool.getConnection((err, connection) => {
//     if (err) {
//         if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.error('Database connection was closed.');
//         }
//         if (err.code === 'ER_CON_COUNT_ERROR') {
//             console.error('Database has too many connections.');
//         }
//         if (err.code === 'ECONNREFUSED') {
//             console.error('Database connection was refused.');
//         }
//         return;
//     }

//     if (connection) connection.release();
//     console.log('Database connected successfully');
// });

// module.exports = pool;
