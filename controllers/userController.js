const fs = require('fs');
const path = require('path');
const upload = require('../multerCfg');

const { User } = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.findAll();
    res.status(200).json({
        status: 'success',
        amount: users.length,
        data: users,
    });
});

exports.getUserById = catchAsync(async (req, res, next) => {
    console.log(req.params);
    const user = await User.findByPk(req.params.user_id);
    if (!user) {
        res.status(400).json({ status: 'fail', data: 'No user with this id' });
    }
    res.status(200).json({ status: 'success', data: user });
});

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

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.user_id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    await user.destroy();

    res.status(204).json();
});
