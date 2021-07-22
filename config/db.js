const mongoose = require('mongoose');

const connectDB = async () => {
  const db = await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DATABASE}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });

  console.log(`Mongo DB connected: ${db.connection.name}`.black.bgGreen);
}

module.exports = connectDB;