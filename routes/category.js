const express = require('express');
// const pool = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

const Category = require('../models/Category');

router.get('/getAllCategory', async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']],
            attributes: ['id', 'name']  // Specify the columns you want to return
        });

        return res.status(200).json(categories);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.post('/addNewCategory', auth.authenticateToken, checkRole.checkRole, async (req, res, next) => {
    try {
        const { name } = req.body;

        const newCategory = await Category.create({ name });

        return res.status(200).json({ message: "Category added successfully", category: newCategory });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.patch('/updateCategory', auth.authenticateToken, checkRole.checkRole, async (req, res, next) => {
    try {
        const { id, name } = req.body;

        const [updated] = await Category.update({ name }, { where: { id } });

        if (updated === 0) {
            return res.status(404).json({ message: "Category ID not found" });
        }

        return res.status(200).json({ message: "Category updated successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;