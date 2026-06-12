const express = require('express');
const { buildContactDocument } = require('../models/contactModel');

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/', asyncHandler(async (req, res) => {
  if (!req.app.locals.db) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please try again in a moment.',
    });
  }

  const contact = buildContactDocument(req.body, req);

  if (!contact.name || !contact.email || !contact.phone || !contact.service || !contact.message) {
    return res.status(400).json({
      success: false,
      message: 'Please fill name, email, phone, service, and message.',
    });
  }

  if (!isEmail(contact.email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
  }

  const result = await req.app.locals.db.collection('contacts').insertOne(contact);

  return res.status(201).json({
    success: true,
    message: 'Thank you. Your message has been saved and we will contact you soon.',
    id: result.insertedId,
  });
}));

router.get('/', asyncHandler(async (req, res) => {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.get('x-admin-key');

  if (!adminKey || providedKey !== adminKey) {
    return res.status(404).json({
      success: false,
      message: 'API route not found.',
    });
  }

  const leads = await req.app.locals.db
    .collection('contacts')
    .find({}, { projection: { meta: 0 } })
    .sort({ createdAt: -1 })
    .limit(25)
    .toArray();

  return res.json({
    success: true,
    count: leads.length,
    leads,
  });
}));

module.exports = router;
