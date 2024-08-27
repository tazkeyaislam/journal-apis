const express = require('express');
// const pool = require('../connection');
const { Op } = require('sequelize');
const router = express.Router();
var auth = require('../services/authentication');
let checkRole = require('../services/checkRole');

// Import Sequelize models
const Article = require('../models/Article');
const Category = require('../models/Category');
const AppUser = require('../models/AppUser');
const Comment = require('../models/Comment');
const ArticleLike = require('../models/ArticleLike');
const sequelize = require('../config/database');

router.get('/admin/publishedArticles', auth.authenticateToken, checkRole.checkRole, async (req, res) => {
    try {
        const articles = await Article.findAll({
            where: { status: 'published' },
            include: [
                {
                    model: Category,
                    attributes: ['name'],
                    as: 'category'
                },
                {
                    model: AppUser,
                    attributes: ['email'],
                    as: 'user'
                }
            ],
            attributes: ['id', 'title', 'content', 'status', 'publication_date']
        });

        return res.status(200).json(articles);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.delete('/admin/deleteArticle/:id', auth.authenticateToken, checkRole.checkRole, async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Article.destroy({ where: { id } });

        if (result === 0) {
            return res.status(404).json({ message: "Article ID not found" });
        }

        return res.status(200).json({ message: "Article deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "An error occurred while trying to delete the article", error: err });
    }
});

router.get('/myArticles', auth.authenticateToken, async (req, res) => {
    try {
        const userId = res.locals.id;

        const articles = await Article.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Category,
                    attributes: ['name'],
                    as: 'category'
                },
                {
                    model: AppUser,
                    attributes: ['email'],
                    as: 'user'
                }
            ],
            attributes: ['id', 'title', 'content', 'status', 'publication_date']
        });

        return res.status(200).json(articles);
    } catch (err) {
        console.error('Error fetching articles:', err);
        return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
});

router.post('/addNewArticle', auth.authenticateToken, async (req, res) => {
    try {
        const userId = res.locals.id; // Extract user ID from res.locals
        const { title, content, categoryId, status } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID is required" });
        }

        const newArticle = await Article.create({
            title,
            content,
            publication_date: new Date(),
            category_id: categoryId,
            status,
            user_id: userId
        });

        return res.status(200).json({ message: "Article added successfully", article: newArticle });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.post('/updateArticle', auth.authenticateToken, async (req, res) => {
    try {
        const userId = res.locals.id;
        const { id, title, content, categoryId, status } = req.body;

        const [updated] = await Article.update(
            { title, content, category_id: categoryId, publication_date: new Date(), status },
            { where: { id, user_id: userId } }
        );

        if (updated === 0) {
            return res.status(404).json({ message: "Article ID not found or you don't have permission" });
        }

        return res.status(200).json({ message: "Article updated successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.delete('/deleteArticle/:id', auth.authenticateToken, async (req, res) => {
    try {
        const userId = res.locals.id;
        const id = req.params.id;

        const result = await Article.destroy({ where: { id, user_id: userId } });

        if (result === 0) {
            return res.status(404).json({ message: "Article ID not found or you don't have permission" });
        }

        return res.status(200).json({ message: "Article deleted successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.get('/publicPublishedArticles', async (req, res) => {
    try {
        const articles = await Article.findAll({
            where: { status: 'published' },
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name'],
                    as: 'category'
                },
                {
                    model: AppUser,
                    attributes: ['email'],
                    as: 'user'
                }
            ],
            attributes: [
                'id', 'title', 'content', 'status', 'publication_date',
                [
                    sequelize.literal(`(
                        SELECT COUNT(*) FROM article_like WHERE article_like.article_id = Article.id
                    )`),
                    'likeCount'
                ],
                [
                    sequelize.literal(`(
                        SELECT COUNT(*) FROM comment WHERE comment.article_id = Article.id
                    )`),
                    'commentCount'
                ]
            ]
        });

        return res.status(200).json(articles);
    } catch (err) {
        console.error('Error fetching public published articles:', err);
        return res.status(500).json({ message: 'Error fetching public published articles', error: err });
    }
});

router.post('/commentArticle/:articleId', auth.authenticateToken, async (req, res) => {
    try {
        const articleId = req.params.articleId;
        const userId = res.locals.id;
        const { commentText } = req.body;

        if (!commentText) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const newComment = await Comment.create({
            article_id: articleId,
            user_id: userId,
            comment_text: commentText
        });

        return res.status(200).json({ message: "Comment added successfully", comment: newComment });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.get('/getComments/:articleId', async (req, res) => {
    try {
        const articleId = req.params.articleId;

        const comments = await Comment.findAll({
            where: { article_id: articleId },
            include: [
                {
                    model: AppUser,
                    attributes: ['name', 'email'],
                    as: 'user'
                }
            ],
            attributes: ['comment_text', 'comment_date'],
            order: [['comment_date', 'DESC']]
        });

        return res.status(200).json(comments);
    } catch (err) {
        return res.status(500).json(err);
    }
});


router.post('/likeArticle/:articleId', auth.authenticateToken, async (req, res) => {
    try {
        const articleId = req.params.articleId;
        const userId = res.locals.id;

        const [like, created] = await ArticleLike.findOrCreate({
            where: { article_id: articleId, user_id: userId }
        });

        if (!created) {
            return res.status(400).json({ message: "You have already liked this article" });
        }

        return res.status(200).json({ message: "Article liked successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.delete('/unlikeArticle/:articleId', auth.authenticateToken, async (req, res) => {
    try {
        const articleId = req.params.articleId;
        const userId = res.locals.id;

        const result = await ArticleLike.destroy({
            where: { article_id: articleId, user_id: userId }
        });

        if (result === 0) {
            return res.status(404).json({ message: "You haven't liked this article yet" });
        }

        return res.status(200).json({ message: "Article unliked successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.get('/likeCount/:articleId', async (req, res) => {
    try {
        const articleId = req.params.articleId;

        const likeCount = await ArticleLike.count({ where: { article_id: articleId } });

        return res.status(200).json({ likeCount });
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.get('/myLikedArticles', auth.authenticateToken, async (req, res) => {
    try {
        const userId = res.locals.id;

        const likedArticles = await Article.findAll({
            include: [
                {
                    model: ArticleLike,
                    where: { user_id: userId },
                    attributes: []
                },
                {
                    model: Category,
                    attributes: ['name'],
                    as: 'category'
                },
                {
                    model: AppUser,
                    attributes: ['email'],
                    as: 'user'
                }
            ],
            attributes: ['id', 'title', 'content', 'status', 'publication_date']
        });

        return res.status(200).json(likedArticles);
    } catch (err) {
        return res.status(500).json(err);
    }
});


router.get('/checkIfLiked/:articleId', auth.authenticateToken, async (req, res) => {
    try {
        const articleId = req.params.articleId;
        const userId = res.locals.id;

        const liked = await ArticleLike.count({ where: { article_id: articleId, user_id: userId } });

        return res.status(200).json(liked > 0);
    } catch (err) {
        return res.status(500).json(err);
    }
});



module.exports = router;