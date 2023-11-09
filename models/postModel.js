// post.js

const { Sequelize } = require('sequelize');
const sequelize = require('../db');

const Post = sequelize.define('Post', {
    author: Sequelize.STRING,
    title: Sequelize.STRING,
    publishDate: Sequelize.DATE,
    status: Sequelize.ENUM('active', 'inactive'),
    content: Sequelize.TEXT,
});

module.exports = Post;
