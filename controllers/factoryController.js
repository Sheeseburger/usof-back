const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
exports.getAll = (Model, options) =>
    catchAsync(async (req, res, next) => {
        let document = {};
        if (options && options.likes) {
            document = await Model.findAll({
                where: { postId: req.params.post_id },
            });
        } else document = await Model.findAll();
        res.status(200).json({
            status: 'success',
            amount: document.length,
            data: document,
        });
    });

exports.getById = (Model) =>
    catchAsync(async (req, res, next) => {
        console.log(req.params);
        const document = await Model.findByPk(
            req.params.user_id ||
                req.params.post_id ||
                req.params.category_id ||
                req.params.comment_id
        );
        if (!document) {
            return res.status(400).json({
                status: 'fail',
                data: 'No document with this id',
            });
        }
        res.status(200).json({ status: 'success', data: document });
    });

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const document = await Model.findByPk(
            req.params.user_id ||
                req.params.post_id ||
                req.params.category_id ||
                req.params.comment_id
        );
        if (!document) {
            return next(new AppError('document not found', 404));
        }

        await document.destroy();

        res.status(204).json();
    });
