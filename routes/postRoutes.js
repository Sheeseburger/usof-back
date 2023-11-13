const postController = require('../controllers/postController');

const express = require('express');

const authController = require('../controllers/authController');
const router = express.Router();

router
    .route('/')
    .get(postController.getAllPosts)
    .post(authController.protected, postController.createPost)
    .delete(authController.protected, postController.deletePost);

router
    .route('/:post_id')
    .get(postController.getPostById)
    .patch(authController.protected, postController.updatePost);

router.use(authController.protected);

router
    .route('/:post_id/comments')
    .get(postController.getAllComments)
    .post(authController.protected, postController.createComment);

router.get('/:post_id/categories', postController.getAllCategories);

router
    .route('/:post_id/likes')
    .get(postController.getAllLikes)
    .post(postController.createLike)
    .delete(postController.deleteLike);

module.exports = router;
