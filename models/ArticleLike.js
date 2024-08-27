const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Article = require('./Article');
const AppUser = require('./AppUser');

const ArticleLike = sequelize.define('ArticleLike', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Article,
            key: 'id',
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AppUser,
            key: 'id',
        }
    },
    like_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'article_like',
    timestamps: false,
    uniqueKeys: {
        actions_unique: {
            fields: ['article_id', 'user_id']
        }
    }
});

module.exports = ArticleLike;
