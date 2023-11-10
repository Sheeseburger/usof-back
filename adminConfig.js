import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSSequelize from '@adminjs/sequelize';

import { User, ResetPwdToken } from './models/userModel.js';
import Post from './models/postModel.js';
import Category from './models/categoryModel.js';
import PostCategory from './models/postCategoryModel.js';
import './models/relationships.js';

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
const validate = (request, context) => {
    console.log('HEL');
    if (request.method != 'post') return request;
    console.log('HELLLLLLLLLLLLLLLLLLLLLLLLLLLL');
    return request;
};
const admin = new AdminJS({
    resources: [
        User,
        ResetPwdToken,
        {
            resource: Post,
            options: {
                properties: {
                    categories: {
                        type: 'reference',
                        reference: 'Categories',
                        isArray: true,
                    },
                },
                actions: {
                    new: {
                        before: [validate],
                    },
                },
            },
        },
        Category,
        PostCategory,
    ],
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

export default adminRouter;
