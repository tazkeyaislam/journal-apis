const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Article = require('./Article');  // Import the Article model


const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    }
}, {
    tableName: 'category',
    timestamps: false,
});

// Category.hasMany(Article, { foreignKey: 'category_id', as: 'articles' });

module.exports = Category;

