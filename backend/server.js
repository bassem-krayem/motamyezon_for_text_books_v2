import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config();

const PORT = process.env.PORT;

mongoose.connect(process.env.DB, { dbName: 'motamyezon' }).then(() => {
  console.log(
    'DB successfully connected to: ',
    mongoose.connection.db.databaseName,
  );
});

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default server;
