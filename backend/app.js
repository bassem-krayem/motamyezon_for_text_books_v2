// importing the modules errors and routes ...
// importing express and middlewares
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import path from 'path';
// importing the error staff
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
// importing the routes to mount them in there resource
import userRouter from './routes/userRoutes.js';
import authorRouter from './routes/authorRoutes.js';
import seriesRouter from './routes/seriesRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import bookRouter from './routes/bookRoutes.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, 'docs/openapi.yaml'));

const app = express();

// middlewares
// 1. Set security HTTP headers
app.use(helmet());
app.use(cors());

// 2. Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// 4. Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 5. Data sanitization against XSS
app.use(xss());

// express.json() is a middleware that parses the incoming request with JSON payloads
// express.urlencoded() is a middleware that parses the incoming request with urlencoded payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// 6. Cookie parser
app.use(cookieParser());

// routes
app.get('/', (req, res, next) => {
  next(new AppError('This route is not yet defined!', 404));
});

// Mounting the routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/authors', authorRouter);
app.use('/api/v1/series', seriesRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/books', bookRouter);

// Swagger API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui { background: #fff; }',
    customSiteTitle: 'Motamyezon Books API Documentation',
  }),
);

// 404 route not found  handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
