const { Favorite, Post, User } = require('../models/relationships');
const catchAsync = require('../utils/catchAsync');
exports.getAll = catchAsync(async (req, res) => {
    try {
        const favorites = await req.user.getPosts();

        return res.status(200).json(favorites);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

exports.addToFavorites = catchAsync(async (req, res) => {
    const post = await Post.findByPk(req.params.post_id);
    if (!post) {
        return res.status(404).json({ error: 'post not found' });
    }
    await req.user.addPost(post);
    return res
        .status(200)
        .json({ message: 'Post added to favorites', Favorite });
});

exports.removeFromFavorites = catchAsync(async (req, res) => {
    const postId = req.params.post_id;

    const favoritePost = await Favorite.findOne({
        where: { postId, userId: req.user.id },
    });

    if (!favoritePost) {
        return res.status(404).json({ error: 'User or post not found' });
    }

    await favoritePost.destroy();
    return res.status(204).json();
});
