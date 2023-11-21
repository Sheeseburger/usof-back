const express = require('express');
const path = require('path');

const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

require('./models/relationships');
const AdminRoutes = require('./adminConfig');

// const AppError = require('./utils/appError');
// Middleweare

app.use(express.json({ limit: '10kb' }));
// app.use(express.static(`${__dirname}/public`));
app.use('/img', express.static(path.join(__dirname, 'public/uploads')));

// routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/admin', AdminRoutes);
app.use('/api/favorite', favoriteRoutes);
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server :#`, 404));
});

module.exports = app;
