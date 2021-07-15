const express = require('express');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

// Load ENV vars
dotenv.config({ path: './config/config.env' });

// Connect to DB
connectDB();

// Middleware -- Body Parser
// ====================================
app.use(express.json());


// Middleware -- morgan
// ====================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware -- file uploading
// ====================================
app.use(fileupload());

// Security -- mongo sanitize
// ====================================
app.use(mongoSanitize());

// Security -- secure headers (helmet)
// ====================================
app.use(helmet());

// Security -- XSS protection
// ====================================
app.use(xss());

// Security -- rate limiting
// ====================================
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
})

app.use(limiter);

// Security -- handle HTTP param pollution
// ====================================
app.use(hpp());

// Security -- CORS
// ====================================
app.use(cors());

// Static Folders
// ====================================
app.use(express.static(path.join(__dirname, 'public')));

// Get Routes
// ====================================
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// User Routes
// ====================================
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth/users', users);
app.use('/api/v1/reviews', reviews);

// Middleware -- error handler
// ====================================
app.use(errorHandler);

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  server.close(() => process.exit(1));
})