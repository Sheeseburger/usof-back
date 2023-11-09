const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize = require('@adminjs/sequelize');

const { User, ResetPwdToken } = require('./models/userModel');
const Post = require('./models/postModel');
const Category = require('./models/categoryModel');
const PostCategory = require('./models/postCategoryModel');
require('./models/relationships');

AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
});
const DEFAULT_ADMIN = {
    email: 'admin@gmail.com',
    password: '123123',
};

const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN);
    } else {
        const user = await User.findOne({ where: { email, role: 'admin' } });
        console.log(await user.verifyPassword(password));
        if (user && (await user.verifyPassword(password))) {
            return Promise.resolve({ email, password });
        }
    }
    return null;
};
const admin = new AdminJS({
    resources: [User, ResetPwdToken, Post, Category, PostCategory],
});

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: 'sessionsecret',
    },
    null
);

module.exports = adminRouter;
