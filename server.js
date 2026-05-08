const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.netlify.app', process.env.CLIENT_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Email transporter setup
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'techanshu777@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NexaStudio API is running'
  });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, budget, message } = req.body;

    // Validation
    if (!name || !email || !budget || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields'
      });
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    // Prepare email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Budget:</strong> ${getBudgetLabel(budget)}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
    `;

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER || 'techanshu777@gmail.com',
      to: process.env.NOTIFICATION_EMAIL || 'techanshu777@gmail.com',
      subject: `New Contact Form: ${name} - NexaStudio`,
      html: emailContent
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    const confirmationEmail = {
      from: process.env.EMAIL_USER || 'techanshu777@gmail.com',
      to: email,
      subject: 'Thank you for contacting NexaStudio',
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message details:</strong></p>
        <p>${message}</p>
        <p>Best regards,<br>NexaStudio Team</p>
      `
    };

    await transporter.sendMail(confirmationEmail);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will contact you soon!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Helper function to get budget label
function getBudgetLabel(budget) {
  const budgetLabels = {
    'under_15k': 'Under ₹15,000',
    '15k_50k': '₹15,000–₹50,000',
    '50k_150k': '₹50,000–₹1,50,000',
    '150k_plus': '₹1,50,000+'
  };
  return budgetLabels[budget] || budget;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});