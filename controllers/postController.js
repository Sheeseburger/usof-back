const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const Category = require('../models/categoryModel');
const Like = require('../models/likeModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const factory = require('./factoryController');

exports.getAllPosts = factory.getAll(Post);
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
        title,
        content,
        authorId: req.user.id,
    });

    if (req.body.categories && req.body.categories.length > 0) {
        await post.addCategories(req.body.categories);
    }

    res.status(201).json(post);
});

exports.createLike = catchAsync(async (req, res, next) => {
    const otherLikes = await Like.findAll({
        where: {
            authrId: req.user.id,
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
