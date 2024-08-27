const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');
const AppUser = require('./AppUser');

const Article = sequelize.define('Article', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
            key: 'id',
        }
    },
    publication_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AppUser,
            key: 'id',
        }
    }
}, {
    tableName: 'article',
    timestamps: false,
});

// Article.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
// Article.belongsTo(AppUser, { foreignKey: 'user_id', as: 'user' });

module.exports = Article;
