const express = require('express');
var cors = require('cors');
// const pool = require('./connection');
const appuserRoute = require('./routes/appuser');
const categoryRoute = require('./routes/category');
const articleRoute = require('./routes/article');
const sequelize = require('./config/database');  // Import Sequelize setup

require('./models/Associations');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/appuser', appuserRoute);
app.use('/category', categoryRoute);
app.use('/article', articleRoute);

app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

if (process.env.NODE_ENV === 'test') {
    sequelize.sync({ force: true }).then(() => {
        console.log("Test database has been reset.");
    }).catch(err => {
        console.error("Failed to reset test database:", err);
    });
}

module.exports = app;