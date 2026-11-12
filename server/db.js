const mongoose = require('mongoose');

let cachedPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb+srv://hasrul0429_db_user:admin123@cluster0.gdmjnoz.mongodb.net/data-siswa?retryWrites=true&w=majority';

  cachedPromise = mongoose
    .connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    })
    .then((conn) => {
      console.log('MongoDB connected successfully to:', conn.connection.name);
      return conn.connection;
    })
    .catch((err) => {
      cachedPromise = null;
      console.error('MongoDB connection error:', err.message);
      throw err;
    });

  return cachedPromise;
}

module.exports = connectDB;
