const { Op } = require('sequelize');
const sequelize = require('../db');
const { Post, Comment, Category, Like } = require('../models/relationships');

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

    if (req.query.status) whereClause.status = req.query.status;
    let categoryIncluder = {
        model: Category,
        attributes: ['id', 'title', 'description'],
    };
    if (category) categoryIncluder.where = { id: category };
    console.log(categoryIncluder);
    const document = await Post.findAll({
        where: whereClause,
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

    res.status(200).json({
        status: 'success',
        amount: (document || []).length,
        data: document,
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

    await post.update(req.body);

    if (req.body.categories && req.body.categories.length > 0) {
        await post.setCategories(req.body.categories);
    }

    res.json({ message: 'success', post });
});

exports.deletePost = factory.deleteOne(Post);

exports.deleteLike = catchAsync(async (req, res, next) => {
    await Like.destroy({
        where: { postId: req.params.post_id, authorId: req.user.id },
    });

    res.status(204).send();
});
