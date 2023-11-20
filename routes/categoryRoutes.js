const express = require('express');

const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const router = express.Router();
router.use(authController.protected);
router
    .route('/')
    .get(categoryController.getAllCategories)
    .post(categoryController.createCategory);

router
    .route('/:category_id')
    .get(categoryController.getCategoryById)
    .patch(
        authController.restrictTo('admin'),
        categoryController.updateCategory
    )
    .delete(
        authController.restrictTo('admin'),
        categoryController.deleteCategory
    );

router.get('/:category_id/posts', categoryController.getAllPostForCategory);

module.exports = router;
