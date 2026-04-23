const mongoose = require("mongoose");
const logger = require("../utils/logger");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () =>logger.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));

module.exports = { connectDB };
