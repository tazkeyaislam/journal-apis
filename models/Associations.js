// Import models
const AppUser = require('./AppUser');
const Category = require('./Category');
const Article = require('./Article');
const ArticleLike = require('./ArticleLike');
const Comment = require('./Comment');

// Define relationships
AppUser.hasMany(Article, { foreignKey: 'user_id' });
Article.belongsTo(AppUser, { foreignKey: 'user_id', as: 'user' });

Category.hasMany(Article, { foreignKey: 'category_id', as: 'articles' });
Article.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Article.hasMany(ArticleLike, { foreignKey: 'article_id' });
ArticleLike.belongsTo(Article, { foreignKey: 'article_id' });

AppUser.hasMany(ArticleLike, { foreignKey: 'user_id' });
ArticleLike.belongsTo(AppUser, { foreignKey: 'user_id' });

Article.hasMany(Comment, { foreignKey: 'article_id' });
Comment.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });

AppUser.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(AppUser, { foreignKey: 'user_id', as: 'user' });

module.exports = {
    Article,
    Category,
    AppUser,
    ArticleLike,
    Comment
};