import express from 'express';
import morgan from 'morgan';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

const app = express();

// middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// routes
app.get('/', (req, res, next) => {
  next(new AppError('This route is not yet defined!', 404));
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

export default app;
