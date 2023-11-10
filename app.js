import express from 'express';
import path from 'path';

const app = express();

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import adminRoutes from './adminConfig.js';

// Middleware
app.use(express.json({ limit: '10kb' }));
// app.use(express.static(`${__dirname}/public`));
app.use('/img', express.static('public/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/admin', adminRoutes);

// app.all('*', (req, res, next) => {
//     next(new AppError(`Can't find ${req.originalUrl} on this server :#`, 404));
// });

export default app;
