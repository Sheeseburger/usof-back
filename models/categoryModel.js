import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Category = sequelize.define('Category', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
});

export default Category;
