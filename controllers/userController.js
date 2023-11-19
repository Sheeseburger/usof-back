const fs = require('fs');
const path = require('path');
const upload = require('../multerCfg');

const { User } = require('../models/relationships');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryController');

exports.getAllUsers = factory.getAll(User);

exports.getUserById = factory.getById(User);

exports.createUser = catchAsync(async (req, res, next) => {
    if (req.body.password !== req.body.confirmPassword)
        res.status(400).json({ message: 'passwords don`t match' });
    const user = await User.create(req.body);
    res.status(201).json({ status: 'success', data: user });
});

exports.uploadAvatar = catchAsync(async (req, res, next) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err)
            return next(new AppError('Error uploading image: ' + err, 400));
        const imageUrl = path.join('public/uploads/', req.file.filename);

        const user = req.user;
        user.profilePicture = imageUrl;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Avatar uploaded successfully',
        });
    });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    await User.update(req.body, {
        where: { id: req.params.user_id },
    });

    res.status(200).json({
        status: 'success',
    });
});

exports.deleteUser = factory.deleteOne(User);
