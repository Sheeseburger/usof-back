const { Post, Comment, Category, Like } = require('../models/relationships');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const factory = require('./factoryController');

exports.getAllCategories = factory.getAll(Category);
exports.getCategoryById = factory.getById(Category);

exports.getAllPostForCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByPk(req.params.category_id, {
        include: [{ model: Post, as: 'Posts' }],
    });

    if (!category)
        return res.status(404).json({ error: 'Category not found :(' });
    const posts = category.Posts;
    res.json({
        message: 'success',
        amount: (posts || []).length,
        posts: posts,
    });
});

exports.createCategory = catchAsync(async (req, res, next) => {
    const category = await Category.create(req.body);
    res.status(201).json({ message: 'success', category });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByPk(req.params.category_id);

    if (!category) {
        return res.status(404).json({ error: 'Category not found :(' });
    }

    await category.update(req.body);

    res.json({ message: 'success', category });
});

exports.deleteCategory = factory.deleteOne(Category);
