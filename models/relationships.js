const { User, ResetPwdToken } = require('./userModel');
const Post = require('./postModel');
const Category = require('./categoryModel');
const PostCategory = require('./postCategoryModel');

User.hasOne(ResetPwdToken, {
    foreignKey: 'user_id',
    as: 'resetPwdToken',
});

ResetPwdToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

Post.belongsToMany(Category, { through: PostCategory });
Category.belongsToMany(Post, { through: PostCategory });