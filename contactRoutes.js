const express = require('express');
const { buildContactDocument } = require('../models/contactModel');

const router = express.Router();

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/', async (req, res) => {
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
});

router.get('/', async (req, res) => {
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
});

module.exports = router;
