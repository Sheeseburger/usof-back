const Post = require('./../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');

exports.getAllPosts = factory.getAll(Post);
exports.getPostById = factory.getById(Post);
