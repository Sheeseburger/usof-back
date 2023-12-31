const { User, ResetPwdToken } = require('./userModel');
const Post = require('./postModel');
const Category = require('./categoryModel');
const Comment = require('./commentModel');
const Like = require('./likeModel');
const PostCategory = require('./postCategoryModel');
const Favorite = require('./favoriteModel');

User.hasOne(ResetPwdToken, {
    foreignKey: 'user_id',
    as: 'resetPwdToken',
});

ResetPwdToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Post.belongsToMany(Category, { through: PostCategory });
Category.belongsToMany(Post, {
    through: PostCategory,
});

Comment.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Comment, { foreignKey: 'authorId' });

Comment.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(Comment, { foreignKey: 'postId' });

Like.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Like, { foreignKey: 'authorId' });

Like.belongsTo(Comment, { foreignKey: 'commentId' });
Comment.hasMany(Like, { foreignKey: 'commentId' });

Like.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(Like, { foreignKey: 'postId' });

User.belongsToMany(Post, { through: Favorite });
Post.belongsToMany(User, { through: Favorite });

module.exports = {
    User,
    ResetPwdToken,
    Post,
    Comment,
    Like,
    Category,
    PostCategory,
    Favorite,
};
