const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

let auth = require('../services/authentication');
let checkRole = require('../services/checkRole')

router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email,password,status,role from appuser where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "insert into appuser(name,email,password,status,isDeletable,role) values(?,?,?,'false','true','user')";
                connection.query(query, [user.name, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfully Registered" });
                    } else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(400).json({ message: "Email already exist" })
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

// router.post('/login', (req, res) => {
//     const user = req.body;
//     query = "select email, password,status,role from appuser where email=?";
//     connection.query(query, [user.email], (err, results) => {
//         if (!err) {
//             if (results.length <= 0 || results[0].password != user.password) {
//                 return res.status(401).json({ message: "Incorrect email or password" });
//             }
//             else if (results[0].status === 'false') {
//                 return res.status(401).json({ message: "Wait for Admin approuval" });
//             }
//             else if (results[0].password == user.password) {
//                 const response = { email: results[0].email, isDeletable: results[0].isDeletable, role: results[0].role, id: results[0].id }
//                 const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
//                 res.status(200).json({ token: accessToken });
//             } else {
//                 return res.status(400).json({ message: "Something went wrong. Please try again later" })
//             }
//         } else {
//             return res.status(500).json(err);
//         }
//     })
// })

router.post('/login', (req, res) => {
    const user = req.body;
    const query = "SELECT id, email, password, status, role, isDeletable FROM appuser WHERE email=?";

    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password !== user.password) {
                return res.status(401).json({ message: "Incorrect email or password" });
            } else if (results[0].status === 'false') {
                return res.status(401).json({ message: "Wait for Admin approval" });
            } else {
                // Include user_id in the JWT payload
                const payload = {
                    id: results[0].id, // user_id
                    email: results[0].email,
                    role: results[0].role,
                    isDeletable: results[0].isDeletable
                };

                const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.status(200).json({ token: accessToken });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});


router.get('/getAllAppUser', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    // const tokenPayload = res.locals;
    var query = "select id,name,email,status from appuser where role='user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

router.patch('/updateUserStatus', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update appuser set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "User ID does not exist" });
            }
            return res.status(200).json({ message: "User status updated successfully" });
        } else {
            return res.status(500).json(err);
        }
    })

})

router.post('/changePassword', auth.authenticateToken, (req, res) => {
    let user = req.body;
    let email = res.locals.email;
    var query = "select * from appuser where email=? and password=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(404).json({ message: "Incorrect old password" });
            }
            else if (results[0].password == user.oldPassword) {
                query = "update appuser set password=? where email=?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password updated successfully" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Something went wrong" })
            }
        } else {
            return res.status(500).json(err)
        }
    })

})

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
})

module.exports = router;