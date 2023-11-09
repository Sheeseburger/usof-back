const express = require('express');
const path = require('path');

const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const AdminRoutes = require('./adminConfig');
// Middleweare

app.use(express.json({ limit: '10kb' }));
// app.use(express.static(`${__dirname}/public`));
app.use('/img', express.static(path.join(__dirname, 'public/uploads')));

// routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/admin', AdminRoutes);

// app.all('*', (req, res, next) => {
//     next(new AppError(`Can't find ${req.originalUrl} on this server :#`, 404));
// });

module.exports = app;
