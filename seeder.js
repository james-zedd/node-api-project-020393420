const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// load env variables
dotenv.config({ path: './config/config.env' });

console.log('seeder.js running ... '.white.inverse);

// connect to DB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DATABASE}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});


// read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));

const importData = async () => {
  console.log('import data process running ...');
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);

    console.log('Data imported!'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  console.log('delete data process running ...');
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === 'import') {
  importData();
}

if (process.argv[2] === 'delete') {
  deleteData();
}