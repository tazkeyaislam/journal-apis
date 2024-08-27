const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Article = require('./Article');
const AppUser = require('./AppUser');

const Comment = sequelize.define('Comment', {
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
    comment_text: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    comment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'comment',
    timestamps: false,
});

module.exports = Comment;
