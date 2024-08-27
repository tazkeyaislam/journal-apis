const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const AppUser = sequelize.define('AppUser', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
    }
}, {
    tableName: 'app_user',
    timestamps: false,
    hooks: {
        // Hash the password before saving a new user
        beforeCreate: async (user) => {
            if (user.password && !user.password.startsWith('$2b$')) {  // Checking if the password is already hashed
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        // Hash the password before updating an existing user
        beforeUpdate: async (user) => {
            if (user.password && !user.password.startsWith('$2b$')) {  // Checking if the password is already hashed
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }

    }
});

// Method to compare passwords
AppUser.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = AppUser;
