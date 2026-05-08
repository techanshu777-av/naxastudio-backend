const express = require('express');
const router = express.Router();
const Contact = require('../models/ContactModel');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'techanshu777@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// POST /api/contact - Handle contact form submission
router.post('/', async (req, res) => {
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

    // Save to database
    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      budget,
      message
    });

    await contact.save();

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

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email notification sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the response if email fails, just log it
    }

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

    try {
      await transporter.sendMail(confirmationEmail);
      console.log('Confirmation email sent to user');
    } catch (confirmEmailError) {
      console.error('Error sending confirmation email:', confirmEmailError);
      // Don't fail the response if confirmation email fails
    }

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

module.exports = router;
