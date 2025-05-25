const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectat la MongoDB');
  } catch (error) {
    console.error('Eroare conexiune MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;