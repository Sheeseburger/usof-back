import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from './../db.js';

const User = sequelize.define('User', {
    login: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    fullName: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true,
            is: /^[a-zA-Z ]+$/,
            len: [2, 20],
        },
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    profilePicture: {
        type: Sequelize.STRING,
    },
    rating: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    role: {
        type: Sequelize.ENUM('admin', 'user'),
        defaultValue: 'user',
    },
});

const hashPassword = async (password) => {
    console.log(password);
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

User.beforeCreate(async (user) => {
    user.password = await hashPassword(user.password);
});
User.beforeSave(async (user) => {
    if (user.changed('password')) {
        user.password = await hashPassword(user.password);
    }
});

User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const ResetPwdToken = sequelize.define('resetPwdToken', {
    reset_token: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: false,
    },
});

export { User, ResetPwdToken };
