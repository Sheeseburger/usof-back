const express = require('express');

const authController = require('../controllers/authController');

const commentController = require('../controllers/commentController');
const router = express.Router();
router.use(authController.protected());

router.get('/', commentController.getAllComments);
router
    .route('/:comment_id')
    .get(commentController.getComment)
    .patch(commentController.updateComment)
    .delete(commentController.deleteComment);

router
    .route('/:comment_id/like')
    .get(commentController.getLikeForComment)
    .post(commentController.addLikeToComment)
    .delete(commentController.deleteLikeFromComment);

module.exports = router;
