// const bcrypt = require('bcrypt');
const { promisify } = require('util');
const { Op } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { User, ResetPwdToken } = require('../models/relationships');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.register = catchAsync(async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
        return res.status(400).json({ message: 'Email is already registered' });
    }

    const newUser = await User.create({
        login: req.body.login,
        email: req.body.email,
        password: req.body.password,
        fullName: req.body.fullName,
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res) => {
    // maybe ADD email check when login
    const { login = '', password, email = '' } = req.body;

    const user = await User.findOne({
        where: {
            [Op.or]: { login, email },
        },
    });

    if (!user || !(await user.verifyPassword(password)))
        return res.status(401).json({ message: 'Invalid credentials' });
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'something went wrong' });
    }
};

exports.sendPasswordResetEmail = catchAsync(async (req, res) => {
    const { email } = req.body;

    let user = await User.findOne({ where: { email } });

    if (!user) {
        return res
            .status(404)
            .json({ message: 'There is no user with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await ResetPwdToken.create({
        reset_token: resetToken,
        passwordResetExpires: new Date(Date.now() + 5 * 60 * 1000),
        user_id: user.id,
    });
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/auth/password-reset/${resetToken}`;
    console.log(user.email);
    const message = `Forgot your password? Submit a patch request with your new password to: ${resetURL}">${resetURL}</a>`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.USER_GMAIL,
            pass: process.env.PASSWORD_GMAIL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
        },
    });
    const mailOptions = {
        from: process.env.USER_GMAIL,
        to: user.email,
        subject: 'Password Reset (5 minutes)',
        text: message,
        html: `<a href=${resetURL}>${resetURL}</a>`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
        status: 'success',
        message: 'Check email!',
    });
});

exports.confirmPasswordReset = catchAsync(async (req, res, next) => {
    const resetToken = await ResetPwdToken.findOne({
        where: {
            reset_token: req.params.confirm_token,
            passwordResetExpires: { [Op.gt]: new Date() },
        },
    });
    if (!resetToken) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    const user = await User.findByPk(resetToken.user_id);
    if (!user)
        return next(new AppError('Can find user for this token :(', 400));

    user.password = req.body.password;
    await user.save();
    await resetToken.destroy();

    createSendToken(user, 201, res);
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You dont have permision :(', 403));
        }
        next();
    };
};

exports.protected = catchAsync(async (req, res, next) => {
    if (req.headers.cookie && req.headers.cookie.search(/authorization/) >= 0) {
        req.headers['authorization'] = req.headers.cookie
            .slice(req.headers.cookie.search('authorization'))
            .replace('authorization=', '');
    }
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    )
        token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return next(new AppError('You are not logged in', 401));
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findByPk(decoded.id);
    if (!freshUser || !freshUser.login) {
        return next(new AppError('This user was deleted', 401));
    }

    req.user = freshUser;
    next();
});

exports.PostAllProtection = catchAsync(async (req, res, next) => {
    if (req.headers.cookie && req.headers.cookie.search(/authorization/) >= 0) {
        req.headers['authorization'] = req.headers.cookie
            .slice(req.headers.cookie.search('authorization'))
            .replace('authorization=', '');
    }
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    )
        token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return next();
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findByPk(decoded.id);
    if (!freshUser || !freshUser.login) {
        return next(new AppError('This user was deleted', 401));
    }

    req.user = freshUser;
    next();
});
