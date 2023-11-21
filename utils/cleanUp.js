const { Op } = require('sequelize');
const fs = require('fs/promises');
const path = require('path');

const { User, ResetPwdToken } = require('../models/relationships');

exports.cleanResetTokens = () => {
    setInterval(async () => {
        try {
            console.log('cleaning resetToken');
            const thresholdTime = new Date(Date.now() - 5 * 60 * 1000);
            await ResetPwdToken.destroy({
                where: {
                    createdAt: {
                        [Op.lt]: thresholdTime,
                    },
                },
            });
        } catch (error) {
            console.error('Error cleaning up ResetPwdTokens:', error);
        }
    }, 1000 * 30);
};

exports.cleanUnusedAvatars = () => {
    setInterval(async () => {
        try {
            console.log('cleaning avatars');
            const avatarDirectory = 'public/uploads';
            const allAvatars = await fs.readdir(avatarDirectory);

            const userAvatars = await User.findAll({
                attributes: ['profilePicture'],
            });

            const userAvatarFilenames = userAvatars.map((user) => user.avatar);

            const orphanedAvatars = allAvatars.filter(
                (avatar) => !userAvatarFilenames.includes(avatar)
            );

            await Promise.all(
                orphanedAvatars.map(async (filename) => {
                    const filePath = path.join(avatarDirectory, filename);
                    await fs.unlink(filePath);
                })
            );
        } catch (error) {
            console.error('Error cleaning up orphaned avatars:', error);
        }
    }, 1000 * 30);
};
