const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./userModel');
const Comment = require('./commentModel');
const Post = require('./postModel');
const Like = sequelize.define('Like', {
    type: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false,
    },
    // publishDate: {
    //     type: DataTypes.DATE,
    //     allowNull: false,
    // },
});

module.exports = Like;
