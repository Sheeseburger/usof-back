const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Comment = sequelize.define('Comment', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});

module.exports = Comment;
