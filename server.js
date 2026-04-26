// Minimal Express backend for a portfolio/freelance website
// Features
// - Serves the frontend from /public
// - POST /api/contact validates input
// - Sends email via SMTP if configured
// - Always logs submissions as a safe fallback

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json({ limit: '256kb' }));

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

function isEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function sanitize(v) {
  if (typeof v !== 'string') return '';
  return v.replace(/[<>]/g, '').trim();
}

app.post('/api/contact', async (req, res) => {
  const name = sanitize(req.body.name);
  const email = sanitize(req.body.email);
  const phone = sanitize(req.body.phone);
  const budget = sanitize(req.body.budget);
  const message = sanitize(req.body.message);

  if (!name || name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
  if (!budget) return res.status(400).json({ error: 'Please select a budget.' });
  if (!message || message.length < 10) return res.status(400).json({ error: 'Please write a short message (10+ chars).' });

  const submission = {
    ts: new Date().toISOString(),
    name,
    email,
    phone,
    budget,
    message
  };

  console.log('New contact submission:', submission);

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.TO_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || smtpUser;

  // If SMTP not configured, still return success so the form UX works during development
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !toEmail) {
    return res.json({ ok: true, note: 'SMTP not configured. Message logged on server only.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const subject = 'New website lead — ' + name + ' (' + budget + ')';
    const text =
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + phone + '\n' +
      'Budget: ' + budget + '\n\n' +
      'Message:\n' + message + '\n';

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject,
      text
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Email send failed:', err);
    return res.status(500).json({ error: 'Message received but email failed. Try again later.' });
  }
});

// SPA fallback (if user refreshes on anchors)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
