const express = require('express');
// const pool = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');

let auth = require('../services/authentication');
let checkRole = require('../services/checkRole')
const AppUser = require('../models/AppUser');

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the email already exists
        const existingUser = await AppUser.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create a new user
        const newUser = await AppUser.create({
            name,
            email,
            password,  // The password will be hashed by the Sequelize hook
            status: 'inactive',  // Default status as inactive until admin approval
            role: 'user'
        });

        return res.status(200).json({ message: "Successfully Registered" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await AppUser.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        // Verify the password
        const validPassword = await user.validPassword(password);
        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        // Check if the user's status is inactive
        if (user.status === 'inactive') {
            return res.status(401).json({ message: "Wait for Admin approval" });
        }

        // Generate JWT token
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
        return res.status(200).json({ token: accessToken });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.get('/getAllAppUser', auth.authenticateToken, checkRole.checkRole, async (req, res) => {
    try {
        const users = await AppUser.findAll({
            where: { role: 'user' },
            attributes: ['id', 'name', 'email', 'status']  // Only return these fields
        });

        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.patch('/updateUserStatus', auth.authenticateToken, checkRole.checkRole, async (req, res) => {
    try {
        const { id, status } = req.body;

        const [updated] = await AppUser.update({ status }, { where: { id } });

        if (updated === 0) {
            return res.status(404).json({ message: "User ID does not exist" });
        }

        return res.status(200).json({ message: "User status updated successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});


router.post('/changePassword', auth.authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const email = res.locals.email;

        // Find the user by email
        const user = await AppUser.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify the old password
        const validPassword = await user.validPassword(oldPassword);
        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect old password" });
        }

        // Update the password
        user.password = newPassword;  // This will be hashed by the beforeUpdate hook
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});


router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
});

module.exports = router;