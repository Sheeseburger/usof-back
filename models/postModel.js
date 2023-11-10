import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Post = sequelize.define('Post', {
    author: DataTypes.STRING,
    title: DataTypes.STRING,
    publishDate: DataTypes.DATE,
    status: DataTypes.ENUM('active', 'inactive'),
    content: DataTypes.TEXT,
});

export default Post;
