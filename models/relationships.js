import { User, ResetPwdToken } from './userModel.js';
import Post from './postModel.js';
import Category from './categoryModel.js';
import PostCategory from './postCategoryModel.js';

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
