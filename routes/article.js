const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');
let checkRole = require('../services/checkRole')

// Admin can get all published articles with the user's email
router.get('/admin/publishedArticles', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const query = `
        SELECT a.id, a.title, a.content, a.status, a.publication_date, c.name AS categoryName, u.email AS userEmail
        FROM article AS a
        INNER JOIN category AS c ON a.categoryId = c.id
        INNER JOIN appuser AS u ON a.user_id = u.id
        WHERE a.status = 'published'
    `;

    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

// Admin can delete any article
router.delete('/admin/deleteArticle/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM article WHERE id = ?";

    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Article ID not found" });
            }
            return res.status(200).json({ message: "Article deleted successfully" });
        } else {
            return res.status(500).json(err);
        }
    });
});


// Authenticated users can get their articles
router.get('/myArticles', auth.authenticateToken, (req, res) => {
    const userId = res.locals.id;

    const query = `
        SELECT a.id, a.title, a.content, a.status, a.publication_date, c.name AS categoryName
        FROM article AS a
        INNER JOIN category AS c ON a.categoryId = c.id
        WHERE a.user_id = ?
    `;

    connection.query(query, [userId], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

// Authenticated users can add new articles
router.post('/addNewArticle', auth.authenticateToken, (req, res) => {
    const article = req.body;
    const userId = res.locals.id; // Extract user ID from res.locals

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID is required" });
    }

    const query = `
        INSERT INTO article (title, content, publication_date, categoryId, status, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        query,
        [article.title, article.content, new Date(), article.categoryId, article.status, userId],
        (err, results) => {
            if (!err) {
                return res.status(200).json({ message: "Article added successfully" });
            } else {
                return res.status(500).json(err);
            }
        }
    );
});


// Authenticated users can update their articles
router.post('/updateArticle', auth.authenticateToken, (req, res) => {
    const article = req.body;
    const userId = res.locals.id;

    const query = `
        UPDATE article
        SET title = ?, content = ?, categoryId = ?, publication_date = ?, status = ?
        WHERE id = ? AND user_id = ?
    `;

    connection.query(
        query,
        [article.title, article.content, article.categoryId, new Date(), article.status, article.id, userId],
        (err, results) => {
            if (!err) {
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "Article ID not found or you don't have permission" });
                }
                return res.status(200).json({ message: "Article updated successfully" });
            } else {
                return res.status(500).json(err);
            }
        }
    );
});

// Authenticated users can delete their articles
router.delete('/deleteArticle/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    const userId = res.locals.id;

    const query = "DELETE FROM article WHERE id = ? AND user_id = ?";

    connection.query(query, [id, userId], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Article ID not found or you don't have permission" });
            }
            return res.status(200).json({ message: "Article deleted successfully" });
        } else {
            return res.status(500).json(err);
        }
    });
});


router.get('/publicPublishedArticles', (req, res) => {
    const query = `
        SELECT a.id, a.title, a.content, a.status, a.publication_date,c.id AS categoryId, c.name AS categoryName, u.email AS userEmail,
        (SELECT COUNT(*) FROM article_like WHERE article_id = a.id) AS likeCount,
        (SELECT COUNT(*) FROM comment WHERE article_id = a.id) AS commentCount
        FROM article AS a
        INNER JOIN category AS c ON a.categoryId = c.id
        INNER JOIN appuser AS u ON a.user_id = u.id
        WHERE a.status = 'published'
    `;

    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.post('/commentArticle/:articleId', auth.authenticateToken, (req, res) => {
    const articleId = req.params.articleId;
    const userId = res.locals.id;
    const { commentText } = req.body;

    if (!commentText) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    // Insert comment
    const insertCommentQuery = 'INSERT INTO comment (article_id, user_id, comment_text) VALUES (?, ?, ?)';
    connection.query(insertCommentQuery, [articleId, userId, commentText], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(200).json({ message: "Comment added successfully" });
    });
});


router.get('/getComments/:articleId', (req, res) => {
    const articleId = req.params.articleId;

    const getCommentsQuery = `
        SELECT c.comment_text, c.comment_date, u.name AS user_name
        FROM comment AS c
        INNER JOIN appuser AS u ON c.user_id = u.id
        WHERE c.article_id = ?
        ORDER BY c.comment_date DESC
    `;

    connection.query(getCommentsQuery, [articleId], (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(results);
    });
});

//Like an article
router.post('/likeArticle/:articleId', auth.authenticateToken, (req, res) => {
    const articleId = req.params.articleId;
    const userId = res.locals.id;

    const query = 'INSERT INTO article_like (article_id, user_id) VALUES (?, ?)';

    connection.query(query, [articleId, userId], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Article liked successfully" });
        } else {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "You have already liked this article" });
            }
            return res.status(500).json(err);
        }
    });
});

// Unlike an article
router.delete('/unlikeArticle/:articleId', auth.authenticateToken, (req, res) => {
    const articleId = req.params.articleId;
    const userId = res.locals.id;

    const query = 'DELETE FROM article_like WHERE article_id = ? AND user_id = ?';

    connection.query(query, [articleId, userId], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "You haven't liked this article yet" });
            }
            return res.status(200).json({ message: "Article unliked successfully" });
        } else {
            return res.status(500).json(err);
        }
    });
});

// Get like count for an article
router.get('/likeCount/:articleId', (req, res) => {
    const articleId = req.params.articleId;

    const query = 'SELECT COUNT(*) AS likeCount FROM article_like WHERE article_id = ?';

    connection.query(query, [articleId], (err, results) => {
        if (!err) {
            return res.status(200).json({ likeCount: results[0].likeCount });
        } else {
            return res.status(500).json(err);
        }
    });
});

// Get articles liked by the authenticated user
router.get('/myLikedArticles', auth.authenticateToken, (req, res) => {
    const userId = res.locals.id;

    const query = `
        SELECT a.id, a.title, a.content, a.status, a.publication_date, c.name AS categoryName, u.email AS userEmail
        FROM article AS a
        INNER JOIN article_like AS al ON a.id = al.article_id
        INNER JOIN category AS c ON a.categoryId = c.id
        INNER JOIN appuser AS u ON a.user_id = u.id
        WHERE al.user_id = ?
    `;

    connection.query(query, [userId], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.get('/checkIfLiked/:articleId', auth.authenticateToken, (req, res) => {
    const articleId = req.params.articleId;
    const userId = res.locals.id;

    const query = 'SELECT COUNT(*) AS liked FROM article_like WHERE article_id = ? AND user_id = ?';

    connection.query(query, [articleId, userId], (err, results) => {
        if (!err) {
            return res.status(200).json(results[0].liked > 0);
        } else {
            return res.status(500).json(err);
        }
    });
});




module.exports = router;