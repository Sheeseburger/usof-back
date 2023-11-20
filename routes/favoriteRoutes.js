const express = require('express');

const authController = require('../controllers/authController');
const favoriteController = require('../controllers/favoriteContoller');
const router = express.Router();

router.use(authController.protected);

router.route('/').get(favoriteController.getAll);

router
    .route('/:post_id')
    .post(favoriteController.addToFavorites)
    .delete(favoriteController.removeFromFavorites);
module.exports = router;
