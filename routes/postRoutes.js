const postController = require('../controllers/postController');

const express = require('express');

const authController = require('../controllers/authController');
const router = express.Router();

router.get('/', postController.getAllPosts);
router.get('/:post_id', postController.getPostById);
module.exports = router;
