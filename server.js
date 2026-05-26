const path = require('path');
const express = require('express');
const cors = require('cors');
const loadEnv = require('./config/env');
const { connectDatabase, closeDatabase } = require('./config/database');
const contactRoutes = require('./routes/contactRoutes');

loadEnv();

const app = express();
const port = Number(process.env.PORT) || 5001;
const publicDir = path.join(__dirname, '..', 'public');

app.use(cors());
app.use(express.json({ limit: '25kb' }));
app.use(express.static(publicDir));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'NexaStudio Contact API',
    database: 'mongodb',
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

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
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
    app.listen(port, () => {
      console.log(`NaxaStudio backend running on port ${port}`);
      console.log('API: Node.js + Express + MongoDB');
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

startServer();
