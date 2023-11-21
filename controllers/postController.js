const { Op } = require('sequelize');
const sequelize = require('../db');
const {
    Post,
    Comment,
    Category,
    Like,
    User,
} = require('../models/relationships');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const factory = require('./factoryController');

exports.getAllPosts = catchAsync(async (req, res, next) => {
    const sortBy = req.query.sortBy || 'likes';
    const sortOrder = req.query.sortOrder || 'desc';

    const { category } = req.query;
    const whereClause = {};

    let startDate = req.query.startDate || new Date('1970-01-01');
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    whereClause.updatedAt = {
        [Op.between]: [startDate, endDate],
    };

    let categoryIncluder = {
        model: Category,
        attributes: ['id', 'title', 'description'],
    };

    if (category) categoryIncluder.where = { id: category };
    let inactivePosts = { status: 'active' };

    if (req.user && req.user.role != 'admin') {
        inactivePosts = {
            [Op.or]: [
                { status: 'active' },
                { status: 'inactive', authorId: req.user.id },
            ],
        };
    } else if (req.user && req.user.role === 'admin') {
        inactivePosts = {
            [Op.or]: [{ status: 'active' }, { status: 'inactive' }],
        };
    }

    if (req.query.status) {
        inactivePosts = {};
        inactivePosts.status = req.query.status || 'active';
    }

    const document = await Post.findAll({
        // limit: pageSize,
        // offset,

        where: whereClause,
        where: inactivePosts,
        include: [
            {
                model: Like,
                attributes: [],
            },
            categoryIncluder,
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(
                        '(SELECT COUNT(*) FROM Likes WHERE Likes.postId = Post.id)'
                    ),
                    'likeCount',
                ],
            ],
        },
        order: [[sortBy === 'likes' ? 'likeCount' : sortBy, sortOrder]],
        group: ['Post.id', 'Categories.id'],
    });
    const pageNumber = req.query.pageNumber ? req.query.pageNumber * 1 : 1;
    const pageSize = req.query.pageSize ? req.query.pageSize * 1 : 10;

    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedPosts = document.slice(startIndex, endIndex);

    res.status(200).json({
        status: 'success',
        totalPosts: (document || []).length,
        currentPage: pageNumber,
        pageSize,
        data: paginatedPosts,
    });
});
exports.getPostById = factory.getById(Post);

exports.getAllComments = catchAsync(async (req, res, next) => {
    const comments = await Comment.findAll({
        where: { postId: req.params.post_id },
    });
    res.status(200).json({
        status: 'success',
        amount: comments.length,
        data: comments,
    });
});

exports.createComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.create({
        content: req.body.content,
        postId: req.params.post_id,
        authorId: req.user.id,
    });

    res.status(201).json({
        message: 'success',
        comment,
    });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const post = await Post.findByPk(req.params.post_id, {
        include: [{ model: Category, as: 'Categories' }],
    });
    if (!post) {
        res.status(404).json({
            message: 'Post wasn`t found :(',
        });
    }
    res.status(200).json({
        status: 'success',
        amount: (post.Categories || []).length,
        data: post.Categories,
    });
});

exports.getAllLikes = factory.getAll(Like, { likes: true });

exports.createPost = catchAsync(async (req, res, next) => {
    const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        authorId: req.user.id,
        status: req.body.status,
    });

    if (req.body.categories && req.body.categories.length > 0) {
        await post.addCategories(req.body.categories);
    }

    res.status(201).json(post);
});

exports.createLike = catchAsync(async (req, res, next) => {
    const otherLikes = await Like.findAll({
        where: {
            authorId: req.user.id,
            postId: req.params.post_id,
        },
    });
    if (otherLikes && otherLikes.length > 0) {
        return res.status(400).json({ message: 'You already liked it :(' });
    }
    const like = await Like.create({
        type: req.body.type,
        authorId: req.user.id,
        postId: req.params.post_id,
    });
    const post = await Post.findByPk(req.params.post_id);
    const postAuthor = await User.findByPk(post.authorId);
    if (like.type === 'like') {
        postAuthor.rating += 1;
    } else postAuthor.rating -= 1;

    await postAuthor.save();

    res.status(201).json({
        message: 'success',
        like,
    });
});

exports.updatePost = catchAsync(async (req, res, next) => {
    const post = await Post.findByPk(req.params.post_id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.authorId !== req.user.id) {
        return res.status(403).json({
            error: 'Only the creator can update the post',
        });
    }
    if (!req.body.status) {
        return res.status(400).json({
            error: 'Only status can be changed',
        });
    }
    await post.update(req.body.status);

    if (req.body.categories && req.body.categories.length > 0) {
        await post.setCategories(req.body.categories);
    }

    res.json({ message: 'success', post });
});

exports.deletePost = factory.deleteOne(Post);

exports.deleteLike = catchAsync(async (req, res, next) => {
    const like = await Like.findOne({
        where: { postId: req.params.post_id, authorId: req.user.id },
    });
    if (!like) return res.status(400).json({ message: 'like dosnt exists :(' });
    const post = await Post.findByPk(req.params.post_id);
    const postAuthor = await User.findByPk(post.authorId);
    if (like.type === 'like') {
        postAuthor.rating -= 1;
    } else postAuthor.rating += 1;

    await postAuthor.save();

    await like.destroy();

    res.status(204).send();
});
