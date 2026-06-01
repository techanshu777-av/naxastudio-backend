const { MongoClient } = require('mongodb');

let client;
let database;

async function connectDatabase() {
  if (database) return database;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  const dbName = process.env.MONGODB_DB || 'nexastudio';

  if (!uri) {
    throw new Error('MONGODB_URI or DATABASE_URL is required.');
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('Database URL must start with mongodb:// or mongodb+srv://.');
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);

  await database.collection('contacts').createIndex({ createdAt: -1 });
  await database.collection('contacts').createIndex({ email: 1 });

  return database;
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}

module.exports = {
  connectDatabase,
  closeDatabase,
};
