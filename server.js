const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

// Middleware
app.use(express.json());
app.use(cors());

// Initialize submissions file if it doesn't exist
if (!fs.existsSync(SUBMISSIONS_FILE)) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NexaStudio API is running',
    timestamp: new Date().toISOString()
  });
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
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

    // Create submission object
    const submission = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      budget: budget,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Read existing submissions
    const submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    
    // Add new submission
    submissions.push(submission);
    
    // Save to file
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));

    // Log to console
    console.log('New contact form submission:', {
      name: submission.name,
      email: submission.email,
      budget: submission.budget,
      timestamp: submission.timestamp
    });

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

// Get all submissions (optional - for admin use)
app.get('/api/submissions', (req, res) => {
  try {
    const submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    res.json({
      success: true,
      count: submissions.length,
      submissions: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submissions'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
