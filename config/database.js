// database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();
const mysql2 = require('mysql2');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectModule: mysql2,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;