const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://hasrul0429_db_user:admin123@cluster0.gdmjnoz.mongodb.net/data-siswa?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('MongoDB connected successfully to:', conn.connection.name);
    return conn.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

module.exports = connectDB;
