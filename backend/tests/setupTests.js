import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
// eslint-disable-next-line
import { request } from 'chai-http';
import app from '../app.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export function setupTestDB() {
  before(async () => {
    await mongoose.connect(process.env.DB, {
      dbName: 'testDB',
    });
    console.log(
      '✅ The test DB successfully connected to:',
      mongoose.connection.db.databaseName,
    );
  });

  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    console.log('🗑️ The test DB successfully dropped');
  });
}

export function setupServer() {
  let server;
  let requester;

  before(() => {
    server = app.listen(4543, () => {
      console.log('Test server running on port 4543');
    });
    requester = request.execute(server).keepOpen();
  });

  after(() => {
    requester.close();
    console.log('Test server closed');
  });
  return {
    get server() {
      return server;
    },

    get requester() {
      return requester;
    },
  };
}
