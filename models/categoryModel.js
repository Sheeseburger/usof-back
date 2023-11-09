const { Sequelize } = require('sequelize');
const sequelize = require('../db');

const Category = sequelize.define('Category', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
});

module.exports = Category;
