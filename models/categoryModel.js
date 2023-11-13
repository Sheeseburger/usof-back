const { Sequelize } = require('sequelize');
const sequelize = require('../db');

const Category = sequelize.define('Category', {
    title: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: false },
});

module.exports = Category;
