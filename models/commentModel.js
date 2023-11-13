const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./userModel');

const Comment = sequelize.define('Comment', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // publishDate: {
    //     type: DataTypes.DATE,
    //     allowNull: false,
    // },
});

module.exports = Comment;
