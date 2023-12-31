const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize = require('@adminjs/sequelize');

const {
    User,
    ResetPwdToken,
    Post,
    Category,
    Comment,
    Like,
    PostCategory,
} = require('./models/relationships');

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
        try {
            const user = await User.findOne({
                where: { email, role: 'admin' },
            });
            if (user && (await user.verifyPassword(password))) {
                return Promise.resolve({ email, password });
            }
        } catch (error) {
            return null;
        }
    }
    return null;
};

const createRelation = async (request) => {
    if (request.record.params) {
        const { id } = request.record.params;
        console.log(request.record.params);
        for (const key in request.record.params) {
            if (key.startsWith('categories.')) {
                const CategoryId = request.record.params[key];
                const post = await Post.findByPk(id);
                console.log(id, CategoryId);
                await post.addCategory(CategoryId);
            }
        }
    }

    return request;
};

const localProvider = {
    bucket: 'public/uploads',
    opts: {
        baseUrl: '/files',
    },
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
                        isVisible: {
                            edit: true,
                            show: true,
                            list: false,
                            filter: false,
                        },
                    },
                    comments: {
                        type: 'reference',
                        reference: 'Comments',
                        isArray: true,
                        isVisible: {
                            edit: false,
                            show: true,
                            list: false,
                            filter: false,
                        },
                    },
                    likes: {
                        type: 'reference',
                        reference: 'Likes',
                        isArray: true,
                        edit: false,
                        isVisible: {
                            edit: false,
                            show: true,
                            list: false,
                            filter: false,
                        },
                    },
                    authorId: {
                        show: false,
                        edit: false,
                    },
                },

                actions: {
                    new: {
                        after: [createRelation],
                    },
                },
            },
        },
        Category,
        Comment,
        Like,
        {
            resource: PostCategory,
            options: {
                properties: {
                    categories: {
                        type: 'reference',
                        reference: 'Categories',
                    },
                    posts: {
                        type: 'reference',
                        reference: 'Posts',
                    },
                },
            },
        },
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

module.exports = adminRouter;
