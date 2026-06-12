const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const loadEnv = require('./config/env');
const { connectDatabase, closeDatabase } = require('./config/database');
const contactRoutes = require('./routes/contactRoutes');

loadEnv();

const app = express();
const port = Number(process.env.PORT) || 5001;
const publicDir = path.join(__dirname, '..', 'public');
const publicIndex = path.join(publicDir, 'index.html');
const hasFrontend = fs.existsSync(publicIndex);

app.use(cors());
app.use(express.json({ limit: '25kb' }));
if (hasFrontend) {
  app.use(express.static(publicDir));
}

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'NexaStudio Contact API',
    database: app.locals.db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/contact', contactRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.',
  });
});

app.get('/', (req, res) => {
  if (hasFrontend) {
    return res.sendFile(publicIndex);
  }

  return res.json({
    success: true,
    service: 'NaxaStudio Backend',
    health: '/api/health',
    contact: '/api/contact',
  });
});

app.get('*', (req, res) => {
  if (hasFrontend) {
    return res.sendFile(publicIndex);
  }

  return res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Server error. Please try again later.',
  });
});

async function startServer() {
  try {
    app.locals.db = await connectDatabase();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    app.locals.db = null;
  }

  app.listen(port, () => {
    console.log(`NaxaStudio backend running on port ${port}`);
    console.log('API: Node.js + Express + MongoDB');
  });
}

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

startServer();
