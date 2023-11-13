const catchAsync = require('./../utils/catchAsync');

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        const document = await Model.findAll();
        res.status(200).json({
            status: 'success',
            amount: document.length,
            data: document,
        });
    });

exports.getById = (Model) =>
    catchAsync(async (req, res, next) => {
        const document = await Model.findByPk(
            req.params.user_id || req.params.post_id
        );
        if (!document) {
            res.status(400).json({
                status: 'fail',
                data: 'No document with this id',
            });
        }
        res.status(200).json({ status: 'success', data: document });
    });
