const config = require('../config');
const mongoose = require('mongoose');

connectMongo = () => {
  let dev_db_url = config.DATABASE_CONNECTION;
  const mongoDB = process.env.MONGODB_URI || dev_db_url;
  mongoose.connect(mongoDB);
  mongoose.Promise = global.Promise;
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.on('open', console.log.bind(console, 'MongoDB connected'));
};

module.exports = connectMongo;
