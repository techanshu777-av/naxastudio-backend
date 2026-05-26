const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'nexastudio';

let client;
let database;

async function connectDatabase() {
  if (database) return database;

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
