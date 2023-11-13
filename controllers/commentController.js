const { Comment, Like } = require('../models/relationships');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const factory = require('./factoryController');

exports.getAllComments = factory.getAll(Comment);

exports.getComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findByPk(req.params.comment_id);
    if (!comment)
        return res.status(400).json({
            message: 'Cant find this comment :(',
        });
    res.json({ message: 'success', comment });
});

exports.getLikeForComment = catchAsync(async (req, res, next) => {
    const likes = await Like.findAll({
        where: { commentId: req.params.comment_id },
    });
    res.json({
        message: 'success',
        amount: (likes || []).length,
        likes,
    });
});
exports.addLikeToComment = catchAsync(async (req, res, next) => {
    const like = await Like.findAll({
        where: { authorId: req.user.id, commentId: req.params.comment_id },
    });
    if (like && like.length > 0)
        res.status(400).json({ message: 'You already liked this comment' });
    like = await Like.create({
        type: req.body.type,
        authorId: req.user.id,
        commentId: req.params.comment_id,
    });
    res.status(201).json({
        message: 'success',
        like,
    });
});

exports.updateComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findByPk(req.params.comment_id);

    if (!comment)
        return res.status(400).json({ message: 'fail to find comment :(' });
    await comment.update({
        status: req.body.status || comment.status,
    });
    res.status(201).json({ message: 'success', comment });
});

exports.deleteComment = factory.deleteOne(Comment);

exports.deleteLikeFromComment = catchAsync(async (req, res, next) => {
    await Like.destroy({
        where: { commentId: req.params.comment_id, authorId: req.user.id },
    });
    res.status(204).json();
});
