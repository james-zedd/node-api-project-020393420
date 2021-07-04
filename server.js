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

// Middleware -- cookie parser
// ====================================
app.use(cookieParser());

// Static Folders
// ====================================
app.use(express.static(path.join(__dirname, 'public')));

// Get Routes
// ====================================
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

// User Routes
// ====================================
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

// Middleware -- error handler
// ====================================
app.use(errorHandler);

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  server.close(() => process.exit(1));
})