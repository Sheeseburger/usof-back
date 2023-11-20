const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Like = sequelize.define('Like', {
    type: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false,
    },
});

module.exports = Like;
