import fs from 'fs';
import path from 'path';
import upload from '../multerCfg.js';

import { User } from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.findAll();
    res.status(200).json({
        status: 'success',
        amount: users.length,
        data: users,
    });
});

export const getUserById = catchAsync(async (req, res, next) => {
    console.log(req.params);
    const user = await User.findByPk(req.params.user_id);
    if (!user) {
        res.status(400).json({ status: 'fail', data: 'No user with this id' });
    }
    res.status(200).json({ status: 'success', data: user });
});

export const createUser = catchAsync(async (req, res, next) => {
    if (req.body.password !== req.body.confirmPassword)
        res.status(400).json({ message: 'passwords don`t match' });
    const user = await User.create(req.body);
    res.status(201).json({ status: 'success', data: user });
});

export const uploadAvatar = catchAsync(async (req, res, next) => {
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

export const updateUser = catchAsync(async (req, res, next) => {
    await User.update(req.body, {
        where: { id: req.params.user_id },
    });

    res.status(200).json({
        status: 'success',
    });
});

export const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.user_id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    await user.destroy();

    res.status(204).json();
});
