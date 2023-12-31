const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const cleanUp = require('./utils/cleanUp');

cleanUp.cleanResetTokens();
cleanUp.cleanUnusedAvatars();

process.on('uncaughtException', (err) => {
    console.log('unchaughtException!! Shutting down server...');
    console.log(err.name, err.message);
    process.exit(1);
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('unhandledRejection!! Shutting down server...');
    console.log(err.name, err.message);

    server.close(() => {
        process.exit(1);
    });
});
