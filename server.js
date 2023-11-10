import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('uncaughtException', (err) => {
    console.log('uncaughtException!! Shutting down server...');
    console.log(err.name, err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.log('unhandledRejection!! Shutting down server...');
    console.log(err.name, err.message);

    server.close(() => {
        process.exit(1);
    });
});
